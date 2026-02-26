<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class VoiceRoom extends Model
{
    protected $fillable = [
        'host_id',
        'title',
        'description',
        'is_public',
        'capacity',
        'state',
        'ended_at',
        'duration',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'capacity' => 'integer',
        'ended_at' => 'datetime',
        'duration' => 'integer',
    ];

    // Relationships
    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'host_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(VoiceRoomParticipant::class, 'room_id');
    }

    public function speakerRequests(): HasMany
    {
        return $this->hasMany(SpeakerRequest::class, 'room_id');
    }

    // State checks
    public function isActive(): bool
    {
        return $this->state === 'active';
    }

    public function isFull(): bool
    {
        return $this->getParticipantCount() >= $this->capacity;
    }

    public function isParticipant(User $user): bool
    {
        return $this->participants()->where('user_id', $user->id)->exists();
    }

    public function getParticipantRole(User $user): ?string
    {
        $participant = $this->participants()->where('user_id', $user->id)->first();
        return $participant?->role;
    }

    public function canManageSpeakers(User $user): bool
    {
        $role = $this->getParticipantRole($user);
        return in_array($role, ['host', 'co_host']);
    }

    public function canManageRoom(User $user): bool
    {
        return $this->host_id === $user->id;
    }

    // Participant queries
    public function getSpeakerCount(): int
    {
        return $this->participants()
            ->whereIn('role', ['host', 'co_host', 'speaker'])
            ->count();
    }

    public function getParticipantCount(): int
    {
        return $this->participants()->count();
    }

    public function getParticipantsByRole(): array
    {
        $participants = $this->participants()
            ->with('user')
            ->orderBy('joined_at')
            ->get();

        return [
            'host' => $participants->where('role', 'host')->first()?->user,
            'co_hosts' => $participants->where('role', 'co_host')->pluck('user')->values(),
            'speakers' => $participants->where('role', 'speaker')->pluck('user')->values(),
            'audience' => $participants->where('role', 'audience')->pluck('user')->values(),
        ];
    }

    // State transitions
    public function close(): void
    {
        $this->ended_at = now();
        $this->duration = $this->ended_at->diffInSeconds($this->created_at);
        $this->state = 'ended';
        $this->save();
    }

    public function updateSettings(array $settings): void
    {
        $this->fill($settings);
        $this->save();
    }

    // Scopes
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('state', 'active');
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->whereHas('participants', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        });
    }
}
