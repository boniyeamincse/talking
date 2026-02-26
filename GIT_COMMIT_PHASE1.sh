#!/bin/bash

# Talkin API - Phase 1 Git Commit Script
# This script will commit all Phase 1 changes to git

echo "🚀 Talkin API - Phase 1 Git Commit"
echo "=================================="
echo ""

# Navigate to project directory
cd /home/boni/Documents/boniyeamin

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo ""
fi

# Add all Phase 1 files
echo "📝 Adding Phase 1 files..."
echo ""

# Migrations
git add api/database/migrations/2024_01_01_000001_create_languages_table.php
git add api/database/migrations/2024_01_01_000002_update_users_table.php
git add api/database/migrations/2024_01_01_000003_create_profiles_table.php
git add api/database/migrations/2024_01_01_000004_create_user_languages_table.php
git add api/database/migrations/2024_01_01_000005_create_password_reset_tokens_table.php

# Models
git add api/app/Models/User.php
git add api/app/Models/Profile.php
git add api/app/Models/Language.php
git add api/app/Models/UserLanguage.php

# Controllers
git add api/app/Http/Controllers/Api/BaseController.php
git add api/app/Http/Controllers/Api/AuthController.php
git add api/app/Http/Controllers/Api/UserController.php
git add api/app/Http/Controllers/Api/ProfileController.php

# Resources
git add api/app/Http/Resources/UserResource.php
git add api/app/Http/Resources/ProfileResource.php
git add api/app/Http/Resources/UserLanguageResource.php

# Requests
git add api/app/Http/Requests/Auth/RegisterRequest.php
git add api/app/Http/Requests/Auth/LoginRequest.php
git add api/app/Http/Requests/Auth/ForgotPasswordRequest.php
git add api/app/Http/Requests/Auth/ResetPasswordRequest.php

# Middleware
git add api/app/Http/Middleware/ForceJsonResponse.php
git add api/app/Http/Middleware/UpdateLastSeen.php

# Seeders
git add api/database/seeders/LanguageSeeder.php
git add api/database/seeders/DatabaseSeeder.php

# Routes
git add api/routes/api.php

# Config
git add api/bootstrap/app.php
git add api/.env

# Documentation
git add api/PHASE1_SETUP.md
git add api/Talkin_API_Phase1.postman_collection.json
git add PHASE1_COMPLETE.md
git add DEVELOPMENT_PLAN.md

echo "✅ Files staged for commit"
echo ""

# Show status
echo "📊 Git Status:"
git status --short
echo ""

# Commit
echo "💾 Creating commit..."
git commit -m "feat: Phase 1 - Authentication & User Management

✨ Features:
- User registration with email verification
- Login/logout with JWT tokens (Laravel Sanctum)
- Password reset flow
- User profile management
- Avatar upload
- Multi-language support (native & learning)
- User search functionality

🗄️ Database:
- Created 5 migrations (users, profiles, languages, user_languages)
- Seeded 30 common languages

🔐 Security:
- Rate limiting on login (5 attempts/15 min)
- Password hashing (bcrypt)
- Email verification
- Input validation on all endpoints

📦 API Endpoints (17 total):
Auth Module (8):
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- POST /api/v1/auth/refresh
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password
- GET /api/v1/auth/verify-email/{id}/{hash}
- POST /api/v1/auth/resend-verification

User Module (4):
- GET /api/v1/users/me
- PUT /api/v1/users/me
- GET /api/v1/users/{id}
- GET /api/v1/users/search

Profile Module (5):
- GET /api/v1/profiles/me
- PUT /api/v1/profiles/me
- POST /api/v1/profiles/me/photo
- PUT /api/v1/profiles/me/languages
- GET /api/v1/profiles/{id}

📚 Documentation:
- Setup guide (PHASE1_SETUP.md)
- Postman collection included
- Development plan updated

🎯 Status: Phase 1 Complete (Tasks 010-031)
"

echo ""
echo "✅ Commit created successfully!"
echo ""

# Instructions for pushing to GitHub
echo "📤 Next Steps - Push to GitHub:"
echo "================================"
echo ""
echo "If you haven't set up a remote repository yet:"
echo "  git remote add origin https://github.com/YOUR_USERNAME/talkin.git"
echo ""
echo "To push to GitHub:"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
echo "Or if you already have a remote:"
echo "  git push"
echo ""
echo "🎉 Phase 1 is ready to be pushed to GitHub!"
