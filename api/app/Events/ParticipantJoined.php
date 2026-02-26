<?php

namespace App\Events;

use App\Models\VoiceRoom;
use App\Models\VoiceRoomParticipant;
use App\Http\Resources\ParticipantResource;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ParticipantJoined implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public VoiceRoom $room,
        public VoiceRoomParticipant $participant
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->room->id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'participant.joined';
    }

    public function broadcastWith(): array
    {
        return [
            'participant' => new ParticipantResource($this->participant),
            'participant_count' => $this->room->getParticipantCount(),
        ];
    }
}
