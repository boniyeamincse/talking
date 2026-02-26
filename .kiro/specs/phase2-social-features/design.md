# Phase 2: Social Features - Design Document

## 1. Architecture Overview

The social features module implements a bidirectional relationship system (follows) and a unidirectional blocking system. The design prioritizes performance through count caching and uses database transactions to ensure data consistency.

### 1.1 Key Design Decisions

1. **Count Caching**: Follower/following counts are cached in the profiles table to avoid expensive COUNT queries
2. **Atomic Updates**: All count updates happen within database transactions
3. **Eager Loading**: Relationships are eager-loaded to prevent N+1 query problems
4. **Block Enforcement**: Block checks are performed at the controller level before any interaction
5. **Unique Constraints**: Database-level constraints prevent duplicate follows/blocks

## 2. Database Design

### 2.1 follows Table

```sql
CREATE TABLE follows (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    follower_id BIGINT UNSIGNED NOT NULL,
    following_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, following_id),
    INDEX idx_follower (follower_id),
    INDEX idx_following (following_id)
);
```

**Design Notes:**
- `follower_id`: The user who is following
- `following_id`: The user being followed
- Unique constraint prevents duplicate follows
- Cascade delete removes follows when user is deleted
- Indexes on both foreign keys for fast lookups

### 2.2 blocks Table

```sql
CREATE TABLE blocks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    blocker_id BIGINT UNSIGNED NOT NULL,
    blocked_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    
    FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_block (blocker_id, blocked_id),
    INDEX idx_blocker (blocker_id),
    INDEX idx_blocked (blocked_id)
);
```

**Design Notes:**
- `blocker_id`: The user who initiated the block
- `blocked_id`: The user being blocked
- Unique constraint prevents duplicate blocks
- Cascade delete removes blocks when user is deleted
- Indexes on both foreign keys for fast lookups

### 2.3 profiles Table (Updated)

```sql
ALTER TABLE profiles ADD COLUMN followers_count INT UNSIGNED DEFAULT 0;
ALTER TABLE profiles ADD COLUMN following_count INT UNSIGNED DEFAULT 0;
```

**Design Notes:**
- Cached counts for performance
- Updated atomically in transactions
- Can be recalculated if out of sync

## 3. Model Design

### 3.1 Follow Model

```php
class Follow extends Model
{
    protected $fillable = ['follower_id', 'following_id'];
    public $timestamps = false;
    
    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }
    
    public function following()
    {
        return $this->belongsTo(User::class, 'following_id');
    }
}
```

### 3.2 Block Model

```php
class Block extends Model
{
    protected $fillable = ['blocker_id', 'blocked_id'];
    public $timestamps = false;
    
    public function blocker()
    {
        return $this->belongsTo(User::class, 'blocker_id');
    }
    
    public function blocked()
    {
        return $this->belongsTo(User::class, 'blocked_id');
    }
}
```

### 3.3 User Model (Updated)

```php
class User extends Authenticatable
{
    // Relationships
    public function followers()
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->withTimestamps();
    }
    
    public function following()
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->withTimestamps();
    }
    
    public function blockedUsers()
    {
        return $this->belongsToMany(User::class, 'blocks', 'blocker_id', 'blocked_id')
            ->withTimestamps();
    }
    
    public function blockedBy()
    {
        return $this->belongsToMany(User::class, 'blocks', 'blocked_id', 'blocker_id')
            ->withTimestamps();
    }
    
    // Helper Methods
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }
    
    public function isFollowedBy(User $user): bool
    {
        return $this->followers()->where('follower_id', $user->id)->exists();
    }
    
    public function hasBlocked(User $user): bool
    {
        return $this->blockedUsers()->where('blocked_id', $user->id)->exists();
    }
    
    public function isBlockedBy(User $user): bool
    {
        return $this->blockedBy()->where('blocker_id', $user->id)->exists();
    }
    
    public function hasBlockedOrIsBlockedBy(User $user): bool
    {
        return $this->hasBlocked($user) || $this->isBlockedBy($user);
    }
}
```

## 4. API Design

### 4.1 Follow User

**Endpoint:** `POST /api/v1/users/{id}/follow`

**Request:**
```http
POST /api/v1/users/2/follow
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "Successfully followed user",
    "data": {
        "following": true,
        "followers_count": 15,
        "following_count": 23
    }
}
```

**Response (Error - Already Following):**
```json
{
    "success": false,
    "message": "You are already following this user",
    "errors": null
}
```

**Business Logic:**
1. Validate user exists and is not self
2. Check for block relationship
3. Check if already following
4. Create follow record in transaction
5. Increment both users' counts
6. Return updated counts

### 4.2 Unfollow User

**Endpoint:** `DELETE /api/v1/users/{id}/follow`

**Request:**
```http
DELETE /api/v1/users/2/follow
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "Successfully unfollowed user",
    "data": {
        "following": false,
        "followers_count": 14,
        "following_count": 22
    }
}
```

**Business Logic:**
1. Validate user exists and is not self
2. Check if currently following
3. Delete follow record in transaction
4. Decrement both users' counts
5. Return updated counts

### 4.3 Get Followers

**Endpoint:** `GET /api/v1/users/{id}/followers`

**Request:**
```http
GET /api/v1/users/2/followers?per_page=20&page=1
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 3,
            "username": "john_doe",
            "email": "john@example.com",
            "status": "active",
            "is_following": true,
            "is_followed_by": true,
            "profile": {
                "bio": "Language learner",
                "country": "US",
                "followers_count": 10,
                "following_count": 15
            }
        }
    ],
    "meta": {
        "current_page": 1,
        "per_page": 20,
        "total": 14,
        "last_page": 1
    }
}
```

**Business Logic:**
1. Get user's followers with pagination
2. Eager load profile relationship
3. Filter to active users only
4. Add relationship flags for auth user
5. Return paginated results

### 4.4 Get Following

**Endpoint:** `GET /api/v1/users/{id}/following`

**Request:**
```http
GET /api/v1/users/2/following?per_page=20&page=1
Authorization: Bearer {token}
```

**Response:** Same structure as followers endpoint

**Business Logic:**
1. Get user's following with pagination
2. Eager load profile relationship
3. Filter to active users only
4. Add relationship flags for auth user
5. Return paginated results

### 4.5 Block User

**Endpoint:** `POST /api/v1/users/{id}/block`

**Request:**
```http
POST /api/v1/users/2/block
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "User blocked successfully",
    "data": {
        "blocked": true
    }
}
```

**Business Logic:**
1. Validate user exists and is not self
2. Check if already blocked
3. Create block record in transaction
4. Remove all follow relationships (both directions)
5. Update follower counts if follows existed
6. Return success

### 4.6 Unblock User

**Endpoint:** `DELETE /api/v1/users/{id}/block`

**Request:**
```http
DELETE /api/v1/users/2/block
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
    "success": true,
    "message": "User unblocked successfully",
    "data": {
        "blocked": false
    }
}
```

**Business Logic:**
1. Validate user exists
2. Check if currently blocked
3. Delete block record
4. Return success

### 4.7 Get Blocked Users

**Endpoint:** `GET /api/v1/users/blocked`

**Request:**
```http
GET /api/v1/users/blocked?per_page=20&page=1
Authorization: Bearer {token}
```

**Response:**
```json
{
    "success": true,
    "data": [
        {
            "id": 5,
            "username": "blocked_user",
            "email": "blocked@example.com",
            "profile": {
                "bio": "User bio",
                "country": "UK"
            }
        }
    ],
    "meta": {
        "current_page": 1,
        "per_page": 20,
        "total": 3,
        "last_page": 1
    }
}
```

**Business Logic:**
1. Get auth user's blocked users
2. Eager load profile relationship
3. Paginate results
4. Return paginated list

## 5. Controller Design

### 5.1 SocialController

The SocialController handles all social interactions (follow, block).

**Methods:**
- `follow(Request $request, $id)` - Follow a user
- `unfollow(Request $request, $id)` - Unfollow a user
- `followers(Request $request, $id)` - Get followers list
- `following(Request $request, $id)` - Get following list
- `block(Request $request, $id)` - Block a user
- `unblock(Request $request, $id)` - Unblock a user
- `blockedUsers(Request $request)` - Get blocked users list

**Common Patterns:**
- All methods use BaseController for consistent responses
- Database transactions for operations that modify counts
- Validation before any database operations
- Eager loading to prevent N+1 queries

### 5.2 UserController (Updated)

**Updated Methods:**
- `show($id)` - Added block check (403 if blocked)
- `search(Request $request)` - Exclude blocked users from results

## 6. Resource Design

### 6.1 UserResource (Updated)

```php
class UserResource extends JsonResource
{
    public function toArray($request)
    {
        $authUser = $request->user();
        
        return [
            'id' => $this->id,
            'username' => $this->username,
            'email' => $this->email,
            'status' => $this->status,
            'is_following' => $authUser ? $authUser->isFollowing($this) : false,
            'is_followed_by' => $authUser ? $authUser->isFollowedBy($this) : false,
            'is_blocked' => $authUser ? $authUser->hasBlocked($this) : false,
            'profile' => new ProfileResource($this->whenLoaded('profile')),
        ];
    }
}
```

### 6.2 ProfileResource (Updated)

```php
class ProfileResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'bio' => $this->bio,
            'country' => $this->country,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth,
            'profile_photo_url' => $this->profile_photo_url,
            'followers_count' => $this->followers_count,
            'following_count' => $this->following_count,
        ];
    }
}
```

## 7. Transaction Management

All operations that modify follower counts use database transactions:

```php
try {
    DB::beginTransaction();
    
    // Create/delete relationships
    // Update counts
    
    DB::commit();
    return $this->successResponse($data, $message);
    
} catch (\Exception $e) {
    DB::rollBack();
    return $this->errorResponse('Operation failed', null, 500);
}
```

## 8. Performance Optimizations

### 8.1 Count Caching
- Follower/following counts stored in profiles table
- Avoids expensive COUNT queries on every profile view
- Updated atomically in transactions

### 8.2 Eager Loading
```php
$followers = $user->followers()
    ->with(['profile'])  // Eager load to prevent N+1
    ->paginate($perPage);
```

### 8.3 Indexes
- Indexes on follower_id and following_id in follows table
- Indexes on blocker_id and blocked_id in blocks table
- Enables fast lookups for relationship checks

### 8.4 Pagination
- All list endpoints paginated (default 20 per page)
- Prevents loading large datasets

## 9. Security Considerations

### 9.1 Authorization
- All endpoints require authentication (auth:sanctum middleware)
- Users can only perform actions on their own behalf
- Block checks prevent unauthorized profile access

### 9.2 Validation
- User ID validation (must exist and be active)
- Self-action prevention (cannot follow/block self)
- Duplicate prevention (cannot follow twice)
- Block enforcement (cannot follow blocked users)

### 9.3 Rate Limiting
- Consider adding rate limiting to prevent follow/unfollow spam
- Suggested: 60 follow actions per hour per user

## 10. Error Handling

### 10.1 Error Responses

All errors follow consistent format:
```json
{
    "success": false,
    "message": "Error description",
    "errors": null
}
```

### 10.2 HTTP Status Codes
- 200: Success
- 403: Forbidden (blocked user access)
- 404: User not found
- 422: Validation error (already following, cannot follow self, etc.)
- 500: Server error (transaction failure)

## 11. Testing Strategy

### 11.1 Unit Tests
- Test User model helper methods
- Test relationship definitions
- Test count increment/decrement logic

### 11.2 Feature Tests
- Test each endpoint with valid inputs
- Test validation rules
- Test block enforcement
- Test transaction rollback on errors
- Test pagination

### 11.3 Integration Tests
- Test follow → unfollow → follow sequence
- Test block → unblock sequence
- Test block removes follows
- Test concurrent operations

## 12. Future Enhancements

Potential improvements for future phases:
- Follow request approval (private accounts)
- Notifications for new followers
- Mute functionality (hide content without blocking)
- Follow suggestions based on mutual connections
- Activity feed for followed users
- Analytics dashboard for follower growth
- Batch operations (follow multiple users)
- Export blocked users list

## 13. Correctness Properties

### Property 1: Follow Symmetry
**Description:** If User A follows User B, then User B's followers list must contain User A, and User A's following list must contain User B.

**Test Strategy:** Property-based test that creates random follow relationships and verifies bidirectional consistency.

### Property 2: Count Accuracy
**Description:** For any user, `followers_count` must equal the actual count of followers in the follows table, and `following_count` must equal the actual count of following relationships.

**Test Strategy:** Property-based test that performs random follow/unfollow operations and verifies counts match database queries.

### Property 3: Block Enforcement
**Description:** If User A blocks User B, then:
- User B cannot view User A's profile
- User A cannot view User B's profile
- Neither user appears in the other's search results
- All follow relationships between them are removed

**Test Strategy:** Property-based test that creates random block relationships and verifies all enforcement rules.

### Property 4: No Self-Relationships
**Description:** A user can never follow themselves or block themselves.

**Test Strategy:** Property-based test that attempts self-follow and self-block operations and verifies they all fail.

### Property 5: Unique Relationships
**Description:** A user can only follow another user once, and can only block another user once.

**Test Strategy:** Property-based test that attempts duplicate follow/block operations and verifies database constraints prevent duplicates.

### Property 6: Transaction Atomicity
**Description:** If a follow/unfollow operation fails, the follower counts must remain unchanged (no partial updates).

**Test Strategy:** Property-based test that simulates transaction failures and verifies counts are not corrupted.

## 14. Implementation Notes

- All migrations created with proper foreign keys and constraints
- Models include proper relationships and helper methods
- Controller uses transactions for data consistency
- Resources include relationship flags for frontend
- Block checks integrated into existing endpoints
- Documentation complete with examples
- Postman collection ready for testing

## 15. Deployment Checklist

- [ ] Run migrations on production database
- [ ] Clear application cache
- [ ] Clear route cache
- [ ] Test all endpoints with Postman
- [ ] Verify follower counts are accurate
- [ ] Verify block enforcement works
- [ ] Monitor error logs for issues
- [ ] Update API documentation
- [ ] Notify frontend team of new endpoints
