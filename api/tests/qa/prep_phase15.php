<?php

use App\Models\User;
use App\Models\Report;
use App\Models\GiftCategory;
use App\Models\Gift;
use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Setting up admin accounts and test data for Phase 15...\n";

// Super Admin
$super = User::where('email', 'super@example.com')->orWhere('username', 'qa_superadmin')->first();
if (!$super) {
    $super = User::create([
        'name' => 'Super Admin',
        'email' => 'super@example.com',
        'username' => 'qa_superadmin',
        'password' => Hash::make('password'),
        'role' => 'super_admin',
        'status' => 'active',
    ]);
}
$tokenSuper = $super->createToken('test-token')->plainTextToken;

// Standard Admin
$admin = User::where('email', 'admin@example.com')->orWhere('username', 'qa_adminuser')->first();
if (!$admin) {
    $admin = User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'username' => 'qa_adminuser',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'status' => 'active',
    ]);
}
$tokenAdmin = $admin->createToken('test-token')->plainTextToken;

// Target Regular User
$target = User::where('email', 'target@example.com')->orWhere('username', 'qa_targetuser')->first();
if (!$target) {
    $target = User::create([
        'name' => 'Target User',
        'email' => 'target@example.com',
        'username' => 'qa_targetuser',
        'password' => Hash::make('password'),
        'role' => 'user',
        'status' => 'active',
    ]);
}

// Target Admin for demotion test
$demoteTarget = User::where('email', 'demote@example.com')->orWhere('username', 'qa_demoteuser')->first();
if (!$demoteTarget) {
    $demoteTarget = User::create([
        'name' => 'Demote Target',
        'email' => 'demote@example.com',
        'username' => 'qa_demoteuser',
        'password' => Hash::make('password'),
        'role' => 'admin',
        'status' => 'active',
    ]);
}

// Report
$report = Report::create([
    'reporter_id' => $target->id,
    'reportable_type' => 'App\\Models\\User',
    'reportable_id' => $admin->id,
    'type' => 'other',
    'description' => 'Test admin report',
    'status' => 'pending',
]);

// Gift Category & Gift
$category = GiftCategory::firstOrCreate(['name' => 'QA Category'], ['slug' => 'qa-category']);
$gift = Gift::create([
    'gift_category_id' => $category->id,
    'name' => 'QA Gift',
    'slug' => 'qa-gift',
    'price_coins' => 10,
    'rarity' => 'common',
    'is_active' => true,
]);

// Platform Setting
PlatformSetting::updateOrCreate(
    ['key' => 'test_setting'],
    ['value' => 'test_value', 'type' => 'string', 'group' => 'general', 'description' => 'Test setting']
);

echo "TOKEN_super=$tokenSuper\n";
echo "TOKEN_admin=$tokenAdmin\n";
echo "ID_target={$target->id}\n";
echo "ID_demote={$demoteTarget->id}\n";
echo "ID_report={$report->id}\n";
echo "ID_gift={$gift->id}\n";
echo "ID_category={$category->id}\n";

echo "Phase 15 environment prepared.\n";
