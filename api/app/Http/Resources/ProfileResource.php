<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'display_name' => $this->display_name,
            'avatar' => $this->avatar,
            'bio' => $this->bio,
            'country_code' => $this->country_code,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'gender' => $this->gender,
            'is_public' => $this->is_public,
            'coin_balance' => $this->coin_balance,
            'followers_count' => $this->followers_count,
            'following_count' => $this->following_count,
            'cultural_interests' => $this->cultural_interests,
            'learning_goal' => $this->learning_goal,
        ];
    }
}
