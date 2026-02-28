<?php

use App\Models\User;
use App\Models\AppNotification;
use App\Models\NotificationSetting;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Setting up test user and notifications for Phase 13...\n";

$email = 'qa@example.com';
$user = User::where('email', $email)->first();
if (!$user) {
    $user = User::create([
        'name' => 'qa',
        'email' => $email,
        'username' => 'qauser',
        'password' => Hash::make('password'),
        'status' => 'active',
    ]);
}

$token = $user->createToken('test-token')->plainTextToken;
echo "TOKEN_qa=$token\n";
echo "ID_qa={$user->id}\n";

// Clear existing notifications
AppNotification::where('user_id', $user->id)->delete();

// Inject notifications
$notifs = [
    ['type' => 'message', 'title' => 'New Message', 'body' => 'Hello from QA'],
    ['type' => 'gift', 'title' => 'Gift Received', 'body' => 'Someone sent you a 💎'],
    ['type' => 'system', 'title' => 'System Alert', 'body' => 'Welcome to Phase 13'],
    ['type' => 'match', 'title' => 'New Match', 'body' => 'High compatibility found'],
    ['type' => 'follow', 'title' => 'New Follower', 'body' => 'User123 started following you'],
];

foreach ($notifs as $n) {
    $notif = AppNotification::create([
        'user_id' => $user->id,
        'type' => $n['type'],
        'title' => $n['title'],
        'body' => $n['body'],
        'is_read' => false,
    ]);
    echo "NOTIF_ID={$notif->id}\n";
}

// Ensure settings exist
NotificationSetting::firstOrCreate(
    ['user_id' => $user->id],
    [
        'push_enabled' => true,
        'email_enabled' => true,
        'type_preferences' => NotificationSetting::DEFAULT_TYPE_PREFERENCES,
        'mute_all' => false,
    ]
);

echo "Phase 13 environment prepared.\n";
