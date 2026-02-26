<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\SearchCacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends BaseController
{
    protected SearchCacheService $searchCache;

    public function __construct(SearchCacheService $searchCache)
    {
        $this->searchCache = $searchCache;
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['profile', 'languages.language']);
        
        // Update last seen
        $user->update(['last_seen_at' => now()]);

        return $this->successResponse(new UserResource($user));
    }

    /**
     * Update authenticated user
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'username' => ['sometimes', 'string', 'min:3', 'max:50', 'alpha_dash', Rule::unique('users')->ignore($user->id)],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        // If email changed, mark as unverified
        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            $validated['email_verified_at'] = null;
            $user->sendEmailVerificationNotification();
        }

        $user->update($validated);
        $user->load(['profile', 'languages.language']);

        return $this->successResponse(
            new UserResource($user),
            'User updated successfully'
        );
    }

    /**
     * Get user by ID
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = User::with(['profile', 'languages.language'])->findOrFail($id);
        $authUser = $request->user();

        // Check if blocked
        if ($authUser->hasBlockedOrIsBlockedBy($user)) {
            return $this->errorResponse('User not found', null, 404);
        }

        // Add relationship flags
        $user->is_following = $authUser->isFollowing($user);
        $user->is_followed_by = $authUser->isFollowedBy($user);
        $user->is_blocked = $authUser->hasBlocked($user);

        return $this->successResponse(new UserResource($user));
    }

    /**
     * Search users with advanced filters
     */
    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['sometimes', 'string', 'min:2'],
            'country' => ['sometimes', 'string', 'size:2'],
            'gender' => ['sometimes', 'string', 'in:male,female,other'],
            'language_id' => ['sometimes', 'integer', 'exists:languages,id'],
            'min_age' => ['sometimes', 'integer', 'min:18', 'max:100'],
            'max_age' => ['sometimes', 'integer', 'min:18', 'max:100'],
            'interests' => ['sometimes', 'array'],
            'interests.*' => ['string'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'sort' => ['sometimes', 'string', 'in:relevance,followers,recent'],
        ]);

        $authUser = $request->user();

        // Track search query for popular searches
        if (!empty($validated['q'])) {
            $this->searchCache->trackSearchQuery($validated['q']);
        }

        // Get blocked user IDs
        $blockedIds = $authUser->blockedUsers()->pluck('users.id')->toArray();
        $blockedByIds = $authUser->blockedBy()->pluck('users.id')->toArray();
        $excludeIds = array_merge($blockedIds, $blockedByIds, [$authUser->id]);

        // Build query
        $query = User::with(['profile', 'languages.language'])
            ->where('status', 'active')
            ->whereNotIn('id', $excludeIds);

        // Text search
        if (!empty($validated['q'])) {
            $searchTerm = $validated['q'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('username', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhereHas('profile', function ($q) use ($searchTerm) {
                      $q->where('display_name', 'like', "%{$searchTerm}%")
                        ->orWhere('bio', 'like', "%{$searchTerm}%");
                  });
            });
        }

        // Country filter
        if (!empty($validated['country'])) {
            $query->whereHas('profile', function ($q) use ($validated) {
                $q->where('country_code', $validated['country']);
            });
        }

        // Gender filter
        if (!empty($validated['gender'])) {
            $query->whereHas('profile', function ($q) use ($validated) {
                $q->where('gender', $validated['gender']);
            });
        }

        // Language filter
        if (!empty($validated['language_id'])) {
            $query->whereHas('languages', function ($q) use ($validated) {
                $q->where('language_id', $validated['language_id']);
            });
        }

        // Age filter
        if (!empty($validated['min_age']) || !empty($validated['max_age'])) {
            $query->whereHas('profile', function ($q) use ($validated) {
                if (!empty($validated['min_age'])) {
                    $maxDate = now()->subYears($validated['min_age'])->format('Y-m-d');
                    $q->where('date_of_birth', '<=', $maxDate);
                }
                if (!empty($validated['max_age'])) {
                    $minDate = now()->subYears($validated['max_age'] + 1)->format('Y-m-d');
                    $q->where('date_of_birth', '>=', $minDate);
                }
            });
        }

        // Interests filter
        if (!empty($validated['interests'])) {
            $query->whereHas('profile', function ($q) use ($validated) {
                foreach ($validated['interests'] as $interest) {
                    $q->whereJsonContains('cultural_interests', $interest);
                }
            });
        }

        // Sorting
        $sort = $validated['sort'] ?? 'relevance';
        switch ($sort) {
            case 'followers':
                $query->join('profiles', 'users.id', '=', 'profiles.user_id')
                      ->orderBy('profiles.followers_count', 'desc')
                      ->select('users.*');
                break;
            case 'recent':
                $query->orderBy('created_at', 'desc');
                break;
            case 'relevance':
            default:
                // Relevance ranking based on multiple factors
                if (!empty($validated['q'])) {
                    $searchTerm = $validated['q'];
                    $query->selectRaw('users.*, 
                        (CASE 
                            WHEN username LIKE ? THEN 10
                            WHEN username LIKE ? THEN 5
                            ELSE 1
                        END) as relevance_score', 
                        [$searchTerm, "%{$searchTerm}%"]
                    )->orderBy('relevance_score', 'desc');
                } else {
                    $query->orderBy('created_at', 'desc');
                }
                break;
        }

        $users = $query->paginate($validated['per_page'] ?? 20);

        // Add relationship flags
        $users->getCollection()->transform(function ($user) use ($authUser) {
            $user->is_following = $authUser->isFollowing($user);
            $user->is_followed_by = $authUser->isFollowedBy($user);
            return $user;
        });

        return $this->paginatedResponse($users);
    }

    /**
     * Get popular search queries
     */
    public function popularSearches(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $searches = $this->searchCache->getPopularSearches($limit);

        return $this->successResponse($searches);
    }
}
