# 🌍 Talkin - Global Multilingual Communication Platform

> Breaking language barriers through real-time AI translation, social connection, and cultural exchange.

[![Laravel](https://img.shields.io/badge/Backend-Laravel%2012-red?logo=laravel)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-blue?logo=php)](https://php.net)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 About

**Talkin** is a real-time global multilingual social communication platform where users from different countries and cultural backgrounds connect through text, voice, and video — with language barriers removed via instant AI translation.

### Key Features
- 💬 Real-time messaging with auto-translation
- 🎧 Audio & video calls (WebRTC)
- 🎙️ Live voice rooms
- 📰 Social feed with cultural exchange
- 🎁 Virtual gift economy
- 🤝 AI-powered partner matching
- 📚 Language learning tools

---

## 🚀 Current Status

### ✅ Phase 1: Authentication & User Management (COMPLETE)

**17 API Endpoints Implemented:**

#### Auth Module (8 endpoints)
- User registration with email verification
- Login/logout with JWT tokens
- Password reset flow
- Token refresh

#### User Module (4 endpoints)
- Get/update authenticated user
- View user profiles
- Search users

#### Profile Module (5 endpoints)
- Profile management (bio, avatar, languages)
- Avatar upload
- Multi-language support (native & learning)
- Cultural interests

**Database:**
- 5 migrations created
- 4 models (User, Profile, Language, UserLanguage)

**Documentation:**
- Complete setup guide: `api/PHASE1_SETUP.md`
- Postman collection: `api/Talkin_API_Phase1.postman_collection.json`

---

### ✅ Phase 2: Social Features (COMPLETE)

**8 API Endpoints Implemented:**

#### Follow System (4 endpoints)
- Follow/unfollow users
- View followers and following lists
- Follower count caching for performance

#### Block System (3 endpoints)
- Block/unblock users
- View blocked users list
- Automatic unfollow on block
- Block enforcement across all endpoints

#### Advanced User Search (1 endpoint + features)
- Full-text search (username, email, display name, bio)
- Multiple filters: country, gender, language, age range, interests
- Sort options: relevance, followers, recent
- Popular search queries tracking
- Search caching with Redis

**Database:**
- 3 new migrations (follows, blocks, follower counts)
- 2 new models (Follow, Block)
- Updated User and Profile models

**Documentation:**
- Complete setup guide: `api/PHASE2_SETUP.md`
- Postman collection: `api/Talkin_API_Phase2.postman_collection.json`
- Comprehensive spec: `.kiro/specs/phase2-social-features/`

---

### 🔜 Phase 3: Chat System (NEXT)

**Planned Features:**
- Real-time messaging with WebSocket
- 1-to-1 and group chat
- Media sharing (images, videos, audio)
- Message status tracking
- Typing indicators
- Online/offline status

**Timeline:** Weeks 7-9 (20 tasks)
- 30 languages seeded
- User roles: user, admin, super_admin

**Security:**
- Rate limiting (5 login attempts/15 min)
- Password hashing (bcrypt)
- Email verification
- Input validation

---

## 📦 Installation

### Prerequisites
- PHP 8.2+
- Composer
- MySQL 8.0+ or PostgreSQL 14+
- Node.js & NPM (for frontend)

### Quick Start

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/talkin.git
cd talkin

# Install API dependencies
cd api
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Update .env with your database credentials
# DB_DATABASE=talkin
# DB_USERNAME=root
# DB_PASSWORD=

# Run migrations and seed
php artisan migrate
php artisan db:seed

# Create storage link
php artisan storage:link

# Start development server
php artisan serve
```

API will be available at `http://localhost:8000`

---

## 📚 Documentation

- **Setup Guide**: [api/PHASE1_SETUP.md](api/PHASE1_SETUP.md)
- **Development Plan**: [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md)
- **API Documentation**: See Postman collection
- **Architecture**: [docs/blueprint/architecture.md](docs/blueprint/architecture.md)
- **Database Schema**: [docs/blueprint/database.md](docs/blueprint/database.md)

---

## 🧪 Testing

### Using Postman

Import the collection:
```
api/Talkin_API_Phase1.postman_collection.json
```

### Example API Calls

**Register:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "password_confirmation": "SecurePass123",
    "native_language": "en",
    "learning_language": "es"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

---

## 🗺️ Roadmap

- [x] **Phase 1**: Authentication & User Management (Weeks 1-4)
- [ ] **Phase 2**: Social Features (Follow/Block) (Weeks 5-6)
- [ ] **Phase 3**: Chat System (Real-time messaging) (Weeks 7-9)
- [ ] **Phase 4**: Calls & Video (WebRTC) (Weeks 10-12)
- [ ] **Phase 5**: Voice Rooms (Weeks 13-15)
- [ ] **Phase 6**: Social Feed (Weeks 16-17)
- [ ] **Phase 7**: Translation System (Weeks 18-19)
- [ ] **Phase 8**: Gift System (Weeks 20-21)
- [ ] **Phase 9**: Matching Algorithm (Weeks 22-23)
- [ ] **Phase 10**: Notifications (Weeks 24-25)
- [ ] **Phase 11**: Reports & Moderation (Week 26)
- [ ] **Phase 12**: Admin Dashboard (Weeks 27-28)

See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for detailed roadmap.

---

## 🏗️ Tech Stack

### Backend
- **Framework**: Laravel 12
- **Language**: PHP 8.2+
- **Database**: MySQL / PostgreSQL
- **Cache**: Redis
- **Queue**: Laravel Horizon
- **Storage**: AWS S3 / MinIO
- **Auth**: Laravel Sanctum (JWT)

### Frontend (Planned)
- **Web**: React + TypeScript
- **Mobile**: Flutter (iOS + Android)

### Real-time
- **WebSocket**: Laravel Echo + Socket.io
- **Voice/Video**: WebRTC

### External Services
- **Translation**: Google Translate API / DeepL
- **Push Notifications**: Firebase Cloud Messaging
- **Payment**: Stripe / PayPal

---

## 📁 Project Structure

```
talkin/
├── api/                          # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # API Controllers
│   │   │   ├── Middleware/       # Custom Middleware
│   │   │   ├── Requests/         # Form Requests
│   │   │   └── Resources/        # API Resources
│   │   └── Models/               # Eloquent Models
│   ├── database/
│   │   ├── migrations/           # Database Migrations
│   │   └── seeders/              # Database Seeders
│   ├── routes/
│   │   └── api.php               # API Routes
│   └── PHASE1_SETUP.md           # Setup Guide
├── docs/                         # Documentation
│   ├── blueprint/                # Architecture & Design
│   └── dev/                      # Development Docs
├── DEVELOPMENT_PLAN.md           # Full Development Plan
├── PHASE1_COMPLETE.md            # Phase 1 Summary
└── README.md                     # This file
```

---

## 🤝 Contributing

This is currently a private development project. Contributions will be opened after beta launch.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👥 Team

- **Backend Development**: Laravel API
- **Frontend Development**: React + Flutter (Coming soon)
- **DevOps**: CI/CD & Infrastructure (Coming soon)

---

## 📞 Contact

For questions or support, please open an issue on GitHub.

---

## 🎯 Current Sprint

**Phase 1 Complete** ✅
- 17 API endpoints
- User authentication
- Profile management
- Multi-language support

**Next: Phase 2** 🚀
- Follow/unfollow system
- Block/unblock users
- User discovery

---

**Last Updated**: February 26, 2026  
**Version**: 1.0.0-phase1  
**Status**: Phase 1 Complete - Ready for Phase 2
