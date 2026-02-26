<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'created_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get all participants in the conversation
     */
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot('joined_at', 'last_read_at')
            ->withTimestamps();
    }

    /**
     * Get all messages in the conversation
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get the latest message in the conversation
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    /**
     * Check if a user is a participant in this conversation
     */
    public function isParticipant(User $user): bool
    {
        return $this->participants()->where('user_id', $user->id)->exists();
    }

    /**
     * Scope to get conversations for a specific user
     */
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        });
    }

    /**
     * Scope to get only direct conversations
     */
    public function scopeDirect(Builder $query): Builder
    {
        return $query->where('type', 'direct');
    }

    /**
     * Scope to get only group conversations
     */
    public function scopeGroup(Builder $query): Builder
    {
        return $query->where('type', 'group');
    }

    /**
     * Get unread message count for a specific user
     */
    public function getUnreadCount(User $user): int
    {
        $participant = $this->participants()->where('user_id', $user->id)->first();
        
        if (!$participant) {
            return 0;
        }

        $query = $this->messages()->where('user_id', '!=', $user->id);
        
        if ($participant->pivot->last_read_at) {
            $query->where('created_at', '>', $participant->pivot->last_read_at);
        }
        
        return $query->count();
    }
}
