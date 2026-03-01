# CSRF Token Fix - Quick Test

## Test Login Endpoint

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -d '{"email":"admin@banitalk.com","password":"password123"}'
```

## Expected Response
```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "Super Admin",
      "email": "admin@banitalk.com",
      "role": "super_admin"
    },
    "token": "1|xxxxx..."
  }
}
```

## Changes Made

1. **API Service** (`dashboard/src/lib/api.ts`)
   - Added `X-Requested-With: XMLHttpRequest` header
   - Added `credentials: 'include'` for CORS

2. **Laravel Config** (already configured)
   - CSRF excluded for `api/*` routes
   - CORS allows credentials
   - Sanctum stateful domains includes localhost:3000

3. **Cache Cleared**
   - Config cache cleared
   - Application cache cleared

## Login Now

1. Go to: `http://localhost:3000/login`
2. Email: `admin@banitalk.com`
3. Password: `password123`
4. Click Login

The CSRF error should be resolved.
