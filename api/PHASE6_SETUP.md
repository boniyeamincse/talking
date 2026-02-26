# Phase 6: Social Feed - Setup Guide

## Overview

Phase 6 implements a complete social media feed system with posts, comments, likes, and saved posts functionality. Users can create posts with text and media, engage through likes and comments, and curate content by saving posts for later reference.

## Features Implemented

### Post Management
- Create posts with text and/or media (images/videos)
- Edit post text content
- Delete posts (with cascading deletion of comments, likes, and media)
- Upload media to posts (up to 5 files per post)
- View personalized feed with pagination

### Engagement Features
- Like/unlike posts
- View list of users who liked a post
- Comment on posts
- Delete comments (by comment author or post author)
- Save/unsave posts for later reference
- View saved posts

### Security & Privacy
- Block relationship integration (blocked users cannot see or interact with posts)
- Authorization checks (only post authors can edit/delete their posts)
- Sanctum authentication required for all endpoints

## Database Schema

### Tables Created

**posts**
- `id` - Primary key
- `user_id` - Foreign key to users table
- `content` - Post text content (nullable)
- `likes_count` - Cached like count
- `comments_count` - Cached comment count
- `is_edited` - Boolean flag for edited posts
- `created_at`, `updated_at`, `deleted_at` - Timestamps (soft deletes enabled)

**post_media**
- `id` - Primary key
- `post_id` - Foreign key to posts table
- `file_path` - Storage path for media file
- `file_type` - Enum: 'image' or 'video'
- `file_size` - File size in bytes
- `mime_type` - MIME type of the file
- `display_order` - Order for displaying multiple media files
- `created_at`, `updated_at` - Timestamps

**comments**
- `id` - Primary key
- `post_id` - Foreign key to posts table
- `user_id` - Foreign key to users table
- `content` - Comment text
- `created_at`, `updated_at` - Timestamps

**likes**
- `id` - Primary key
- `post_id` - Foreign key to posts table
- `user_id` - Foreign key to users table
- `created_at` - Timestamp
- Unique constraint on (post_id, user_id)

**saved_posts**
- `id` - Primary key
- `post_id` - Foreign key to posts table
- `user_id` - Foreign key to users table
- `created_at` - Timestamp
- Unique constraint on (post_id, user_id)

## API Endpoints

### Post Management

#### Get Feed
```
GET /api/v1/posts
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Feed retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "user": {...},
        "content": "Post content",
        "media": [...],
        "likes_count": 10,
        "comments_count": 5,
        "is_edited": false,
        "is_liked_by_user": false,
        "is_saved_by_user": false,
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00"
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 100
  }
}
```

#### Create Post
```
POST /api/v1/posts
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- content: "Post text content" (optional if media provided)
- media[]: File[] (optional, max 5 files)

Response: 201 Created
{
  "success": true,
  "message": "Post created successfully",
  "data": {...}
}
```

#### Get Single Post
```
GET /api/v1/posts/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Post retrieved successfully",
  "data": {...}
}
```

#### Update Post
```
PUT /api/v1/posts/{id}
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "content": "Updated post content"
}

Response:
{
  "success": true,
  "message": "Post updated successfully",
  "data": {...}
}
```

#### Delete Post
```
DELETE /api/v1/posts/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Post deleted successfully"
}
```

#### Upload Media to Post
```
POST /api/v1/posts/{id}/media
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body:
- media: File

Response: 201 Created
{
  "success": true,
  "message": "Media uploaded successfully",
  "data": {
    "id": 1,
    "url": "http://...",
    "file_type": "image",
    "file_size": 1024000,
    "mime_type": "image/jpeg",
    "display_order": 0
  }
}
```

### Like Management

#### Like Post
```
POST /api/v1/posts/{id}/like
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Post liked successfully",
  "data": {
    "likes_count": 11
  }
}
```

#### Unlike Post
```
DELETE /api/v1/posts/{id}/like
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Post unliked successfully",
  "data": {
    "likes_count": 10
  }
}
```

#### Get Post Likers
```
GET /api/v1/posts/{id}/likes
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Likers retrieved successfully",
  "data": {
    "data": [...users...],
    "current_page": 1,
    "per_page": 20,
    "total": 50
  }
}
```

### Save Management

#### Save Post
```
POST /api/v1/posts/{id}/save
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Post saved successfully"
}
```

#### Unsave Post
```
DELETE /api/v1/posts/{id}/save
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Post unsaved successfully"
}
```

#### Get Saved Posts
```
GET /api/v1/posts/saved
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Saved posts retrieved successfully",
  "data": {
    "data": [...posts...],
    "current_page": 1,
    "per_page": 20,
    "total": 30
  }
}
```

### Comment Management

#### Get Comments
```
GET /api/v1/posts/{id}/comments
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "post_id": 1,
        "user": {...},
        "content": "Comment text",
        "created_at": "2024-01-01T00:00:00+00:00"
      }
    ],
    "current_page": 1,
    "per_page": 20,
    "total": 15
  }
}
```

#### Add Comment
```
POST /api/v1/posts/{id}/comments
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "content": "Comment text"
}

Response: 201 Created
{
  "success": true,
  "message": "Comment added successfully",
  "data": {...}
}
```

#### Delete Comment
```
DELETE /api/v1/comments/{id}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

## Models

### Post
- Relationships: user, media, comments, likes, savedBy
- Scopes: forFeed (filters by following/blocked users)
- Methods: isOwnedBy, isLikedBy, isSavedBy, incrementLikes, decrementLikes, incrementComments, decrementComments

### PostMedia
- Relationships: post
- Methods: getUrl (returns public URL for media file)

### Comment
- Relationships: post, user
- Methods: isOwnedBy, canBeDeletedBy

### Like
- Relationships: post, user

### SavedPost
- Relationships: post, user

## Services

### PostService
Main service handling all post-related business logic:
- `createPost()` - Create post with media
- `updatePost()` - Update post content
- `deletePost()` - Delete post and associated data
- `uploadMedia()` - Upload media file to post
- `getFeed()` - Get personalized feed
- `getPost()` - Get single post with block checks
- `likePost()` / `unlikePost()` - Like management
- `getLikers()` - Get users who liked post
- `savePost()` / `unsavePost()` - Save management
- `getSavedPosts()` - Get user's saved posts
- `addComment()` / `deleteComment()` - Comment management
- `getComments()` - Get post comments

## Validation Rules

### Post Creation
- `content`: nullable, string, max 5000 characters
- `media`: nullable, array, max 5 files
- `media.*`: file, mimes: jpeg,png,gif,webp,mp4,webm, max 102400KB (100MB)
- At least one of content or media must be provided

### Post Update
- `content`: required, string, max 5000 characters
- Only post author can update

### Comment Creation
- `content`: required, string, max 1000 characters

### Media Upload
- `media`: required, file, mimes: jpeg,png,gif,webp,mp4,webm, max 102400KB
- Only post author can upload media

## Integration with Existing Features

### Phase 2: Social Features
- Block relationships are checked before allowing interactions
- Feed excludes posts from blocked users (both directions)
- Blocked users cannot like, comment, or save posts

### Phase 3: Media Handling
- Reuses MediaService for file storage
- Follows same storage patterns as message media

### Phase 1: Authentication
- All endpoints require Sanctum authentication
- Uses existing BaseController for consistent responses

## Testing

Run migrations:
```bash
cd api
php artisan migrate
```

Test endpoints using the provided Postman collection or manually with curl/Postman.

## Next Steps

1. Test all endpoints with Postman collection
2. Verify block relationship integration
3. Test media upload functionality
4. Verify engagement count accuracy
5. Test pagination on all list endpoints

## Notes

- Posts use soft deletes to maintain referential integrity
- Engagement counts (likes_count, comments_count) are cached on posts table for performance
- All operations that modify counts use database transactions
- Media files are stored using the existing MediaService pattern
- Block checks are performed at the service level to prevent unauthorized interactions
