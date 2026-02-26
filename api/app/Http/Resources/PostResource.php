<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $authUser = $request->user();

        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'content' => $this->content,
            'media' => PostMediaResource::collection($this->whenLoaded('media')),
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'is_edited' => $this->is_edited,
            'is_liked_by_user' => $authUser ? $this->isLikedBy($authUser) : false,
            'is_saved_by_user' => $authUser ? $this->isSavedBy($authUser) : false,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String()
        ];
    }
}
