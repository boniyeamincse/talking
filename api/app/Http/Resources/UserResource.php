<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'status' => $this->status,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'last_seen_at' => $this->last_seen_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'profile' => new ProfileResource($this->whenLoaded('profile')),
            'languages' => UserLanguageResource::collection($this->whenLoaded('languages')),
            
            // Relationship flags (when available)
            'is_following' => $this->when(isset($this->is_following), $this->is_following ?? false),
            'is_followed_by' => $this->when(isset($this->is_followed_by), $this->is_followed_by ?? false),
            'is_blocked' => $this->when(isset($this->is_blocked), $this->is_blocked ?? false),
        ];
    }
}
