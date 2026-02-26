<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Group reactions by emoji with counts
        $reactionsGrouped = [];
        if ($this->relationLoaded('reactions')) {
            $reactionsGrouped = $this->reactions->groupBy('emoji')->map(function ($reactions, $emoji) {
                return [
                    'emoji' => $emoji,
                    'count' => $reactions->count(),
                    'users' => UserResource::collection($reactions->pluck('user')),
                ];
            })->values();
        }

        return [
            'id' => $this->id,
            'conversation_id' => $this->conversation_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'content' => $this->deleted_at ? null : $this->content,
            'type' => $this->type,
            'status' => $this->status,
            'is_deleted' => !is_null($this->deleted_at),
            'parent_message' => $this->when(
                $this->parent_message_id && $this->relationLoaded('parentMessage'),
                function () {
                    if ($this->parentMessage) {
                        return [
                            'id' => $this->parentMessage->id,
                            'user' => new UserResource($this->parentMessage->user),
                            'content' => $this->parentMessage->deleted_at ? '[Deleted]' : $this->parentMessage->content,
                            'is_deleted' => !is_null($this->parentMessage->deleted_at),
                        ];
                    }
                    return null;
                }
            ),
            'media' => MessageMediaResource::collection($this->whenLoaded('media')),
            'reactions' => $reactionsGrouped,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
