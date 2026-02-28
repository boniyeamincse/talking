<?php

use App\Models\User;
use App\Models\Post;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = [
    'qa@example.com' => 'qa',
    'qa2@example.com' => 'qa2',
    'qa3@example.com' => 'qa3',
];

echo "Setting up test users and tokens for Phase 9...\n";

foreach ($users as $email => $name) {
    $user = User::where('email', $email)->first();
    if (!$user) {
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'username' => $name . 'user',
            'password' => Hash::make('password'),
        ]);
    } else {
        $user->update(['password' => Hash::make('password')]);
    }

    $token = $user->createToken('test-token')->plainTextToken;
    echo "TOKEN_$name=$token\n";
    echo "ID_$name={$user->id}\n";
}

// Clean up existing posts to have a fresh start for 9.1 testing
DB::table('posts')->delete();

echo "Creating initial posts for feed testing...\n";
$qaUser = User::where('email', 'qa@example.com')->first();
Post::create([
    'user_id' => $qaUser->id,
    'content' => 'Hello Talkin! This is my first post.',
    'likes_count' => 0,
    'comments_count' => 0,
]);

Post::create([
    'user_id' => $qaUser->id,
    'content' => 'Check out this awesome new social feed feature!',
    'likes_count' => 0,
    'comments_count' => 0,
]);

echo "Phase 9 environment prepared.\n";
