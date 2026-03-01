<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DashboardTestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create test users
        $users = [
            [
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'email' => 'admin@banitalk.com',
                'password' => Hash::make('password123'),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
                'last_seen_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Test Admin',
                'username' => 'testadmin',
                'email' => 'moderator@banitalk.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
                'last_seen_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(['email' => $user['email']], $user);
        }

        // Create login logs
        for ($i = 0; $i < 50; $i++) {
            DB::table('login_logs')->insert([
                'user_id' => rand(1, 2),
                'email' => $i % 3 == 0 ? 'admin@banitalk.com' : 'moderator@banitalk.com',
                'ip_address' => '192.168.1.' . rand(1, 255),
                'device' => ['Windows PC', 'Mac', 'Mobile Device'][rand(0, 2)],
                'location' => ['New York, USA', 'London, UK', 'Tokyo, Japan'][rand(0, 2)],
                'status' => $i % 5 == 0 ? 'failed' : 'success',
                'created_at' => now()->subDays(rand(0, 30)),
                'updated_at' => now(),
            ]);
        }

        // Create security events
        $eventTypes = ['Failed Login', 'Suspicious Activity', 'Rate Limit Hit', 'IP Block'];
        $severities = ['critical', 'high', 'medium', 'low'];
        
        for ($i = 0; $i < 30; $i++) {
            DB::table('security_events')->insert([
                'type' => $eventTypes[rand(0, 3)],
                'severity' => $severities[rand(0, 3)],
                'description' => 'Security event detected from IP address',
                'ip_address' => '192.168.1.' . rand(1, 255),
                'user_id' => rand(1, 2),
                'created_at' => now()->subDays(rand(0, 7)),
                'updated_at' => now(),
            ]);
        }

        // Create banned IPs
        DB::table('banned_ips')->truncate();
        for ($i = 0; $i < 10; $i++) {
            DB::table('banned_ips')->insert([
                'ip_address' => '192.168.2.' . (100 + $i),
                'reason' => ['Suspicious activity', 'Multiple failed logins', 'Spam detected'][rand(0, 2)],
                'type' => $i % 2 == 0 ? 'permanent' : 'temporary',
                'banned_by' => 1,
                'expires_at' => $i % 2 == 0 ? null : now()->addDays(rand(7, 30)),
                'created_at' => now()->subDays(rand(0, 30)),
                'updated_at' => now(),
            ]);
        }

        $this->command->info('Dashboard test data seeded successfully!');
    }
}
