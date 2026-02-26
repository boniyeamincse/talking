<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Http\Resources\CommentResource;
use App\Models\Post;
use App\Models\Comment;
use App\Services\PostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends BaseController
{
    public function __construct(
        private PostService $postService
    ) {}

    /**
     * Get comments
     */
    public function index(Request $request, int $postId): JsonResponse
    {
        $post = Post::findOrFail($postId);
        
        $comments = $this->postService->getComments($post);

        return $this->successResponse(
            CommentResource::collection($comments)->response()->getData(true),
            'Comments retrieved successfully'
        );
    }

    /**
     * Add comment
     */
    public function store(StoreCommentRequest $request, int $postId): JsonResponse
    {
        $post = Post::findOrFail($postId);

        try {
            $comment = $this->postService->addComment(
                $post,
                $request->user(),
                $request->input('content')
            );

            return $this->successResponse(
                new CommentResource($comment),
                'Comment added successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    /**
     * Delete comment
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $comment = Comment::findOrFail($id);

        if (!$comment->canBeDeletedBy($request->user())) {
            return $this->errorResponse('Unauthorized', null, 403);
        }

        $this->postService->deleteComment($comment);

        return $this->successResponse(null, 'Comment deleted successfully');
    }
}
