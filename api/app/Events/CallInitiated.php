<?php

namespace App\Events;

use App\Models\Call;
use App\Http\Resources\CallResource;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallInitiated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Call $call;
    public array $sdpOffer;

    /**
     * Create a new event instance.
     */
    public function __construct(Call $call, array $sdpOffer)
    {
        $this->call = $call;
        $this->sdpOffer = $sdpOffer;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->call->callee_id),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'call.initiated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'call' => new CallResource($this->call->load(['caller', 'callee'])),
            'sdp_offer' => $this->sdpOffer,
        ];
    }
}
