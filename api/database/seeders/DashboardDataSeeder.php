<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use App\Models\Call;
use App\Models\VoiceRoom;
use App\Models\Post;
use App\Models\Report;
use App\Models\CoinTransaction;
use App\Models\GiftTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DashboardDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create 50 sample users
        for ($i = 1; $i <= 50; $i++) {
            $user = User::create([
                'name' => "User $i",
                'username' => "user$i",
                'email' => "user$i@example.com",
                'password' => Hash::make('password'),
                'role' => 'user',
                'status' => 'active',
                'email_verified_at' => now()->subDays(rand(1, 30)),
                'last_seen_at' => now()->subMinutes(rand(0, 1440)),
                'created_at' => now()->subDays(rand(0, 90)),
            ]);

            Profile::create([
                'user_id' => $user->id,
                'country_code' => ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'JP', 'KR'][rand(0, 9)],
            ]);
        }

        // Create calls
        for ($i = 0; $i < 150; $i++) {
            Call::create([
                'caller_id' => rand(1, 52),
                'receiver_id' => rand(1, 52),
                'type' => ['audio', 'video'][rand(0, 1)],
                'status' => ['ended', 'missed', 'declined'][rand(0, 2)],
                'duration' => rand(30, 3600),
                'created_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        // Create voice rooms
        for ($i = 0; $i < 25; $i++) {
            VoiceRoom::create([
                'host_id' => rand(1, 52),
                'title' => "Room " . ($i + 1),
                'description' => "Sample voice room",
                'status' => ['active', 'ended'][rand(0, 1)],
                'max_participants' => 50,
                'created_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        // Create posts
        for ($i = 0; $i < 200; $i++) {
            Post::create([
                'user_id' => rand(1, 52),
                'content' => "Sample post content #$i",
                'visibility' => 'public',
                'created_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        // Create reports
        for ($i = 0; $i < 15; $i++) {
            Report::create([
                'reporter_id' => rand(1, 52),
                'reported_user_id' => rand(1, 52),
                'type' => ['user', 'post', 'message'][rand(0, 2)],
                'reason' => ['spam', 'harassment', 'inappropriate_content'][rand(0, 2)],
                'description' => "Sample report description",
                'status' => ['pending', 'resolved', 'dismissed'][rand(0, 2)],
                'created_at' => now()->subDays(rand(0, 7)),
            ]);
        }

        // Create coin transactions
        for ($i = 0; $i < 100; $i++) {
            CoinTransaction::create([
                'user_id' => rand(1, 52),
                'type' => 'topup',
                'amount' => [100, 500, 1000, 2500, 5000][rand(0, 4)],
                'balance_after' => rand(100, 10000),
                'description' => 'Coin purchase',
                'created_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        // Create gift transactions
        for ($i = 0; $i < 300; $i++) {
            GiftTransaction::create([
                'sender_id' => rand(1, 52),
                'receiver_id' => rand(1, 52),
                'gift_id' => rand(1, 10),
                'coins_spent' => rand(10, 500),
                'created_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        $this->command->info('✅ Dashboard sample data seeded successfully!');
    }
}
