# Dashboard Test Credentials

## Admin User

**Email:** admin@banitalk.com  
**Password:** password123  
**Role:** admin  
**Status:** active

## Super Admin User (Create if needed)

```bash
cd api
php artisan tinker

# Create super admin
App\Models\User::create([
    'name' => 'Super Admin',
    'username' => 'superadmin',
    'email' => 'superadmin@banitalk.com',
    'password' => bcrypt('password123'),
    'role' => 'super_admin',
    'status' => 'active',
    'email_verified_at' => now()
]);

# Create profile
$user = App\Models\User::where('email', 'superadmin@banitalk.com')->first();
App\Models\Profile::create(['user_id' => $user->id]);
```

## Testing

1. Start Laravel: `cd api && php artisan serve`
2. Start Next.js: `cd dashboard && npm run dev`
3. Visit: `http://localhost:3000/login`
4. Login with credentials above

## API Response Format

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "uuid": "...",
      "username": "admin",
      "email": "admin@banitalk.com",
      "role": "admin",
      "status": "active"
    },
    "token": "1|...",
    "expires_at": "2026-04-30T07:20:52.836554Z"
  }
}
```
