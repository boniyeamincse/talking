<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Setting up tokens and IDs for Edge Cases & Error Handling...\n";

// Super Admin
$super = User::where('email', 'super@example.com')->first();
$tokenSuper = $super->createToken('edge-token')->plainTextToken;

// Admin
$admin = User::where('email', 'admin@example.com')->first();
$tokenAdmin = $admin->createToken('edge-token')->plainTextToken;

// Regular User
$user = User::where('email', 'target@example.com')->first();
$tokenUser = $user->createToken('edge-token')->plainTextToken;

echo "TOKEN_super=$tokenSuper\n";
echo "TOKEN_admin=$tokenAdmin\n";
echo "TOKEN_user=$tokenUser\n";
echo "ID_target={$user->id}\n";

echo "Edge Cases environment prepared.\n";
