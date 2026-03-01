# Quick Start Guide - Dashboard Authentication

## Prerequisites
- Laravel API running on `http://localhost:8000`
- Node.js 18+ installed
- Admin user created in database

---

## Setup Steps

### 1. Install Dependencies
```bash
cd dashboard
npm install
```

### 2. Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Start Development Server
```bash
npm run dev
```

Dashboard will run on `http://localhost:3000`

---

## Test Authentication

### 1. Access Login Page
Navigate to: `http://localhost:3000/login`

### 2. Login with Admin Credentials
Use credentials from `docs/qa/CREDENTIALS.md`:
```
Email: admin@banitalk.com
Password: password123
```

### 3. Verify Dashboard Access
After login, you should be redirected to `/admin`

### 4. Test Logout
Click the logout button in the sidebar

---

## API Endpoints Required

Ensure these Laravel endpoints are working:

```bash
# Test login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@banitalk.com","password":"password123"}'

# Test me endpoint (with token)
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test refresh
curl -X POST http://localhost:8000/api/v1/auth/refresh \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test logout
curl -X POST http://localhost:8000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### CORS Issues
Add to Laravel `config/cors.php`:
```php
'paths' => ['api/*'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### Token Not Persisting
Check browser localStorage:
```javascript
// In browser console
localStorage.getItem('admin_token')
```

### Middleware Not Working
Clear Next.js cache:
```bash
rm -rf .next
npm run dev
```

---

## Features to Test

- ✅ Login with valid credentials
- ✅ Login with invalid credentials (error message)
- ✅ Login with non-admin user (access denied)
- ✅ Rate limiting (5 failed attempts)
- ✅ Session persistence (refresh page)
- ✅ Automatic token refresh
- ✅ Logout functionality
- ✅ Protected route access
- ✅ Redirect from login when authenticated

---

## Production Deployment

### Update Environment
```env
NEXT_PUBLIC_API_URL=https://api.banitalk.com/api/v1
```

### Build for Production
```bash
npm run build
npm start
```

---

**Ready to use!** 🚀
