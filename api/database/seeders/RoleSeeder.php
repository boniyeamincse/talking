<?php

namespace Database\Seeders;

use App\Models\PlatformSetting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create Super Admin if not exists
        if (!User::where('email', 'admin@banitalk.com')->exists()) {
            User::create([
                'name' => 'Super Admin',
                'username' => 'superadmin',
                'email' => 'admin@banitalk.com',
                'password' => Hash::make('Admin@2026!'),
                'role' => 'super_admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $this->command->info('✅ Super Admin created: admin@banitalk.com / Admin@2026!');
        } else {
            $this->command->info('⏭️  Super Admin already exists.');
        }

        // Create Regular Admin if not exists
        if (!User::where('email', 'moderator@banitalk.com')->exists()) {
            User::create([
                'name' => 'Moderator',
                'username' => 'moderator',
                'email' => 'moderator@banitalk.com',
                'password' => Hash::make('Moderator@2026!'),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            $this->command->info('✅ Admin created: moderator@banitalk.com / Moderator@2026!');
        } else {
            $this->command->info('⏭️  Admin already exists.');
        }

        // Seed default platform settings
        $defaults = [
            ['key' => 'app_name', 'value' => 'BaniTalk', 'type' => 'string', 'group' => 'general', 'description' => 'Application name'],
            ['key' => 'maintenance_mode', 'value' => 'false', 'type' => 'boolean', 'group' => 'general', 'description' => 'Enable maintenance mode'],
            ['key' => 'max_upload_size_mb', 'value' => '10', 'type' => 'integer', 'group' => 'uploads', 'description' => 'Maximum file upload size in MB'],
            ['key' => 'auto_translate_enabled', 'value' => 'true', 'type' => 'boolean', 'group' => 'translation', 'description' => 'Enable auto-translation for messages'],
            ['key' => 'daily_translation_limit', 'value' => '100', 'type' => 'integer', 'group' => 'translation', 'description' => 'Daily translation requests per user'],
            ['key' => 'gift_sending_enabled', 'value' => 'true', 'type' => 'boolean', 'group' => 'gifts', 'description' => 'Enable gift sending'],
            ['key' => 'min_coin_topup', 'value' => '100', 'type' => 'integer', 'group' => 'economy', 'description' => 'Minimum coin top-up amount'],
            ['key' => 'voice_room_max_capacity', 'value' => '100', 'type' => 'integer', 'group' => 'rooms', 'description' => 'Default max voice room capacity'],
            ['key' => 'report_rate_limit_per_hour', 'value' => '5', 'type' => 'integer', 'group' => 'moderation', 'description' => 'Max reports a user can submit per hour'],
        ];

        foreach ($defaults as $setting) {
            PlatformSetting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('✅ Seeded ' . count($defaults) . ' default platform settings.');
    }
}
