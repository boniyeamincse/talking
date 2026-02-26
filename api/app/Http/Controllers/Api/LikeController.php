<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LikeController extends BaseController
{
    public function __construct(
        private PostService $postService
    ) {}

    /**
     * Like post
     */
    public function store(Request $request, int $postId): JsonResponse
    {
        $post = Post::findOrFail($postId);

        try {
            $this->postService->likePost($post, $request->user());
            
            return $this->successResponse(
                ['likes_count' => $post->fresh()->likes_count],
                'Post liked successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    /**
     * Unlike post
     */
    public function destroy(Request $request, int $postId): JsonResponse
    {
        $post = Post::findOrFail($postId);

        try {
            $this->postService->unlikePost($post, $request->user());
            
            return $this->successResponse(
                ['likes_count' => $post->fresh()->likes_count],
                'Post unliked successfully'
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    /**
     * Get post likers
     */
    public function index(Request $request, int $postId): JsonResponse
    {
        $post = Post::findOrFail($postId);
        
        $likers = $this->postService->getLikers($post);

        return $this->successResponse(
            UserResource::collection($likers)->response()->getData(true),
            'Likers retrieved successfully'
        );
    }
}
