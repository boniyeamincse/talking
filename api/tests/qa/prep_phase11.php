<?php

use App\Models\User;
use App\Models\Gift;
use App\Models\GiftCategory;
use App\Models\CoinWallet;
use Illuminate\Support\Facades\Hash;

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$users = [
    'qa@example.com' => 'qa',
    'qa2@example.com' => 'qa2',
];

echo "Setting up test users and tokens for Phase 11...\n";

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
    
    // Reset Balance
    $wallet = CoinWallet::updateOrCreate(['user_id' => $user->id], ['balance' => 0]);
}

// Ensure a gift exists
$category = GiftCategory::first();
if (!$category) {
    $category = GiftCategory::create([
        'name' => 'Test Category',
        'slug' => 'test-category',
        'culture_tag' => 'universal',
    ]);
}

$gift = Gift::where('price_coins', '>', 0)->first();
if (!$gift) {
    $gift = Gift::create([
        'category_id' => $category->id,
        'name' => 'Red Rose',
        'price_coins' => 100,
        'icon_url' => '/assets/gifts/rose.png',
        'rarity' => 'common',
    ]);
}

echo "ID_GIFT={$gift->id}\n";
echo "PRICE_GIFT={$gift->price_coins}\n";
echo "Phase 11 environment prepared.\n";
