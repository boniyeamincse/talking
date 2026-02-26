<?php

namespace App\Events;

use App\Models\SpeakerRequest;
use App\Http\Resources\SpeakerRequestResource;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SpeakerRequested implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public SpeakerRequest $request
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->request->room_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'speaker.requested';
    }

    public function broadcastWith(): array
    {
        return [
            'request' => new SpeakerRequestResource($this->request),
        ];
    }
}
