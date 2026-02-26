<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class SpeakerRequest extends Model
{
    protected $fillable = [
        'room_id',
        'user_id',
        'status',
    ];

    // Relationships
    public function room(): BelongsTo
    {
        return $this->belongsTo(VoiceRoom::class, 'room_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // State methods
    public function approve(): void
    {
        $this->status = 'approved';
        $this->save();
    }

    public function deny(): void
    {
        $this->status = 'denied';
        $this->save();
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    // Scopes
    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', 'pending');
    }
}
