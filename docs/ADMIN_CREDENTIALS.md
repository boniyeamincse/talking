# BaniTalk Admin Credentials

## Updated Seed Data

The database seeders have been updated with the following admin accounts:

### Super Admin Account
- **Email:** admin@banitalk.com
- **Password:** Admin@2026!
- **Role:** super_admin
- **Permissions:** Full system access

### Moderator Account
- **Email:** moderator@banitalk.com
- **Password:** Moderator@2026!
- **Role:** admin
- **Permissions:** Standard admin access

## How to Seed the Database

Run one of the following commands in the `api` directory:

```bash
# Seed all data (including languages and gifts)
php artisan db:seed

# Seed only admin users and platform settings
php artisan db:seed --class=RoleSeeder

# Fresh migration with all seeds (WARNING: Drops all tables)
php artisan migrate:fresh --seed
```

## Platform Settings

The seeder also creates default platform settings:
- App name: BaniTalk
- Maintenance mode: Disabled
- Max upload size: 10 MB
- Auto-translation: Enabled
- Daily translation limit: 100 requests per user
- Gift sending: Enabled
- Min coin top-up: 100 coins
- Voice room max capacity: 100 users
- Report rate limit: 5 per hour

## Login URL

Access the admin dashboard at: http://localhost:3000/login

## Security Notes

- Change these default passwords in production
- Use strong, unique passwords for each admin account
- Enable 2FA if available
- Regularly audit admin access logs
