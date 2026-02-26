<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VoiceRoomResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'host' => new UserResource($this->whenLoaded('host')),
            'title' => $this->title,
            'description' => $this->description,
            'is_public' => $this->is_public,
            'capacity' => $this->capacity,
            'state' => $this->state,
            'participant_count' => $this->when(
                $this->relationLoaded('participants'),
                fn() => $this->participants->count()
            ),
            'speaker_count' => $this->when(
                $this->relationLoaded('participants'),
                fn() => $this->getSpeakerCount()
            ),
            'created_at' => $this->created_at?->toISOString(),
            'ended_at' => $this->ended_at?->toISOString(),
            'duration' => $this->duration,
        ];
    }
}
