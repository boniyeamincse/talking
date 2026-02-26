<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ICECandidateReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $callId;
    public int $fromUserId;
    public int $toUserId;
    public array $candidate;

    /**
     * Create a new event instance.
     */
    public function __construct(int $callId, int $fromUserId, int $toUserId, array $candidate)
    {
        $this->callId = $callId;
        $this->fromUserId = $fromUserId;
        $this->toUserId = $toUserId;
        $this->candidate = $candidate;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->toUserId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'call.ice-candidate';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'call_id' => $this->callId,
            'from_user_id' => $this->fromUserId,
            'candidate' => $this->candidate,
        ];
    }
}
