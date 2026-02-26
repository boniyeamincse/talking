<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use App\Http\Requests\UploadMediaRequest;
use App\Http\Resources\PostResource;
use App\Http\Resources\PostMediaResource;
use App\Models\Post;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends BaseController
{
    public function __construct(
        private PostService $postService
    ) {}

    /**
     * Get feed with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $posts = $this->postService->getFeed($request->user());
        
        return $this->successResponse(
            PostResource::collection($posts)->response()->getData(true),
            'Feed retrieved successfully'
        );
    }

    /**
     * Create post
     */
    public function store(StorePostRequest $request): JsonResponse
    {
        $post = $this->postService->createPost(
            $request->user(),
            $request->input('content'),
            $request->file('media', [])
        );

        return $this->successResponse(
            new PostResource($post),
            'Post created successfully',
            201
        );
    }

    /**
     * Get single post
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $post = $this->postService->getPost($id, $request->user());

        if (!$post) {
            return $this->errorResponse('Post not found', null, 404);
        }

        return $this->successResponse(
            new PostResource($post),
            'Post retrieved successfully'
        );
    }

    /**
     * Edit own post
     */
    public function update(UpdatePostRequest $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        
        $post = $this->postService->updatePost($post, $request->input('content'));

        return $this->successResponse(
            new PostResource($post),
            'Post updated successfully'
        );
    }

    /**
     * Delete own post
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);

        if (!$post->isOwnedBy($request->user())) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $this->postService->deletePost($post);

        return $this->successResponse(null, 'Post deleted successfully');
    }

    /**
     * Upload post media
     */
    public function uploadMedia(UploadMediaRequest $request, int $id): JsonResponse
    {
        $post = Post::findOrFail($id);
        
        $media = $this->postService->uploadMedia($post, $request->file('media'));

        return $this->successResponse(
            new PostMediaResource($media),
            'Media uploaded successfully',
            201
        );
    }
}
