# Implementation Plan: Phase 6 - Social Feed

## Overview

This implementation plan breaks down the social feed feature into incremental coding tasks. The approach follows Laravel best practices and integrates with existing authentication, social relationships, and media handling from previous phases. Tasks are ordered to build functionality incrementally, with testing integrated throughout.

## Tasks

- [x] 1. Create database migrations and models
  - [x] 1.1 Create posts table migration
    - Create migration with user_id, content, likes_count, comments_count, is_edited, timestamps, soft deletes
    - Add indexes on user_id, created_at, deleted_at
    - Add foreign key constraint to users table with cascade delete
    - _Requirements: 1.1, 1.8, 3.3, 3.4_
  
  - [x] 1.2 Create post_media table migration
    - Create migration with post_id, file_path, file_type, file_size, mime_type, display_order, timestamps
    - Add index on post_id
    - Add foreign key constraint to posts table with cascade delete
    - _Requirements: 1.2, 5.6, 14.1_
  
  - [x] 1.3 Create comments table migration
    - Create migration with post_id, user_id, content, timestamps
    - Add indexes on post_id, user_id, created_at
    - Add foreign key constraints with cascade delete
    - _Requirements: 7.1, 7.4_
  
  - [x] 1.4 Create likes table migration
    - Create migration with post_id, user_id, created_at
    - Add unique constraint on (post_id, user_id)
    - Add indexes on post_id and user_id
    - Add foreign key constraints with cascade delete
    - _Requirements: 6.1, 6.2_
  
  - [x] 1.5 Create saved_posts table migration
    - Create migration with post_id, user_id, created_at
    - Add unique constraint on (post_id, user_id)
    - Add indexes on user_id and created_at
    - Add foreign key constraints with cascade delete
    - _Requirements: 9.1, 9.2_
  
  - [x] 1.6 Create Post model with relationships and methods
    - Define fillable fields and casts
    - Add SoftDeletes trait
    - Implement relationships: user(), media(), comments(), likes(), savedBy()
    - Implement methods: isOwnedBy(), isLikedBy(), isSavedBy(), incrementLikes(), decrementLikes(), incrementComments(), decrementComments()
    - Add scopeWithEngagement() and scopeForFeed() scopes
    - _Requirements: 1.1, 2.2, 2.3, 2.4, 3.1, 4.1_
  
  - [x] 1.7 Create PostMedia model
    - Define fillable fields and casts
    - Implement post() relationship
    - Implement getUrl() method for public URL generation
    - _Requirements: 1.2, 14.1_
  
  - [x] 1.8 Create Comment model
    - Define fillable fields and casts
    - Implement relationships: post(), user()
    - Implement methods: isOwnedBy(), canBeDeletedBy()
    - _Requirements: 7.1, 8.1, 8.2, 8.3_
  
  - [x] 1.9 Create Like model
    - Define fillable fields and casts
    - Disable updated_at timestamp
    - Implement relationships: post(), user()
    - _Requirements: 6.1_
  
  - [x] 1.10 Create SavedPost model
    - Define fillable fields and casts
    - Disable updated_at timestamp
    - Implement relationships: post(), user()
    - _Requirements: 9.1_

- [x] 2. Create request validation classes
  - [x] 2.1 Create StorePostRequest
    - Validate content (nullable, string, max 5000 chars)
    - Validate media (nullable, array, max 5 files)
    - Validate each media file (file, mimes, max size)
    - Add custom validation: require content OR media (not both empty)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 16.1_
  
  - [x] 2.2 Create UpdatePostRequest
    - Validate content (required, string, max 5000 chars)
    - Authorize: only post author can edit
    - _Requirements: 3.1, 3.2, 16.1_
  
  - [x] 2.3 Create StoreCommentRequest
    - Validate content (required, string, max 1000 chars)
    - _Requirements: 7.1, 7.2, 16.2_
  
  - [x] 2.4 Create UploadMediaRequest
    - Validate media (required, file, mimes, max size)
    - Authorize: only post author can upload media
    - _Requirements: 5.1, 5.3, 16.4, 16.5_

- [x] 3. Create PostService with core functionality
  - [x] 3.1 Implement createPost method
    - Accept user, content, and media files array
    - Validate at least one of content or media is provided
    - Create post record in transaction
    - Process and store media files using MediaService
    - Create PostMedia records with display_order
    - Return created post with relationships loaded
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.8_
  
  - [ ]* 3.2 Write property test for post creation
    - **Property 1: Post creation with text stores content**
    - **Property 2: Post creation with media stores files**
    - **Property 3: Post creation with text and media stores both**
    - **Property 5: Post creation records author and timestamp**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.8**
  
  - [x] 3.3 Implement updatePost method
    - Accept post and new content
    - Update content field
    - Set is_edited to true
    - Update updated_at timestamp
    - Verify created_at is not modified
    - Return updated post
    - _Requirements: 3.1, 3.3, 3.4, 3.5_
  
  - [ ]* 3.4 Write property test for post editing
    - **Property 11: Post editing updates content and sets edited flag**
    - **Property 13: Post editing preserves creation timestamp**
    - **Property 14: Post editing does not modify media**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5**
  
  - [x] 3.4 Implement deletePost method
    - Accept post
    - Delete all associated media files from storage
    - Soft delete post (cascades to comments, likes, saved_posts via DB)
    - Use transaction for atomicity
    - _Requirements: 4.1, 4.3, 4.4, 13.1, 13.2, 13.3, 13.4_
  
  - [ ]* 3.5 Write property test for post deletion
    - **Property 15: Post deletion cascades to all related data**
    - **Property 17: Media deletion removes storage files**
    - **Validates: Requirements 4.1, 4.3, 13.1, 13.2, 13.3, 13.4**
  
  - [x] 3.6 Implement uploadMedia method
    - Accept post and uploaded file
    - Validate file using MediaService
    - Store file with unique name
    - Create PostMedia record with display_order
    - Return PostMedia instance
    - _Requirements: 5.1, 5.2, 5.4, 5.6_
  
  - [ ]* 3.7 Write property test for media upload
    - **Property 18: Media file names are unique**
    - **Property 19: Media records contain required fields**
    - **Validates: Requirements 5.4, 5.6**

- [x] 4. Implement feed retrieval functionality
  - [x] 4.1 Implement getFeed method in PostService
    - Get posts from followed users and auth user
    - Exclude posts from blocked users (both directions)
    - Order by created_at DESC
    - Eager load user, media, and engagement data
    - Return paginated results (default 20 per page)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 11.1_
  
  - [ ]* 4.2 Write property test for feed composition
    - **Property 6: Feed posts ordered by creation time**
    - **Property 7: Feed includes followed users' posts**
    - **Property 8: Feed includes own posts**
    - **Property 9: Feed excludes blocked users' posts**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
  
  - [x] 4.3 Implement getPost method in PostService
    - Find post by ID
    - Check if post author has blocked auth user or vice versa
    - Return 404 if blocked (don't reveal block status)
    - Eager load user, media, comments count, likes count
    - Return post with all metadata
    - _Requirements: 2.5, 2.7, 10.2, 10.4_
  
  - [ ]* 4.4 Write property test for post retrieval
    - **Property 10: Post retrieval includes all metadata**
    - **Property 37: Blocked users cannot view posts**
    - **Validates: Requirements 2.5, 2.7, 10.2, 10.4**

- [x] 5. Implement like functionality
  - [x] 5.1 Implement likePost method in PostService
    - Check if user already liked the post
    - Check if user is blocked by post author
    - Create like record in transaction
    - Increment post likes_count
    - Commit transaction
    - _Requirements: 6.1, 6.2, 10.3_
  
  - [x] 5.2 Implement unlikePost method in PostService
    - Check if user has liked the post
    - Delete like record in transaction
    - Decrement post likes_count
    - Commit transaction
    - _Requirements: 6.3, 6.4_
  
  - [ ]* 5.3 Write property test for like functionality
    - **Property 20: Liking a post increments like count**
    - **Property 21: Duplicate likes are rejected**
    - **Property 22: Unliking a post decrements like count**
    - **Property 23: Like count matches actual likes**
    - **Validates: Requirements 6.1, 6.2, 6.3, 15.1**
  
  - [x] 5.4 Implement getLikers method in PostService
    - Get users who have liked the post
    - Eager load user profiles
    - Return paginated results
    - _Requirements: 6.5_
  
  - [ ]* 5.5 Write property test for likers list
    - **Property 24: Likers list matches like records**
    - **Validates: Requirements 6.5**

- [x] 6. Implement comment functionality
  - [x] 6.1 Implement addComment method in PostService
    - Validate content is not empty
    - Check if user is blocked by post author
    - Create comment record in transaction
    - Increment post comments_count
    - Commit transaction
    - Return created comment
    - _Requirements: 7.1, 7.2, 7.6, 10.3_
  
  - [x] 6.2 Implement getComments method in PostService
    - Get comments for post ordered by created_at ASC
    - Eager load user data
    - Return paginated results
    - _Requirements: 7.3, 7.4_
  
  - [ ]* 6.3 Write property test for comment functionality
    - **Property 25: Comment creation increments comment count**
    - **Property 26: Comments ordered chronologically**
    - **Property 27: Comment responses include required data**
    - **Property 28: Comment count matches actual comments**
    - **Validates: Requirements 7.1, 7.3, 7.4, 7.6, 15.2**
  
  - [x] 6.4 Implement deleteComment method in PostService
    - Check authorization (comment author or post author)
    - Delete comment record in transaction
    - Decrement post comments_count
    - Commit transaction
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 6.5 Write property test for comment deletion
    - **Property 29: Comment deletion decrements comment count**
    - **Property 30: Post authors can delete any comment on their posts**
    - **Property 31: Comment deletion authorization**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [x] 7. Implement saved posts functionality
  - [x] 7.1 Implement savePost method in PostService
    - Check if user already saved the post
    - Check if user is blocked by post author
    - Create saved_post record
    - _Requirements: 9.1, 9.2_
  
  - [x] 7.2 Implement unsavePost method in PostService
    - Check if user has saved the post
    - Delete saved_post record
    - _Requirements: 9.3_
  
  - [ ]* 7.3 Write property test for saved posts
    - **Property 32: Saving a post creates saved record**
    - **Property 33: Duplicate saves are rejected**
    - **Property 34: Unsaving removes saved record**
    - **Validates: Requirements 9.1, 9.2, 9.3**
  
  - [x] 7.4 Implement getSavedPosts method in PostService
    - Get saved posts for user ordered by saved_posts.created_at DESC
    - Eager load post, user, media
    - Return paginated results
    - _Requirements: 9.4_
  
  - [ ]* 7.5 Write property test for saved posts retrieval
    - **Property 35: Saved posts ordered by save time**
    - **Property 36: Post deletion removes all saved references**
    - **Validates: Requirements 9.4, 9.5**

- [x] 8. Create API resources for JSON responses
  - [x] 8.1 Create PostResource
    - Transform post to JSON with id, user, content, media, engagement counts, flags, timestamps
    - Include is_liked_by_user and is_saved_by_user flags for auth user
    - Format timestamps in ISO 8601
    - _Requirements: 18.1, 18.4, 18.5_
  
  - [x] 8.2 Create PostMediaResource
    - Transform media to JSON with id, url, file_type, file_size, mime_type, display_order
    - Use getUrl() method for public URL
    - _Requirements: 14.1_
  
  - [x] 8.3 Create CommentResource
    - Transform comment to JSON with id, post_id, user, content, created_at
    - Format timestamps in ISO 8601
    - _Requirements: 18.2, 18.5_
  
  - [ ]* 8.4 Write property test for response structure
    - **Property 45: Post responses have consistent structure**
    - **Property 46: Comment responses have consistent structure**
    - **Property 47: Paginated responses include metadata**
    - **Property 48: Relationship flags reflect actual state**
    - **Property 49: Timestamps in ISO 8601 format**
    - **Validates: Requirements 18.1, 18.2, 18.3, 18.4, 18.5**

- [x] 9. Create PostController with post management endpoints
  - [x] 9.1 Implement index method (GET /api/posts)
    - Call PostService->getFeed() with auth user
    - Return PostResource collection with pagination metadata
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 11.1_
  
  - [x] 9.2 Implement store method (POST /api/posts)
    - Validate request using StorePostRequest
    - Call PostService->createPost() with content and media files
    - Return PostResource with 201 status
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 9.3 Implement show method (GET /api/posts/{id})
    - Call PostService->getPost() with post ID and auth user
    - Return 404 if post not found or user is blocked
    - Return PostResource
    - _Requirements: 2.5, 10.2, 10.4_
  
  - [x] 9.4 Implement update method (PUT /api/posts/{id})
    - Validate request using UpdatePostRequest (includes authorization)
    - Call PostService->updatePost() with new content
    - Return PostResource
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 9.5 Implement destroy method (DELETE /api/posts/{id})
    - Find post and verify ownership
    - Call PostService->deletePost()
    - Return success response
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [x] 9.6 Implement uploadMedia method (POST /api/posts/{id}/media)
    - Validate request using UploadMediaRequest (includes authorization)
    - Call PostService->uploadMedia() with file
    - Return PostMediaResource
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_
  
  - [ ]* 9.7 Write property test for post authorization
    - **Property 12: Only post authors can edit posts**
    - **Property 16: Only post authors can delete posts**
    - **Validates: Requirements 3.2, 4.2, 12.2, 12.3**

- [x] 10. Create LikeController with like endpoints
  - [x] 10.1 Implement store method (POST /api/posts/{id}/like)
    - Find post or return 404
    - Check block relationships
    - Call PostService->likePost()
    - Handle duplicate like error
    - Return success response with updated likes_count
    - _Requirements: 6.1, 6.2, 10.3_
  
  - [x] 10.2 Implement destroy method (DELETE /api/posts/{id}/like)
    - Find post or return 404
    - Call PostService->unlikePost()
    - Handle not-liked error
    - Return success response with updated likes_count
    - _Requirements: 6.3, 6.4_
  
  - [x] 10.3 Implement index method (GET /api/posts/{id}/likes)
    - Find post or return 404
    - Call PostService->getLikers()
    - Return UserResource collection with pagination
    - _Requirements: 6.5_
  
  - [ ]* 10.4 Write property test for like functionality
    - **Property 38: Blocked users cannot engage with posts**
    - **Validates: Requirements 10.3**

- [x] 11. Create CommentController with comment endpoints
  - [x] 11.1 Implement index method (GET /api/posts/{id}/comments)
    - Find post or return 404
    - Call PostService->getComments()
    - Return CommentResource collection with pagination
    - _Requirements: 7.3, 7.4_
  
  - [x] 11.2 Implement store method (POST /api/posts/{id}/comments)
    - Validate request using StoreCommentRequest
    - Find post or return 404
    - Check block relationships
    - Call PostService->addComment()
    - Return CommentResource with 201 status
    - _Requirements: 7.1, 7.2, 10.3_
  
  - [x] 11.3 Implement destroy method (DELETE /api/comments/{id})
    - Find comment or return 404
    - Verify authorization (comment author or post author)
    - Call PostService->deleteComment()
    - Return success response
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 12. Create SavedPostController with save endpoints
  - [x] 12.1 Implement store method (POST /api/posts/{id}/save)
    - Find post or return 404
    - Check block relationships
    - Call PostService->savePost()
    - Handle duplicate save error
    - Return success response
    - _Requirements: 9.1, 9.2_
  
  - [x] 12.2 Implement destroy method (DELETE /api/posts/{id}/save)
    - Find post or return 404
    - Call PostService->unsavePost()
    - Handle not-saved error
    - Return success response
    - _Requirements: 9.3_
  
  - [x] 12.3 Implement index method (GET /api/posts/saved)
    - Call PostService->getSavedPosts() with auth user
    - Return PostResource collection with pagination
    - _Requirements: 9.4_

- [x] 13. Register routes in api.php
  - [x] 13.1 Add post management routes
    - GET /api/posts (PostController@index)
    - POST /api/posts (PostController@store)
    - GET /api/posts/{id} (PostController@show)
    - PUT /api/posts/{id} (PostController@update)
    - DELETE /api/posts/{id} (PostController@destroy)
    - POST /api/posts/{id}/media (PostController@uploadMedia)
    - All routes use auth:sanctum middleware
    - _Requirements: All post management requirements_
  
  - [x] 13.2 Add like routes
    - POST /api/posts/{id}/like (LikeController@store)
    - DELETE /api/posts/{id}/like (LikeController@destroy)
    - GET /api/posts/{id}/likes (LikeController@index)
    - All routes use auth:sanctum middleware
    - _Requirements: 6.1, 6.3, 6.5_
  
  - [x] 13.3 Add comment routes
    - GET /api/posts/{id}/comments (CommentController@index)
    - POST /api/posts/{id}/comments (CommentController@store)
    - DELETE /api/comments/{id} (CommentController@destroy)
    - All routes use auth:sanctum middleware
    - _Requirements: 7.1, 7.3, 8.1_
  
  - [x] 13.4 Add saved post routes
    - POST /api/posts/{id}/save (SavedPostController@store)
    - DELETE /api/posts/{id}/save (SavedPostController@destroy)
    - GET /api/posts/saved (SavedPostController@index)
    - All routes use auth:sanctum middleware
    - _Requirements: 9.1, 9.3, 9.4_

- [x] 14. Checkpoint - Run migrations and test basic functionality
  - Run migrations to create all tables
  - Verify foreign key constraints are working
  - Test post creation via API
  - Test feed retrieval
  - Ensure all tests pass, ask the user if questions arise

- [ ]* 15. Write integration and edge case tests
  - [ ]* 15.1 Write unit tests for edge cases
    - Test empty post rejection
    - Test media file validation (size, type limits)
    - Test empty comment rejection
    - Test content length limits
    - Test pagination with various page sizes
    - _Requirements: 1.4, 1.6, 1.7, 7.2, 16.1, 16.2_
  
  - [ ]* 15.2 Write property test for block enforcement
    - **Property 38: Blocked users cannot engage with posts**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.5**
  
  - [ ]* 15.3 Write property test for pagination
    - **Property 39: Pagination returns correct page size**
    - **Property 40: Cursor pagination maintains consistency**
    - **Validates: Requirements 11.1, 11.2**
  
  - [ ]* 15.4 Write property test for authentication
    - **Property 41: Authentication required for all endpoints**
    - **Property 42: Authenticated users can engage with accessible posts**
    - **Validates: Requirements 12.1, 12.5**
  
  - [ ]* 15.5 Write property test for transaction safety
    - **Property 43: Transaction rollback on failure**
    - **Validates: Requirements 17.1**
  
  - [ ]* 15.6 Write property test for XSS prevention
    - **Property 44: XSS prevention through sanitization**
    - **Validates: Requirements 16.3**

- [-] 16. Create documentation and testing artifacts
  - [x] 16.1 Create PHASE6_SETUP.md documentation
    - Document all API endpoints with request/response examples
    - Document database schema
    - Document integration with existing phases
    - Include setup instructions
    - _Requirements: All requirements_
  
  - [ ] 16.2 Create Postman collection
    - Add all 14 API endpoints
    - Include example requests with valid data
    - Include authentication headers
    - Export as JSON file
    - _Requirements: All requirements_
  
  - [x] 16.3 Create PHASE6_QUICK_REFERENCE.md
    - Quick reference for common operations
    - Code snippets for typical use cases
    - Troubleshooting guide
    - _Requirements: All requirements_

- [ ] 17. Final checkpoint - Complete testing and validation
  - Run all property-based tests (minimum 100 iterations each)
  - Run all unit tests
  - Verify all 14 API endpoints work correctly
  - Test with Postman collection
  - Verify block enforcement across all endpoints
  - Verify engagement counts remain accurate
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties (minimum 100 iterations)
- Unit tests validate specific examples and edge cases
- MediaService from Phase 3 is reused for file handling
- Block relationship checks integrate with Phase 2 infrastructure
- All endpoints require Laravel Sanctum authentication
- Database transactions ensure count accuracy and data integrity
