<?php

namespace App\Services;

use App\Models\Call;
use App\Models\User;
use App\Models\Block;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class CallService
{
    /**
     * Initiate a new call
     */
    public function initiateCall(User $caller, User $callee, string $type, array $sdpOffer): Call
    {
        // Validate caller and callee are different users
        if ($caller->id === $callee->id) {
            throw new \InvalidArgumentException('Cannot call yourself');
        }

        // Validate users are not blocked (check both directions)
        $isBlocked = Block::where(function ($query) use ($caller, $callee) {
            $query->where('blocker_id', $caller->id)
                  ->where('blocked_id', $callee->id);
        })->orWhere(function ($query) use ($caller, $callee) {
            $query->where('blocker_id', $callee->id)
                  ->where('blocked_id', $caller->id);
        })->exists();

        if ($isBlocked) {
            throw new \Exception('Cannot call this user');
        }

        // Check callee availability (no active calls)
        $activeCall = $this->getUserCallStatus($callee);
        if ($activeCall) {
            throw new \Exception('User is currently in another call');
        }

        // Create call record
        $call = Call::create([
            'caller_id' => $caller->id,
            'callee_id' => $callee->id,
            'type' => $type,
            'status' => 'initiating',
            'initiated_at' => now(),
        ]);

        return $call;
    }

    /**
     * Answer an incoming call
     */
    public function answerCall(Call $call, User $user, array $sdpAnswer): Call
    {
        // Validate user is the callee
        if ($call->callee_id !== $user->id) {
            throw new \Exception('Only the callee can answer this call');
        }

        // Validate call can be answered
        if (!$call->canBeAnswered()) {
            throw new \Exception('Call cannot be answered in current state');
        }

        // Update call status
        $call->markAsAnswered();

        return $call->fresh();
    }

    /**
     * Decline an incoming call
     */
    public function declineCall(Call $call, User $user): Call
    {
        // Validate user is the callee
        if ($call->callee_id !== $user->id) {
            throw new \Exception('Only the callee can decline this call');
        }

        // Validate call can be declined
        if (!$call->canBeAnswered()) {
            throw new \Exception('Call cannot be declined in current state');
        }

        // Update call status
        $call->markAsDeclined();

        return $call->fresh();
    }

    /**
     * End an active call
     */
    public function endCall(Call $call, User $user): Call
    {
        // Validate user is participant
        if (!$call->involvesUser($user)) {
            throw new \Exception('Only call participants can end this call');
        }

        // Validate call can be ended
        if (!$call->canBeEnded()) {
            throw new \Exception('Call cannot be ended in current state');
        }

        // Update call status
        $call->markAsEnded('completed');

        return $call->fresh();
    }

    /**
     * Exchange ICE candidate
     */
    public function exchangeIceCandidate(Call $call, User $user, array $candidate): void
    {
        // Validate user is participant
        if (!$call->involvesUser($user)) {
            throw new \Exception('Only call participants can exchange ICE candidates');
        }

        // Validate call is active or ringing
        if (!in_array($call->status, ['active', 'ringing', 'initiating'])) {
            throw new \Exception('Cannot exchange ICE candidates in current call state');
        }

        // ICE candidate will be broadcast via event in controller
    }

    /**
     * Toggle video on/off
     */
    public function toggleVideo(Call $call, User $user, bool $enabled): void
    {
        // Validate user is participant
        if (!$call->involvesUser($user)) {
            throw new \Exception('Only call participants can toggle video');
        }

        // Validate call is video type
        if ($call->type !== 'video') {
            throw new \Exception('Cannot toggle video on audio-only call');
        }

        // Validate call is active
        if (!$call->isActive()) {
            throw new \Exception('Can only toggle video during active call');
        }

        // Video toggle will be broadcast via event in controller
    }

    /**
     * Get call history for a user
     */
    public function getCallHistory(User $user, ?string $type = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = Call::forUser($user)
            ->with(['caller', 'callee'])
            ->orderBy('initiated_at', 'desc');

        if ($type) {
            $query->byType($type);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get user's current call status
     */
    public function getUserCallStatus(User $user): ?Call
    {
        return Call::forUser($user)
            ->active()
            ->first();
    }

    /**
     * Get STUN/TURN server configuration
     */
    public function getStunTurnConfig(): array
    {
        $iceServers = [];

        // Parse STUN servers
        $stunServers = env('STUN_SERVERS', 'stun:stun.l.google.com:19302');
        $stunList = explode(',', $stunServers);
        
        foreach ($stunList as $stun) {
            $iceServers[] = [
                'urls' => trim($stun),
            ];
        }

        // Parse TURN server
        $turnUrl = env('TURN_SERVER_URL');
        if ($turnUrl) {
            $iceServers[] = [
                'urls' => $turnUrl,
                'username' => env('TURN_SERVER_USERNAME'),
                'credential' => env('TURN_SERVER_CREDENTIAL'),
            ];
        }

        return [
            'iceServers' => $iceServers,
        ];
    }
}
