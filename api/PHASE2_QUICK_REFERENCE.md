# Phase 2: Social Features - Quick Reference

## 🚀 Quick Start

```bash
# Run migrations
cd api
php artisan migrate

# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Start server
php artisan serve
```

## 📋 API Endpoints

### Follow System

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/{id}/follow` | Follow a user |
| DELETE | `/api/v1/users/{id}/follow` | Unfollow a user |
| GET | `/api/v1/users/{id}/followers` | Get followers list |
| GET | `/api/v1/users/{id}/following` | Get following list |

### Block System

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/{id}/block` | Block a user |
| DELETE | `/api/v1/users/{id}/block` | Unblock a user |
| GET | `/api/v1/users/blocked` | Get blocked users |

### Search & Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/search` | Advanced user search |
| GET | `/api/v1/users/popular-searches` | Get popular searches |

## 🔍 Search Parameters

```
q              - Search query (min 2 chars)
country        - 2-letter country code (e.g., US, UK)
gender         - male, female, other
language_id    - Language ID from languages table
min_age        - Minimum age (18-100)
max_age        - Maximum age (18-100)
interests[]    - Array of interests
per_page       - Results per page (1-50, default 20)
sort           - relevance, followers, recent
```

## 📝 Example Requests

### Follow a User
```bash
curl -X POST http://localhost:8000/api/v1/users/2/follow \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search with Filters
```bash
curl -X GET "http://localhost:8000/api/v1/users/search?q=john&country=US&gender=male&min_age=25&max_age=35&sort=followers" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Block a User
```bash
curl -X POST http://localhost:8000/api/v1/users/2/block \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔐 Security Rules

- ❌ Cannot follow/block yourself
- ❌ Cannot follow blocked users
- ❌ Cannot view blocked users' profiles
- ✅ Blocked users excluded from search
- ✅ Automatic unfollow on block
- ✅ All endpoints require authentication

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": null
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "last_page": 5
  }
}
```

## 🗄️ Database Tables

### follows
- follower_id → users.id
- following_id → users.id
- Unique: (follower_id, following_id)

### blocks
- blocker_id → users.id
- blocked_id → users.id
- Unique: (blocker_id, blocked_id)

### profiles (updated)
- followers_count (cached)
- following_count (cached)

## 🛠️ Helper Methods (User Model)

```php
$user->isFollowing($otherUser)           // Check if following
$user->isFollowedBy($otherUser)          // Check if followed by
$user->hasBlocked($otherUser)            // Check if blocked
$user->isBlockedBy($otherUser)           // Check if blocked by
$user->hasBlockedOrIsBlockedBy($other)   // Check either direction
```

## 🧪 Testing

### Postman Collection
Import `api/Talkin_API_Phase2.postman_collection.json`

### Environment Variables
- `base_url`: http://localhost:8000
- `access_token`: Your JWT token

### Test Sequence
1. Register/login to get token
2. Follow a user
3. Check followers list
4. Search users with filters
5. Block a user
6. Verify block enforcement
7. Unblock user
8. Unfollow user

## 🐛 Troubleshooting

### Follower Count Mismatch
```php
// In tinker: php artisan tinker
$user = User::find(1);
$user->profile->update([
    'followers_count' => $user->followers()->count(),
    'following_count' => $user->following()->count(),
]);
```

### Clear Search Cache
```php
// In tinker
$cache = app(\App\Services\SearchCacheService::class);
$cache->clearSearchCache();
$cache->clearPopularSearches();
```

### Migration Issues
```bash
php artisan migrate:fresh --seed
```

## 📚 Documentation

- **Full Setup Guide:** `api/PHASE2_SETUP.md`
- **Completion Summary:** `PHASE2_COMPLETE.md`
- **Spec Files:** `.kiro/specs/phase2-social-features/`
- **Development Plan:** `docs/dev/DEVELOPMENT_PLAN.md`

## ✅ Checklist

- [ ] Migrations run successfully
- [ ] All endpoints return 200 OK
- [ ] Follower counts update correctly
- [ ] Block enforcement works
- [ ] Search filters work
- [ ] Popular searches tracked
- [ ] Postman collection imported
- [ ] All tests passing

## 🚀 Next Phase

**Phase 3: Chat System**
- Real-time messaging
- WebSocket integration
- Media sharing
- 20 tasks, 3 weeks

---

**Quick Reference Version:** 1.0  
**Last Updated:** February 26, 2026
