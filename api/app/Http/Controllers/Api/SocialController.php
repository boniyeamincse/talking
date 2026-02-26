<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\Block;
use App\Models\Follow;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SocialController extends BaseController
{
    /**
     * Follow a user
     */
    public function follow(Request $request, $id): JsonResponse
    {
        $authUser = $request->user();
        $targetUser = User::findOrFail($id);

        // Cannot follow self
        if ($authUser->id === $targetUser->id) {
            return $this->errorResponse('You cannot follow yourself', null, 422);
        }

        // Check if blocked
        if ($authUser->hasBlockedOrIsBlockedBy($targetUser)) {
            return $this->errorResponse('Cannot follow this user', null, 403);
        }

        // Check if already following
        if ($authUser->isFollowing($targetUser)) {
            return $this->errorResponse('You are already following this user', null, 422);
        }

        try {
            DB::beginTransaction();

            // Create follow relationship
            Follow::create([
                'follower_id' => $authUser->id,
                'following_id' => $targetUser->id,
            ]);

            // Update counts
            $authUser->profile->increment('following_count');
            $targetUser->profile->increment('followers_count');

            DB::commit();

            // TODO: Dispatch notification job

            return $this->successResponse([
                'following' => true,
                'followers_count' => $targetUser->profile->fresh()->followers_count,
                'following_count' => $authUser->profile->fresh()->following_count,
            ], 'Successfully followed user');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to follow user: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Unfollow a user
     */
    public function unfollow(Request $request, $id): JsonResponse
    {
        $authUser = $request->user();
        $targetUser = User::findOrFail($id);

        // Cannot unfollow self
        if ($authUser->id === $targetUser->id) {
            return $this->errorResponse('Invalid operation', null, 422);
        }

        // Check if following
        if (!$authUser->isFollowing($targetUser)) {
            return $this->errorResponse('You are not following this user', null, 422);
        }

        try {
            DB::beginTransaction();

            // Remove follow relationship
            Follow::where('follower_id', $authUser->id)
                ->where('following_id', $targetUser->id)
                ->delete();

            // Update counts
            $authUser->profile->decrement('following_count');
            $targetUser->profile->decrement('followers_count');

            DB::commit();

            return $this->successResponse([
                'following' => false,
                'followers_count' => $targetUser->profile->fresh()->followers_count,
                'following_count' => $authUser->profile->fresh()->following_count,
            ], 'Successfully unfollowed user');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to unfollow user: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get user's followers
     */
    public function followers(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $perPage = $request->input('per_page', 20);
        
        $followers = $user->followers()
            ->with(['profile'])
            ->where('status', 'active')
            ->paginate($perPage);

        // Add is_following flag for each follower
        $authUser = $request->user();
        $followers->getCollection()->transform(function ($follower) use ($authUser) {
            $follower->is_following = $authUser->isFollowing($follower);
            $follower->is_followed_by = $authUser->isFollowedBy($follower);
            return $follower;
        });

        return $this->paginatedResponse($followers);
    }

    /**
     * Get user's following
     */
    public function following(Request $request, $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        $perPage = $request->input('per_page', 20);
        
        $following = $user->following()
            ->with(['profile'])
            ->where('status', 'active')
            ->paginate($perPage);

        // Add is_following flag for each user
        $authUser = $request->user();
        $following->getCollection()->transform(function ($followedUser) use ($authUser) {
            $followedUser->is_following = $authUser->isFollowing($followedUser);
            $followedUser->is_followed_by = $authUser->isFollowedBy($followedUser);
            return $followedUser;
        });

        return $this->paginatedResponse($following);
    }

    /**
     * Block a user
     */
    public function block(Request $request, $id): JsonResponse
    {
        $authUser = $request->user();
        $targetUser = User::findOrFail($id);

        // Cannot block self
        if ($authUser->id === $targetUser->id) {
            return $this->errorResponse('You cannot block yourself', null, 422);
        }

        // Check if already blocked
        if ($authUser->hasBlocked($targetUser)) {
            return $this->errorResponse('You have already blocked this user', null, 422);
        }

        try {
            DB::beginTransaction();

            // Create block relationship
            Block::create([
                'blocker_id' => $authUser->id,
                'blocked_id' => $targetUser->id,
            ]);

            // Remove follow relationships if they exist
            Follow::where(function ($query) use ($authUser, $targetUser) {
                $query->where('follower_id', $authUser->id)
                    ->where('following_id', $targetUser->id);
            })->orWhere(function ($query) use ($authUser, $targetUser) {
                $query->where('follower_id', $targetUser->id)
                    ->where('following_id', $authUser->id);
            })->delete();

            // Update follower counts if needed
            if ($authUser->isFollowing($targetUser)) {
                $authUser->profile->decrement('following_count');
                $targetUser->profile->decrement('followers_count');
            }
            if ($targetUser->isFollowing($authUser)) {
                $targetUser->profile->decrement('following_count');
                $authUser->profile->decrement('followers_count');
            }

            DB::commit();

            return $this->successResponse([
                'blocked' => true,
            ], 'User blocked successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to block user: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Unblock a user
     */
    public function unblock(Request $request, $id): JsonResponse
    {
        $authUser = $request->user();
        $targetUser = User::findOrFail($id);

        // Check if blocked
        if (!$authUser->hasBlocked($targetUser)) {
            return $this->errorResponse('You have not blocked this user', null, 422);
        }

        try {
            // Remove block relationship
            Block::where('blocker_id', $authUser->id)
                ->where('blocked_id', $targetUser->id)
                ->delete();

            return $this->successResponse([
                'blocked' => false,
            ], 'User unblocked successfully');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to unblock user: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get blocked users list
     */
    public function blockedUsers(Request $request): JsonResponse
    {
        $authUser = $request->user();
        $perPage = $request->input('per_page', 20);

        $blockedUsers = $authUser->blockedUsers()
            ->with(['profile'])
            ->paginate($perPage);

        return $this->paginatedResponse($blockedUsers);
    }
}
