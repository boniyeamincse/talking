# Phase 2: Social Features - Requirements

## 1. Overview

This spec documents the implementation of social features for the Talkin API, including follow/unfollow functionality, user blocking, and enhanced user discovery. These features enable users to build social connections while maintaining control over their interactions.

## 2. User Stories

### 2.1 Follow System
- As a user, I want to follow other users so that I can stay connected with people I'm interested in
- As a user, I want to unfollow users so that I can manage my connections
- As a user, I want to see who follows me so that I know who's interested in my content
- As a user, I want to see who I'm following so that I can manage my connections
- As a user, I want to see follower/following counts on profiles so that I can gauge popularity

### 2.2 Block System
- As a user, I want to block users so that I can prevent unwanted interactions
- As a user, I want to unblock users so that I can restore connections if needed
- As a user, I want to see my blocked users list so that I can manage blocked accounts
- As a user, I want blocked users to be automatically unfollowed so that connections are severed
- As a user, I want blocked users to be unable to see my profile or interact with me

### 2.3 User Discovery
- As a user, I want to search for other users so that I can find people to connect with
- As a user, I want blocked users excluded from search results so that I don't see them
- As a user, I want to see relationship status (following, followed by, blocked) on user profiles

## 3. Acceptance Criteria

### 3.1 Follow System

#### 3.1.1 Follow User
- User can follow another user by sending POST request to `/api/v1/users/{id}/follow`
- User cannot follow themselves
- User cannot follow a user they've blocked or who has blocked them
- User cannot follow a user they're already following
- Following increments follower_count for target user and following_count for auth user
- Follow relationship is stored in follows table with unique constraint
- Success response includes updated counts and following status

#### 3.1.2 Unfollow User
- User can unfollow by sending DELETE request to `/api/v1/users/{id}/follow`
- User cannot unfollow themselves
- User cannot unfollow a user they're not following
- Unfollowing decrements follower_count for target user and following_count for auth user
- Follow relationship is removed from follows table
- Success response includes updated counts and following status

#### 3.1.3 Followers List
- User can get followers list via GET `/api/v1/users/{id}/followers`
- Results are paginated (default 20 per page)
- Each follower includes relationship flags (is_following, is_followed_by)
- Only active users are included in results
- Includes user profile data

#### 3.1.4 Following List
- User can get following list via GET `/api/v1/users/{id}/following`
- Results are paginated (default 20 per page)
- Each followed user includes relationship flags
- Only active users are included in results
- Includes user profile data

#### 3.1.5 Follower Count Caching
- Follower counts are cached in profiles table
- Counts are updated atomically in database transactions
- Counts can be recalculated if they get out of sync

### 3.2 Block System

#### 3.2.1 Block User
- User can block another user by sending POST request to `/api/v1/users/{id}/block`
- User cannot block themselves
- User cannot block a user they've already blocked
- Blocking creates entry in blocks table with unique constraint
- Blocking automatically removes all follow relationships (both directions)
- Follower counts are updated when follows are removed
- Success response includes blocked status

#### 3.2.2 Unblock User
- User can unblock by sending DELETE request to `/api/v1/users/{id}/block`
- User cannot unblock a user they haven't blocked
- Unblocking removes entry from blocks table
- Success response includes blocked status

#### 3.2.3 Blocked Users List
- User can get blocked users list via GET `/api/v1/users/blocked`
- Results are paginated (default 20 per page)
- Includes user profile data for blocked users

#### 3.2.4 Block Enforcement
- Blocked users cannot view blocker's profile (403 error)
- Blocked users are excluded from blocker's search results
- Blocked users cannot follow blocker
- Blocker cannot follow blocked users

### 3.3 User Discovery

#### 3.3.1 User Search
- Search excludes blocked users (both directions)
- Search results include relationship flags
- Results are paginated

#### 3.3.2 User Profile View
- Profile view includes relationship flags (is_following, is_followed_by, is_blocked)
- Profile view blocked if user is blocked
- Profile includes follower/following counts

## 4. Technical Requirements

### 4.1 Database Schema

#### follows table
- id (primary key)
- follower_id (foreign key to users)
- following_id (foreign key to users)
- created_at
- Unique constraint on (follower_id, following_id)
- Indexes on follower_id and following_id

#### blocks table
- id (primary key)
- blocker_id (foreign key to users)
- blocked_id (foreign key to users)
- created_at
- Unique constraint on (blocker_id, blocked_id)
- Indexes on blocker_id and blocked_id

#### profiles table (updated)
- followers_count (integer, default 0)
- following_count (integer, default 0)

### 4.2 API Endpoints

All endpoints require authentication via Laravel Sanctum.

#### Follow Endpoints
- POST `/api/v1/users/{id}/follow` - Follow user
- DELETE `/api/v1/users/{id}/follow` - Unfollow user
- GET `/api/v1/users/{id}/followers` - Get followers list
- GET `/api/v1/users/{id}/following` - Get following list

#### Block Endpoints
- POST `/api/v1/users/{id}/block` - Block user
- DELETE `/api/v1/users/{id}/block` - Unblock user
- GET `/api/v1/users/blocked` - Get blocked users list

### 4.3 Models

#### Follow Model
- Relationships: belongsTo User (follower), belongsTo User (following)
- No timestamps needed (only created_at)

#### Block Model
- Relationships: belongsTo User (blocker), belongsTo User (blocked)
- No timestamps needed (only created_at)

#### User Model (updated)
- Relationships: followers(), following(), blockedUsers(), blockedBy()
- Helper methods: isFollowing(), isFollowedBy(), hasBlocked(), isBlockedBy(), hasBlockedOrIsBlockedBy()

### 4.4 Security & Validation

- Rate limiting on follow/unfollow actions (prevent spam)
- Validation: user ID must exist and be active
- Authorization: users can only perform actions on their own behalf
- Transaction safety: follower count updates must be atomic
- Prevent self-follow and self-block

### 4.5 Performance Considerations

- Follower counts cached in profiles table (avoid COUNT queries)
- Indexes on foreign keys for fast lookups
- Pagination for all list endpoints
- Eager loading of relationships to prevent N+1 queries

## 5. Out of Scope

The following features are NOT included in Phase 2:
- Follow request approval system (private accounts)
- Notifications for new followers
- Mute functionality (different from block)
- Follow suggestions/recommendations
- Activity feed for followed users
- Analytics on follower growth

These features may be added in future phases.

## 6. Dependencies

- Phase 1 (Authentication & User Management) must be complete
- Laravel Sanctum authentication
- User and Profile models from Phase 1
- Database migrations from Phase 1

## 7. Testing Requirements

### 7.1 Unit Tests
- Test User model helper methods (isFollowing, hasBlocked, etc.)
- Test Follow and Block model relationships
- Test follower count increment/decrement logic

### 7.2 Feature Tests
- Test all 7 API endpoints with various scenarios
- Test validation rules (cannot follow self, cannot follow blocked user, etc.)
- Test transaction rollback on errors
- Test pagination
- Test relationship flags in responses

### 7.3 Edge Cases
- Test concurrent follow/unfollow requests
- Test follower count accuracy after multiple operations
- Test block enforcement across all endpoints
- Test database constraint violations

## 8. Success Metrics

- All 7 endpoints return correct responses
- Follower counts remain accurate
- Block enforcement works across all user interactions
- No N+1 query problems
- API response time < 200ms for all endpoints
- All tests passing with 80%+ coverage

## 9. Documentation

- API endpoint documentation in PHASE2_SETUP.md
- Postman collection with example requests
- Database schema documentation
- Code comments for complex business logic
