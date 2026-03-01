<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RoleBasedLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        User::create([
            'name' => 'Super Admin',
            'username' => 'superadmin',
            'email' => 'admin@banitalk.com',
            'password' => Hash::make('Admin@2026!'),
            'role' => 'super_admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        User::create([
            'name' => 'Moderator',
            'username' => 'moderator',
            'email' => 'moderator@banitalk.com',
            'password' => Hash::make('Moderator@2026!'),
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
    }

    public function test_super_admin_can_login()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'admin@banitalk.com',
            'password' => 'Admin@2026!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                    'expires_at'
                ]
            ]);

        $this->assertEquals('super_admin', $response->json('data.user.role'));
    }

    public function test_admin_can_login()
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'moderator@banitalk.com',
            'password' => 'Moderator@2026!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => ['id', 'name', 'email', 'role'],
                    'token',
                    'expires_at'
                ]
            ]);

        $this->assertEquals('admin', $response->json('data.user.role'));
    }

    public function test_super_admin_can_access_super_admin_routes()
    {
        $user = User::where('email', 'admin@banitalk.com')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/admin/admins');

        $response->assertStatus(200);
    }

    public function test_admin_can_access_admin_routes()
    {
        $user = User::where('email', 'moderator@banitalk.com')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/admin/users');

        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_super_admin_routes()
    {
        $user = User::where('email', 'moderator@banitalk.com')->first();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/admin/admins');

        $response->assertStatus(403);
    }

    public function test_regular_user_cannot_access_admin_routes()
    {
        $user = User::factory()->create(['role' => 'user']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->getJson('/api/v1/admin/users');

        $response->assertStatus(403);
    }
}
