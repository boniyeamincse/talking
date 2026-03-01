# CSRF Token Mismatch Fix

## Problem
The login page was showing "CSRF token mismatch" error when attempting to sign in.

## Root Cause
The frontend was not fetching the CSRF cookie from Laravel Sanctum before making the login request. Laravel requires the CSRF cookie to be set before any state-changing requests (POST, PUT, DELETE) when using cookie-based authentication.

## Solution Applied

### 1. Updated API Client (`dashboard/src/lib/api.ts`)
- Added `getCsrfCookie()` method that fetches the CSRF cookie from `/sanctum/csrf-cookie`
- Modified the `login` method to call `getCsrfCookie()` before making the login request
- This ensures the CSRF token is available for validation

### 2. Updated Backend Configuration (`api/.env`)
- Set `SESSION_DOMAIN=localhost` for proper cookie domain
- Set `SESSION_SAME_SITE=none` to allow cross-origin cookie sharing
- Set `SESSION_SECURE_COOKIE=false` for local development (use `true` in production with HTTPS)

### 3. Cleared Laravel Configuration Cache
- Ran `php artisan config:clear` to apply the new settings

## How It Works
1. User enters credentials and clicks "Sign In"
2. Frontend calls `getCsrfCookie()` which fetches `/sanctum/csrf-cookie`
3. Laravel sets the XSRF-TOKEN cookie in the browser
4. Frontend makes the login POST request with `credentials: 'include'`
5. Browser automatically includes the CSRF cookie
6. Laravel validates the CSRF token and processes the login

## Testing
1. Restart the Laravel backend: `php artisan serve` (in api folder)
2. Restart the Next.js frontend: `npm run dev` (in dashboard folder)
3. Navigate to `http://localhost:3000/login`
4. Enter credentials and sign in
5. The CSRF error should be resolved

## Production Considerations
For production deployment, update these settings:
- `SESSION_SECURE_COOKIE=true` (requires HTTPS)
- `SESSION_SAME_SITE=lax` or `strict` (depending on your setup)
- Ensure `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS` match your production domains
