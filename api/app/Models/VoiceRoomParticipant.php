<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VoiceRoomParticipant extends Model
{
    protected $fillable = [
        'room_id',
        'user_id',
        'role',
        'joined_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
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

    // Role checks
    public function isHost(): bool
    {
        return $this->role === 'host';
    }

    public function isCoHost(): bool
    {
        return $this->role === 'co_host';
    }

    public function isSpeaker(): bool
    {
        return $this->role === 'speaker';
    }

    public function isAudience(): bool
    {
        return $this->role === 'audience';
    }

    public function canSpeak(): bool
    {
        return in_array($this->role, ['host', 'co_host', 'speaker']);
    }

    // Role transitions
    public function promoteToSpeaker(): void
    {
        $this->role = 'speaker';
        $this->save();
    }

    public function promoteToCoHost(): void
    {
        $this->role = 'co_host';
        $this->save();
    }

    public function demoteToAudience(): void
    {
        $this->role = 'audience';
        $this->save();
    }

    public function demoteToSpeaker(): void
    {
        $this->role = 'speaker';
        $this->save();
    }
}
