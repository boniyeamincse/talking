<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'display_name',
        'avatar',
        'bio',
        'country_code',
        'date_of_birth',
        'gender',
        'is_public',
        'coin_balance',
        'followers_count',
        'following_count',
        'cultural_interests',
        'learning_goal',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'is_public' => 'boolean',
            'coin_balance' => 'integer',
            'followers_count' => 'integer',
            'following_count' => 'integer',
            'cultural_interests' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
