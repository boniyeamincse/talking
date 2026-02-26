# Phase 2: Social Features - Setup Guide

## ✅ Completed Features

### Follow System (5 endpoints)
- ✅ POST `/api/v1/users/{id}/follow` - Follow a user
- ✅ DELETE `/api/v1/users/{id}/follow` - Unfollow a user
- ✅ GET `/api/v1/users/{id}/followers` - Get user's followers list
- ✅ GET `/api/v1/users/{id}/following` - Get user's following list
- ✅ Follower count caching in profiles table

### Block System (3 endpoints)
- ✅ POST `/api/v1/users/{id}/block` - Block a user
- ✅ DELETE `/api/v1/users/{id}/block` - Unblock a user
- ✅ GET `/api/v1/users/blocked` - Get blocked users list
- ✅ Block middleware for preventing interactions

### User Search & Discovery (9 features)
- ✅ GET `/api/v1/users/search` - Advanced user search with filters
- ✅ Full-text search (username, email, display name, bio)
- ✅ Country filter (2-letter country code)
- ✅ Gender filter (male, female, other)
- ✅ Language filter (by language_id)
- ✅ Age range filter (min_age, max_age)
- ✅ Interests filter (cultural_interests array)
- ✅ Sort options (relevance, followers, recent)
- ✅ GET `/api/v1/users/popular-searches` - Get popular search queries
- ✅ Search query tracking and caching
- ✅ Updated user search to exclude blocked users
- ✅ Added relationship flags (is_following, is_followed_by, is_blocked)
- ✅ Block checks on user profile views

## 📦 Installation Steps

### 1. Run New Migrations

```bash
cd api
php artisan migrate
```

This will create:
- `follows` table
- `blocks` table
- Add `followers_count` and `following_count` to `profiles` table

### 2. Clear Cache

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

## 🧪 Testing the API

### Follow a User

```bash
curl -X POST http://localhost:8000/api/v1/users/2/follow \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "success": true,
  "message": "Successfully followed user",
  "data": {
    "following": true,
    "followers_count": 1,
    "following_count": 1
  }
}
```

### Unfollow a User

```bash
curl -X DELETE http://localhost:8000/api/v1/users/2/follow \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get User's Followers

```bash
curl -X GET "http://localhost:8000/api/v1/users/2/followers?per_page=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get User's Following

```bash
curl -X GET "http://localhost:8000/api/v1/users/2/following?per_page=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Block a User

```bash
curl -X POST http://localhost:8000/api/v1/users/2/block \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "success": true,
  "message": "User blocked successfully",
  "data": {
    "blocked": true
  }
}
```

### Unblock a User

```bash
curl -X DELETE http://localhost:8000/api/v1/users/2/block \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Blocked Users List

```bash
curl -X GET http://localhost:8000/api/v1/users/blocked \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔍 User Search & Discovery

### Basic Search

```bash
curl -X GET "http://localhost:8000/api/v1/users/search?q=john&per_page=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search with Country Filter

```bash
curl -X GET "http://localhost:8000/api/v1/users/search?q=john&country=US" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search with Gender Filter

```bash
curl -X GET "http://localhost:8000/api/v1/users/search?gender=male&per_page=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search with Language Filter

```bash
curl -X GET "http://localhost:8000/api/v1/users/search?language_id=1&per_page=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search with Age Range

```bash
curl -X GET "http://localhost:8000/api/v1/users/search?min_age=25&max_age=35" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search with Interests

```bash
curl -X GET "http://localhost:8000/api/v1/users/search?interests[]=music&interests[]=travel" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Sort by Followers

```bash
curl -X GET "http://localhost:8000/api/v1/users/search?q=john&sort=followers" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Sort by Recent

```bash
curl -X GET "http://localhost:8000/api/v1/users/search?sort=recent&per_page=20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Popular Searches

```bash
curl -X GET "http://localhost:8000/api/v1/users/popular-searches?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "query": "john",
      "count": 45
    },
    {
      "query": "language exchange",
      "count": 32
    }
  ]
}
```

## 📁 New Files Created

### Migrations (3 files)
- `create_follows_table.php`
- `create_blocks_table.php`
- `add_follower_counts_to_profiles_table.php`

### Models (2 files)
- `Follow.php`
- `Block.php`

### Controllers (1 file)
- `SocialController.php` (7 methods)

### Updated Files
- `User.php` - Added follow/block relationships and helper methods
- `Profile.php` - Added followers_count and following_count
- `UserController.php` - Added block checks and advanced search with filters
- `UserResource.php` - Added relationship flags
- `ProfileResource.php` - Added follower counts
- `api.php` - Added 8 new routes (7 social + 1 popular searches)
- `bootstrap/app.php` - Registered CheckBlockedUsers middleware

### New Services
- `SearchCacheService.php` - Search caching and popular queries tracking

## 🔐 Security Features

- ✅ Cannot follow/block yourself
- ✅ Cannot follow blocked users
- ✅ Cannot view blocked users' profiles
- ✅ Blocked users excluded from search results
- ✅ Automatic unfollow when blocking
- ✅ Follower count updates in transactions

## 📊 Database Schema

### follows
- follower_id (who is following)
- following_id (who is being followed)
- created_at
- Unique constraint on (follower_id, following_id)

### blocks
- blocker_id (who is blocking)
- blocked_id (who is being blocked)
- created_at
- Unique constraint on (blocker_id, blocked_id)

### profiles (updated)
- followers_count (cached count)
- following_count (cached count)

## 🎯 Business Logic

### Follow System
1. User A follows User B
2. `followers_count` incremented for User B
3. `following_count` incremented for User A
4. Notification sent to User B (TODO)

### Block System
1. User A blocks User B
2. All follow relationships removed (both directions)
3. Follower counts updated accordingly
4. User B cannot see User A's profile
5. User A cannot see User B's profile
6. Both users excluded from each other's search results

## 🚀 Next Steps

Phase 2 is complete! Next phases:

- **Phase 3**: Chat System (Real-time messaging)
- **Phase 4**: Calls & Video (WebRTC)
- **Phase 5**: Voice Rooms
- And more...

## 📝 Notes

- Follower counts are cached in the profiles table for performance
- Block checks are performed on all user interactions
- Notifications for follows will be implemented in Phase 10
- Consider adding rate limiting for follow/unfollow actions

## 🐛 Troubleshooting

### Migration Errors
```bash
php artisan migrate:fresh --seed
```

### Follower Count Mismatch
If counts get out of sync, you can recalculate:
```php
// In tinker: php artisan tinker
$user = User::find(1);
$user->profile->update([
    'followers_count' => $user->followers()->count(),
    'following_count' => $user->following()->count(),
]);
```

## ✅ Status Update

Update `docs/dev/task_api.md` status for completed tasks:
- TASK-023 through TASK-025: ✅ Done (Follow/Block/Search)
