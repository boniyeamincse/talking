<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReactionSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $roomId,
        public int $userId,
        public string $emoji
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->roomId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'reaction.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'emoji' => $this->emoji,
            'timestamp' => now()->toISOString(),
        ];
    }
}
