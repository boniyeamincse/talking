<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class Call extends Model
{
    use HasFactory;

    protected $fillable = [
        'caller_id',
        'callee_id',
        'type',
        'status',
        'initiated_at',
        'answered_at',
        'ended_at',
        'duration',
        'end_reason',
    ];

    protected $casts = [
        'initiated_at' => 'datetime',
        'answered_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration' => 'integer',
    ];

    // Relationships
    public function caller(): BelongsTo
    {
        return $this->belongsTo(User::class, 'caller_id');
    }

    public function callee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'callee_id');
    }

    public function recording(): HasOne
    {
        return $this->hasOne(CallRecording::class);
    }

    // State checks
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function canBeAnswered(): bool
    {
        return $this->status === 'ringing';
    }

    public function canBeEnded(): bool
    {
        return in_array($this->status, ['active', 'ringing']);
    }

    public function involvesUser(User $user): bool
    {
        return $this->caller_id === $user->id || $this->callee_id === $user->id;
    }

    // State transitions
    public function markAsRinging(): void
    {
        $this->status = 'ringing';
        $this->save();
    }

    public function markAsAnswered(): void
    {
        $this->status = 'active';
        $this->answered_at = now();
        $this->save();
    }

    public function markAsEnded(string $reason): void
    {
        $this->status = 'ended';
        $this->ended_at = now();
        $this->end_reason = $reason;
        
        // Calculate duration if call was answered
        if ($this->answered_at) {
            $this->duration = $this->ended_at->diffInSeconds($this->answered_at);
        }
        
        $this->save();
    }

    public function markAsDeclined(): void
    {
        $this->status = 'declined';
        $this->ended_at = now();
        $this->end_reason = 'declined';
        $this->save();
    }

    public function markAsFailed(): void
    {
        $this->status = 'failed';
        $this->ended_at = now();
        $this->end_reason = 'failed';
        $this->save();
    }

    // Query scopes
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return $query->where(function ($q) use ($user) {
            $q->where('caller_id', $user->id)
              ->orWhere('callee_id', $user->id);
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    // Helper method to get the other participant
    public function otherParticipant(User $user): ?User
    {
        if ($this->caller_id === $user->id) {
            return $this->callee;
        }
        
        if ($this->callee_id === $user->id) {
            return $this->caller;
        }
        
        return null;
    }
}
