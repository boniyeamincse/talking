# CSRF Token Mismatch - FIXED

## Problem
Laravel Sanctum CSRF token mismatch when calling API from Next.js dashboard.

## Solution Applied

### 1. CSRF Middleware (`api/app/Http/Middleware/VerifyCsrfToken.php`)
```php
protected $except = [
    'api/*',  // Exclude all API routes from CSRF
];
```

### 2. CORS Configuration (`api/config/cors.php`)
```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
'supports_credentials' => true,
```

### 3. Environment Variables (`api/.env`)
```env
FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### 4. API Service (`dashboard/src/lib/api.ts`)
```typescript
headers: {
  'Content-Type': 'application/json',
  'Accept': 'application/json',  // Added
}
```

## How It Works

**Token-Based Auth (No CSRF needed):**
- API uses Bearer tokens via `Authorization` header
- CSRF protection excluded for `api/*` routes
- CORS configured for localhost:3000

## Test

```bash
# Restart Laravel
cd api
php artisan config:clear
php artisan serve

# Restart Next.js
cd dashboard
npm run dev

# Login at http://localhost:3000/login
```

## Production Setup

Update `api/.env`:
```env
FRONTEND_URL=https://dashboard.banitalk.com
SANCTUM_STATEFUL_DOMAINS=dashboard.banitalk.com
```

✅ **CSRF issue resolved!**
