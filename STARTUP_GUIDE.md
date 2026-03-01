# 🚀 BANITALK - STARTUP GUIDE

## 📦 Project Structure

```
talking/
├── api/              # Laravel Backend (Port 8000)
├── web/              # React Web App (Port 3000)
├── dashboard/        # Next.js Admin Dashboard (Port 3001)
├── apk/              # Flutter Mobile App
└── startup scripts   # Quick launch scripts
```

## ⚡ Quick Start (Recommended)

### Option 1: Start Everything at Once
```bash
# Double-click this file:
start-all.bat
```

This will launch:
- ✅ Laravel Backend API → http://localhost:8000
- ✅ React Web App → http://localhost:3000

---

## 🔧 Manual Start (Individual Services)

### 1. Start Backend API Only
```bash
start-backend.bat
```
- Laravel API runs on: **http://localhost:8000**
- API endpoints: **http://localhost:8000/api/v1/**

### 2. Start Web App Only
```bash
start-web.bat
```
- React Web runs on: **http://localhost:3000**

### 3. Start Admin Dashboard (Separate)
```bash
cd dashboard
npm run dev
```
- Admin Dashboard: **http://localhost:3001**

---

## 🗄️ Database Setup (First Time Only)

### 1. Create Database
```sql
CREATE DATABASE bonitalk;
```

### 2. Run Migrations
```bash
cd api
php artisan migrate --seed
```

### 3. Test Credentials
```
Email: admin@banitalk.com
Password: Admin@2026!
```

---

## 🌐 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | http://localhost:8000 | Laravel REST API |
| Web App | http://localhost:3000 | React User Interface |
| Admin Dashboard | http://localhost:3001 | Next.js Admin Panel |
| API Docs | http://localhost:8000/api/documentation | Swagger/OpenAPI |

---

## 🔍 Verify Services

### Check Backend API
```bash
curl http://localhost:8000/api/v1/health
```

### Check Web App
Open browser: http://localhost:3000

---

## 🛑 Stop Services

### Stop All
Close the command windows or press `Ctrl+C` in each terminal

### Kill Ports (Force Stop)
```bash
# Kill port 8000 (Backend)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Kill port 3000 (Web)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### Backend Not Starting
```bash
cd api
composer install
php artisan key:generate
php artisan config:clear
php artisan cache:clear
```

### Web App Not Starting
```bash
cd web
npm install
npm run dev
```

### Database Connection Error
1. Check MySQL is running
2. Verify `.env` database credentials in `api/.env`
3. Create database: `CREATE DATABASE bonitalk;`
4. Run migrations: `php artisan migrate`

---

## 📝 Environment Files

### Backend: `api/.env`
```env
DB_DATABASE=bonitalk
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:3000
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### Web: `web/.env`
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:6001
```

### Dashboard: `dashboard/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 🔐 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@banitalk.com | Admin@2026! |
| Admin | moderator@banitalk.com | Moderator@2026! |
| User | user@example.com | password |

---

## 📊 Development Workflow

### 1. Start Services
```bash
start-all.bat
```

### 2. Open in Browser
- Web App: http://localhost:3000
- Admin: http://localhost:3001

### 3. Make Changes
- Backend: Edit files in `api/`
- Web: Edit files in `web/src/`
- Hot reload is enabled

### 4. Test
```bash
# Backend tests
cd api && php artisan test

# Web tests
cd web && npm run test
```

---

## 🚀 Production Build

### Backend
```bash
cd api
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Web
```bash
cd web
npm run build
# Output: web/dist/
```

### Dashboard
```bash
cd dashboard
npm run build
# Output: dashboard/.next/
```

---

## 📦 Docker (Optional)

```bash
docker-compose up -d
```

Services will run on same ports.

---

## 💡 Tips

1. **Always start backend before web app**
2. **Keep terminal windows open** while developing
3. **Check console for errors** in browser DevTools
4. **Use test credentials** for quick login
5. **Clear cache** if you see stale data

---

## 📞 Support

- Documentation: `/docs/`
- Issues: Check console logs
- Database: Check `api/database/migrations/`

---

**Status**: ✅ Ready for Development  
**Last Updated**: 2026-02-28
