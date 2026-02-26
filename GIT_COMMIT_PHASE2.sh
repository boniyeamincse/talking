#!/bin/bash

# Talkin API - Phase 2: Social Features
# Git commit script for Phase 2 completion

echo "========================================="
echo "Talkin API - Phase 2 Git Commit"
echo "========================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not a git repository"
    echo "Please run 'git init' first"
    exit 1
fi

# Add all Phase 2 files
echo "📦 Adding Phase 2 files to git..."

# Migrations
git add api/database/migrations/2024_01_02_000001_create_follows_table.php
git add api/database/migrations/2024_01_02_000002_create_blocks_table.php
git add api/database/migrations/2024_01_02_000003_add_follower_counts_to_profiles_table.php

# Models
git add api/app/Models/Follow.php
git add api/app/Models/Block.php
git add api/app/Models/User.php
git add api/app/Models/Profile.php

# Controllers
git add api/app/Http/Controllers/Api/SocialController.php
git add api/app/Http/Controllers/Api/UserController.php

# Middleware
git add api/app/Http/Middleware/CheckBlockedUsers.php

# Services
git add api/app/Services/SearchCacheService.php

# Resources
git add api/app/Http/Resources/UserResource.php
git add api/app/Http/Resources/ProfileResource.php

# Routes and Config
git add api/routes/api.php
git add api/bootstrap/app.php

# Documentation
git add api/PHASE2_SETUP.md
git add api/Talkin_API_Phase2.postman_collection.json
git add PHASE2_COMPLETE.md

# Spec files
git add .kiro/specs/phase2-social-features/

echo "✅ Files added successfully"
echo ""

# Create commit
echo "📝 Creating commit..."
git commit -m "feat: Complete Phase 2 - Social Features

Implemented comprehensive social features including follow/unfollow system,
user blocking, and advanced user search with multiple filters.

## Features Implemented

### Follow System (5 endpoints)
- POST /api/v1/users/{id}/follow - Follow a user
- DELETE /api/v1/users/{id}/follow - Unfollow a user
- GET /api/v1/users/{id}/followers - Get followers list
- GET /api/v1/users/{id}/following - Get following list
- Follower count caching in profiles table

### Block System (5 endpoints)
- POST /api/v1/users/{id}/block - Block a user
- DELETE /api/v1/users/{id}/block - Unblock a user
- GET /api/v1/users/blocked - Get blocked users list
- CheckBlockedUsers middleware for interaction prevention
- Block checks integrated across all endpoints

### User Search & Discovery (5 features)
- GET /api/v1/users/search - Advanced search with filters
- Full-text search (username, email, display name, bio)
- Filters: country, gender, language, age range, interests
- Sort options: relevance, followers, recent
- GET /api/v1/users/popular-searches - Popular query tracking
- Search caching with Redis

## Database Changes
- Created follows table with unique constraints
- Created blocks table with unique constraints
- Added followers_count and following_count to profiles table
- Added indexes for performance optimization

## New Files
- Follow.php model
- Block.php model
- SocialController.php (7 methods)
- CheckBlockedUsers.php middleware
- SearchCacheService.php service
- Talkin_API_Phase2.postman_collection.json
- PHASE2_SETUP.md documentation
- Complete spec files in .kiro/specs/phase2-social-features/

## Updated Files
- User.php - Added relationships and helper methods
- Profile.php - Added follower counts
- UserController.php - Enhanced search with filters
- UserResource.php - Added relationship flags
- ProfileResource.php - Added follower counts
- api.php - Added 8 new routes
- bootstrap/app.php - Registered middleware

## Security Features
- Cannot follow/block yourself
- Cannot follow blocked users
- Blocked users cannot view profiles
- Blocked users excluded from search
- Automatic unfollow on block
- Transaction-based count updates

## Performance Optimizations
- Follower count caching
- Database indexes on foreign keys
- Eager loading to prevent N+1 queries
- Pagination on all list endpoints
- Redis-based search caching

## Testing
- All 8 endpoints tested with curl
- Postman collection with 17 requests
- Manual testing completed
- Block enforcement verified
- Search filters verified

## Documentation
- Complete setup guide with examples
- Postman collection for testing
- Comprehensive spec files
- Code comments throughout

Phase 2 Status: ✅ COMPLETE (15/15 tasks)
Next Phase: Phase 3 - Chat System

Closes #2"

if [ $? -eq 0 ]; then
    echo "✅ Commit created successfully"
    echo ""
    echo "========================================="
    echo "Phase 2 Commit Complete!"
    echo "========================================="
    echo ""
    echo "📊 Summary:"
    echo "  - 15 tasks completed"
    echo "  - 8 new endpoints"
    echo "  - 5 new files created"
    echo "  - 7 files updated"
    echo "  - Complete documentation"
    echo ""
    echo "🚀 Next Steps:"
    echo "  1. Review the commit: git log -1"
    echo "  2. Push to GitHub: git push origin main"
    echo "  3. Create Phase 2 tag: git tag -a v0.2.0 -m 'Phase 2: Social Features'"
    echo "  4. Push tag: git push origin v0.2.0"
    echo "  5. Begin Phase 3 planning"
    echo ""
else
    echo "❌ Error creating commit"
    exit 1
fi
