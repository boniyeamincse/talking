<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedPostController extends BaseController
{
    public function __construct(
        private PostService $postService
    ) {}

    /**
     * Save post
     */
    public function store(Request $request, int $postId): JsonResponse
    {
        $post = Post::findOrFail($postId);

        try {
            $this->postService->savePost($post, $request->user());
            
            return $this->successResponse(null, 'Post saved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    /**
     * Unsave post
     */
    public function destroy(Request $request, int $postId): JsonResponse
    {
        $post = Post::findOrFail($postId);

        try {
            $this->postService->unsavePost($post, $request->user());
            
            return $this->successResponse(null, 'Post unsaved successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    /**
     * Get saved posts
     */
    public function index(Request $request): JsonResponse
    {
        $savedPosts = $this->postService->getSavedPosts($request->user());

        return $this->successResponse(
            PostResource::collection($savedPosts)->response()->getData(true),
            'Saved posts retrieved successfully'
        );
    }
}
