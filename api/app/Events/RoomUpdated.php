<?php

namespace App\Events;

use App\Models\VoiceRoom;
use App\Http\Resources\VoiceRoomResource;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RoomUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public VoiceRoom $room) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->room->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'room.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'room' => new VoiceRoomResource($this->room),
        ];
    }
}
