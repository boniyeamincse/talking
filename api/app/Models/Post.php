<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'content',
        'likes_count',
        'comments_count',
        'is_edited'
    ];

    protected $casts = [
        'is_edited' => 'boolean',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(PostMedia::class)->orderBy('display_order');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function savedBy(): HasMany
    {
        return $this->hasMany(SavedPost::class);
    }

    // Scopes
    public function scopeWithEngagement(Builder $query): Builder
    {
        return $query->withCount(['likes', 'comments']);
    }

    public function scopeForFeed(Builder $query, User $user): Builder
    {
        // Get IDs of users the current user follows
        $followingIds = $user->following()->pluck('followed_id')->toArray();
        
        // Get IDs of blocked users (both directions)
        $blockedByMe = $user->blocking()->pluck('blocked_id')->toArray();
        $blockingMe = $user->blockedBy()->pluck('blocker_id')->toArray();
        $blockedUserIds = array_merge($blockedByMe, $blockingMe);

        // Include posts from followed users and own posts, exclude blocked users
        return $query->where(function ($q) use ($user, $followingIds) {
            $q->whereIn('user_id', $followingIds)
              ->orWhere('user_id', $user->id);
        })->whereNotIn('user_id', $blockedUserIds);
    }

    // Methods
    public function isOwnedBy(User $user): bool
    {
        return $this->user_id === $user->id;
    }

    public function isLikedBy(User $user): bool
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    public function isSavedBy(User $user): bool
    {
        return $this->savedBy()->where('user_id', $user->id)->exists();
    }

    public function incrementLikes(): void
    {
        $this->increment('likes_count');
    }

    public function decrementLikes(): void
    {
        $this->decrement('likes_count');
    }

    public function incrementComments(): void
    {
        $this->increment('comments_count');
    }

    public function decrementComments(): void
    {
        $this->decrement('comments_count');
    }
}
