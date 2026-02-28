<?php

use App\Models\User;
use App\Models\Post;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Setting up test users and post for Phase 14...\n";

// Reporter
$userA = User::where('email', 'qa@example.com')->first();
if (!$userA) {
    $userA = User::create([
        'name' => 'qa',
        'email' => 'qa@example.com',
        'username' => 'qauser',
        'password' => Hash::make('password'),
        'status' => 'active',
    ]);
}
$tokenA = $userA->createToken('test-token')->plainTextToken;

// Target User
$userB = User::where('email', 'qa2@example.com')->first();
if (!$userB) {
    $userB = User::create([
        'name' => 'qa2',
        'email' => 'qa2@example.com',
        'username' => 'qauser2',
        'password' => Hash::make('password'),
        'status' => 'active',
    ]);
}

// Target Post
$post = Post::where('user_id', $userB->id)->first();
if (!$post) {
    $post = Post::create([
        'user_id' => $userB->id,
        'content' => 'This is a test post for reporting.',
        'status' => 'active',
    ]);
}

echo "TOKEN_qa=$tokenA\n";
echo "ID_qa={$userA->id}\n";
echo "ID_qa2={$userB->id}\n";
echo "ID_post={$post->id}\n";

echo "Phase 14 environment prepared.\n";
