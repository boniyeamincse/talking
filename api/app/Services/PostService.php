<?php

namespace App\Services;

use App\Models\Post;
use App\Models\PostMedia;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PostService
{
    public function __construct(
        private MediaService $mediaService
    ) {}

    /**
     * Create a new post with optional media attachments
     */
    public function createPost(User $user, ?string $content, array $mediaFiles = []): Post
    {
        // Validate at least one of content or media is provided
        if (empty($content) && empty($mediaFiles)) {
            throw new \InvalidArgumentException('Post must have content or media');
        }

        return DB::transaction(function () use ($user, $content, $mediaFiles) {
            // Create post record
            $post = Post::create([
                'user_id' => $user->id,
                'content' => $content,
                'likes_count' => 0,
                'comments_count' => 0,
                'is_edited' => false
            ]);

            // Process and store media files
            foreach ($mediaFiles as $index => $file) {
                $this->uploadMedia($post, $file, $index);
            }

            // Load relationships
            $post->load(['user', 'media']);

            return $post;
        });
    }

    /**
     * Update post content
     */
    public function updatePost(Post $post, string $content): Post
    {
        $post->update([
            'content' => $content,
            'is_edited' => true
        ]);

        return $post->fresh(['user', 'media']);
    }

    /**
     * Delete post and all associated data
     */
    public function deletePost(Post $post): void
    {
        DB::transaction(function () use ($post) {
            // Delete all associated media files from storage
            foreach ($post->media as $media) {
                Storage::delete($media->file_path);
            }

            // Soft delete post (cascades to comments, likes, saved_posts via DB)
            $post->delete();
        });
    }

    /**
     * Upload media file for a post
     */
    public function uploadMedia(Post $post, UploadedFile $file, int $displayOrder = 0): PostMedia
    {
        // Validate and store file using MediaService
        $fileType = str_starts_with($file->getMimeType(), 'image/') ? 'image' : 'video';
        
        // Store file with unique name
        $path = $this->mediaService->storeMediaFile($file, 'post');

        // Create PostMedia record
        return PostMedia::create([
            'post_id' => $post->id,
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'display_order' => $displayOrder
        ]);
    }

    /**
     * Get feed for user with pagination
     */
    public function getFeed(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return Post::forFeed($user)
            ->with(['user', 'media'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get single post with all metadata
     */
    public function getPost(int $postId, User $user): ?Post
    {
        $post = Post::with(['user', 'media'])
            ->find($postId);

        if (!$post) {
            return null;
        }

        // Check if post author has blocked auth user or vice versa
        $blockedByAuthor = $post->user->blocking()->where('blocked_id', $user->id)->exists();
        $blockingAuthor = $user->blocking()->where('blocked_id', $post->user_id)->exists();

        if ($blockedByAuthor || $blockingAuthor) {
            return null; // Return null to disguise as not found
        }

        return $post;
    }

    /**
     * Like a post
     */
    public function likePost(Post $post, User $user): void
    {
        // Check if user already liked the post
        if ($post->isLikedBy($user)) {
            throw new \Exception('You have already liked this post');
        }

        // Check if user is blocked by post author
        $blockedByAuthor = $post->user->blocking()->where('blocked_id', $user->id)->exists();
        $blockingAuthor = $user->blocking()->where('blocked_id', $post->user_id)->exists();

        if ($blockedByAuthor || $blockingAuthor) {
            throw new \Exception('Unable to like this post');
        }

        DB::transaction(function () use ($post, $user) {
            // Create like record
            $post->likes()->create([
                'user_id' => $user->id
            ]);

            // Increment likes count
            $post->incrementLikes();
        });
    }

    /**
     * Unlike a post
     */
    public function unlikePost(Post $post, User $user): void
    {
        // Check if user has liked the post
        if (!$post->isLikedBy($user)) {
            throw new \Exception('You have not liked this post');
        }

        DB::transaction(function () use ($post, $user) {
            // Delete like record
            $post->likes()->where('user_id', $user->id)->delete();

            // Decrement likes count
            $post->decrementLikes();
        });
    }

    /**
     * Get users who liked a post
     */
    public function getLikers(Post $post, int $perPage = 20): LengthAwarePaginator
    {
        return User::whereIn('id', function ($query) use ($post) {
            $query->select('user_id')
                ->from('likes')
                ->where('post_id', $post->id);
        })->paginate($perPage);
    }

    /**
     * Save a post
     */
    public function savePost(Post $post, User $user): void
    {
        // Check if user already saved the post
        if ($post->isSavedBy($user)) {
            throw new \Exception('You have already saved this post');
        }

        // Check if user is blocked by post author
        $blockedByAuthor = $post->user->blocking()->where('blocked_id', $user->id)->exists();
        $blockingAuthor = $user->blocking()->where('blocked_id', $post->user_id)->exists();

        if ($blockedByAuthor || $blockingAuthor) {
            throw new \Exception('Unable to save this post');
        }

        $post->savedBy()->create([
            'user_id' => $user->id
        ]);
    }

    /**
     * Unsave a post
     */
    public function unsavePost(Post $post, User $user): void
    {
        // Check if user has saved the post
        if (!$post->isSavedBy($user)) {
            throw new \Exception('You have not saved this post');
        }

        $post->savedBy()->where('user_id', $user->id)->delete();
    }

    /**
     * Get saved posts for user
     */
    public function getSavedPosts(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return Post::whereIn('id', function ($query) use ($user) {
            $query->select('post_id')
                ->from('saved_posts')
                ->where('user_id', $user->id);
        })
        ->with(['user', 'media'])
        ->orderBy('created_at', 'desc')
        ->paginate($perPage);
    }

    /**
     * Add comment to a post
     */
    public function addComment(Post $post, User $user, string $content): Comment
    {
        // Check if user is blocked by post author
        $blockedByAuthor = $post->user->blocking()->where('blocked_id', $user->id)->exists();
        $blockingAuthor = $user->blocking()->where('blocked_id', $post->user_id)->exists();

        if ($blockedByAuthor || $blockingAuthor) {
            throw new \Exception('Unable to comment on this post');
        }

        return DB::transaction(function () use ($post, $user, $content) {
            // Create comment record
            $comment = $post->comments()->create([
                'user_id' => $user->id,
                'content' => $content
            ]);

            // Increment comments count
            $post->incrementComments();

            $comment->load('user');

            return $comment;
        });
    }

    /**
     * Delete a comment
     */
    public function deleteComment(Comment $comment): void
    {
        DB::transaction(function () use ($comment) {
            $post = $comment->post;

            // Delete comment record
            $comment->delete();

            // Decrement comments count
            $post->decrementComments();
        });
    }

    /**
     * Get comments for a post
     */
    public function getComments(Post $post, int $perPage = 20): LengthAwarePaginator
    {
        return $post->comments()
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->paginate($perPage);
    }
}
