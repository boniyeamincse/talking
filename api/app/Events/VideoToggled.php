<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VideoToggled implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $callId;
    public int $userId;
    public int $otherUserId;
    public bool $videoEnabled;

    /**
     * Create a new event instance.
     */
    public function __construct(int $callId, int $userId, int $otherUserId, bool $videoEnabled)
    {
        $this->callId = $callId;
        $this->userId = $userId;
        $this->otherUserId = $otherUserId;
        $this->videoEnabled = $videoEnabled;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->otherUserId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'call.video-toggled';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'call_id' => $this->callId,
            'user_id' => $this->userId,
            'video_enabled' => $this->videoEnabled,
        ];
    }
}
