<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RoleChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $roomId,
        public int $userId,
        public string $newRole,
        public string $oldRole
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->roomId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'role.changed';
    }

    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'new_role' => $this->newRole,
            'old_role' => $this->oldRole,
        ];
    }
}
