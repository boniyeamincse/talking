# Requirements Document: Phase 6 - Social Feed

## Introduction

The Social Feed system enables users to share content, engage with posts through likes and comments, and curate their feed experience. This feature transforms the Talkin platform from a communication-focused app into a full social media experience where users can broadcast updates, share media, and interact with content from their network. The social feed integrates with existing authentication (Laravel Sanctum), social relationships (follow/block), and media handling infrastructure from previous phases.

## Glossary

- **Feed_System**: The complete social content subsystem including posts, comments, likes, and saved posts
- **Post**: A content item created by a user containing text, media, or both
- **Comment**: A response to a post created by a user
- **Like**: An engagement action indicating a user appreciates a post
- **Saved_Post**: A post that a user has bookmarked for later reference
- **Feed**: A paginated collection of posts displayed to a user
- **Post_Author**: The user who created a post
- **Media_Attachment**: An image, video, or other media file attached to a post
- **Engagement_Count**: Aggregate counts of likes and comments on a post
- **Post_Visibility**: The access control state determining who can view a post

## Requirements

### Requirement 1: Post Creation

**User Story:** As a user, I want to create posts with text and media, so that I can share content with my network.

#### Acceptance Criteria

1. WHEN a user creates a post with text content, THE Feed_System SHALL create a new Post with the provided text
2. WHEN a user creates a post with media attachments, THE Feed_System SHALL validate and store the media files
3. WHEN a user creates a post with both text and media, THE Feed_System SHALL store both components together
4. WHEN a user attempts to create an empty post (no text and no media), THE Feed_System SHALL reject the request
5. THE Feed_System SHALL support up to 5 media attachments per post
6. THE Feed_System SHALL support image files (JPEG, PNG, GIF, WebP) up to 10MB each
7. THE Feed_System SHALL support video files (MP4, WebM) up to 100MB each
8. WHEN a post is created, THE Feed_System SHALL record the Post_Author and creation timestamp

### Requirement 2: Post Retrieval and Feed Display

**User Story:** As a user, I want to view a feed of posts, so that I can see content from users I follow and discover new content.

#### Acceptance Criteria

1. WHEN a user requests their feed, THE Feed_System SHALL return posts ordered by creation time (newest first) with pagination support
2. WHEN a user requests their feed, THE Feed_System SHALL include posts from users they follow
3. WHEN a user requests their feed, THE Feed_System SHALL include their own posts
4. WHEN a user requests their feed, THE Feed_System SHALL exclude posts from users they have blocked or who have blocked them
5. WHEN a user requests a single post, THE Feed_System SHALL return the post with all metadata including engagement counts
6. THE Feed_System SHALL return paginated results with a default page size of 20 posts
7. WHEN a post is retrieved, THE Feed_System SHALL include Post_Author information, media attachments, and engagement counts

### Requirement 3: Post Editing

**User Story:** As a user, I want to edit my posts, so that I can correct mistakes or update content.

#### Acceptance Criteria

1. WHEN a Post_Author edits their post text, THE Feed_System SHALL update the post content and record the edit timestamp
2. WHEN a user attempts to edit another user's post, THE Feed_System SHALL reject the request
3. WHEN a post is edited, THE Feed_System SHALL preserve the original creation timestamp
4. WHEN a post is edited, THE Feed_System SHALL indicate that the post has been edited in the post metadata
5. THE Feed_System SHALL not allow editing of media attachments (only text content can be edited)

### Requirement 4: Post Deletion

**User Story:** As a user, I want to delete my posts, so that I can remove content I no longer want visible.

#### Acceptance Criteria

1. WHEN a Post_Author deletes their post, THE Feed_System SHALL remove the post and all associated data (comments, likes, media)
2. WHEN a user attempts to delete another user's post, THE Feed_System SHALL reject the request
3. WHEN a post is deleted, THE Feed_System SHALL delete all associated media files from storage
4. WHEN a post is deleted, THE Feed_System SHALL remove all comments and likes associated with that post

### Requirement 5: Post Media Upload

**User Story:** As a user, I want to upload media to my posts, so that I can share visual content with my network.

#### Acceptance Criteria

1. WHEN a user uploads media for a post, THE Feed_System SHALL validate file type and size before storage
2. WHEN valid media is uploaded, THE Feed_System SHALL store the file and create a Media_Attachment record
3. WHEN invalid media is uploaded, THE Feed_System SHALL reject the upload with a descriptive error
4. THE Feed_System SHALL generate unique file names to prevent collisions
5. THE Feed_System SHALL store media files in a publicly accessible storage location
6. WHEN media is uploaded, THE Feed_System SHALL record the file type, size, and storage path

### Requirement 6: Like Functionality

**User Story:** As a user, I want to like posts, so that I can show appreciation for content I enjoy.

#### Acceptance Criteria

1. WHEN a user likes a post, THE Feed_System SHALL create a like record and increment the post's like count
2. WHEN a user attempts to like a post they have already liked, THE Feed_System SHALL reject the request
3. WHEN a user unlikes a post, THE Feed_System SHALL remove the like record and decrement the post's like count
4. WHEN a user attempts to unlike a post they haven't liked, THE Feed_System SHALL reject the request
5. WHEN a user requests a post's likers, THE Feed_System SHALL return a paginated list of users who have liked the post
6. THE Feed_System SHALL cache like counts on the post record for performance

### Requirement 7: Comment Functionality

**User Story:** As a user, I want to comment on posts, so that I can engage in discussions about content.

#### Acceptance Criteria

1. WHEN a user adds a comment to a post, THE Feed_System SHALL create a new Comment with the provided text
2. WHEN a user attempts to add an empty comment, THE Feed_System SHALL reject the request
3. WHEN a user requests comments for a post, THE Feed_System SHALL return comments ordered chronologically with pagination support
4. WHEN comments are retrieved, THE Feed_System SHALL include commenter information and timestamps
5. THE Feed_System SHALL cache comment counts on the post record for performance
6. WHEN a comment is created, THE Feed_System SHALL increment the post's comment count

### Requirement 8: Comment Deletion

**User Story:** As a user, I want to delete my comments, so that I can remove responses I no longer want visible.

#### Acceptance Criteria

1. WHEN a user deletes their own comment, THE Feed_System SHALL remove the comment and decrement the post's comment count
2. WHEN a Post_Author deletes a comment on their post, THE Feed_System SHALL remove the comment and decrement the comment count
3. WHEN a user attempts to delete another user's comment (and they are not the Post_Author), THE Feed_System SHALL reject the request
4. WHEN a comment is deleted, THE Feed_System SHALL remove it from the database permanently

### Requirement 9: Save Post Functionality

**User Story:** As a user, I want to save posts for later, so that I can easily find content I want to reference again.

#### Acceptance Criteria

1. WHEN a user saves a post, THE Feed_System SHALL create a saved post record with a timestamp
2. WHEN a user attempts to save a post they have already saved, THE Feed_System SHALL reject the request
3. WHEN a user unsaves a post, THE Feed_System SHALL remove the saved post record
4. WHEN a user requests their saved posts, THE Feed_System SHALL return a paginated list of saved posts ordered by save time (newest first)
5. WHEN a saved post is deleted by its author, THE Feed_System SHALL remove it from all users' saved collections

### Requirement 10: Block Relationship Integration

**User Story:** As a user, I want blocked users to be unable to see or interact with my posts, so that I can maintain my boundaries.

#### Acceptance Criteria

1. WHEN a user blocks another user, THE Feed_System SHALL exclude the blocked user's posts from the blocker's feed
2. WHEN a user blocks another user, THE Feed_System SHALL prevent the blocked user from viewing the blocker's posts
3. WHEN a user blocks another user, THE Feed_System SHALL prevent the blocked user from liking or commenting on the blocker's posts
4. WHEN a user requests a post from a blocked user, THE Feed_System SHALL return a not found error without revealing the block status
5. WHEN a blocked user attempts to interact with a blocker's post, THE Feed_System SHALL reject the request without revealing the block status

### Requirement 11: Feed Pagination and Performance

**User Story:** As a user, I want to scroll through my feed efficiently, so that I can browse content without delays.

#### Acceptance Criteria

1. WHEN a user requests their feed, THE Feed_System SHALL return paginated results with a default page size of 20 posts
2. WHEN a user requests additional feed pages, THE Feed_System SHALL support cursor-based pagination for efficient loading
3. THE Feed_System SHALL eager load post relationships (author, media, engagement counts) to prevent N+1 query problems
4. WHEN a feed request is made, THE Feed_System SHALL respond within 500ms for feeds with up to 10,000 posts

### Requirement 12: Post Ownership and Authorization

**User Story:** As a system, I want to enforce ownership rules, so that users can only modify their own content.

#### Acceptance Criteria

1. THE Feed_System SHALL require valid Sanctum authentication tokens for all API endpoints
2. WHEN a user attempts to edit a post, THE Feed_System SHALL verify they are the Post_Author
3. WHEN a user attempts to delete a post, THE Feed_System SHALL verify they are the Post_Author
4. WHEN a user attempts to delete a comment, THE Feed_System SHALL verify they are either the comment author or the Post_Author
5. THE Feed_System SHALL allow any authenticated user to like, comment on, or save posts (unless blocked)

### Requirement 13: Data Integrity and Cascading Deletes

**User Story:** As a developer, I want proper data cleanup, so that deleted content doesn't leave orphaned records.

#### Acceptance Criteria

1. WHEN a post is deleted, THE Feed_System SHALL cascade delete all associated comments
2. WHEN a post is deleted, THE Feed_System SHALL cascade delete all associated likes
3. WHEN a post is deleted, THE Feed_System SHALL cascade delete all associated saved post records
4. WHEN a post is deleted, THE Feed_System SHALL cascade delete all associated media files from storage
5. THE Feed_System SHALL use database foreign key constraints to enforce referential integrity

### Requirement 14: Media Storage and Retrieval

**User Story:** As a user, I want to view media in posts, so that I can see images and videos shared by others.

#### Acceptance Criteria

1. WHEN a post with media is retrieved, THE Feed_System SHALL include publicly accessible URLs for all media attachments
2. THE Feed_System SHALL store media files using unique identifiers to prevent naming collisions
3. THE Feed_System SHALL organize media files by date and post ID for efficient storage management
4. WHEN media is requested, THE Feed_System SHALL serve files with appropriate content-type headers
5. THE Feed_System SHALL support both local storage and cloud storage (S3-compatible) for media files

### Requirement 15: Engagement Count Accuracy

**User Story:** As a user, I want to see accurate engagement counts, so that I can gauge post popularity.

#### Acceptance Criteria

1. WHEN a like is added or removed, THE Feed_System SHALL update the post's cached like count atomically
2. WHEN a comment is added or removed, THE Feed_System SHALL update the post's cached comment count atomically
3. THE Feed_System SHALL use database transactions to ensure count accuracy during concurrent operations
4. WHEN engagement counts become inconsistent, THE Feed_System SHALL provide a mechanism to recalculate counts from source data

### Requirement 16: Input Validation and Sanitization

**User Story:** As a developer, I want robust input validation, so that the system rejects invalid data and prevents security issues.

#### Acceptance Criteria

1. WHEN a user creates or edits a post, THE Feed_System SHALL validate that text content does not exceed 5000 characters
2. WHEN a user creates a comment, THE Feed_System SHALL validate that text content does not exceed 1000 characters
3. THE Feed_System SHALL sanitize all text input to prevent XSS attacks
4. WHEN media is uploaded, THE Feed_System SHALL validate file MIME types match allowed extensions
5. WHEN media is uploaded, THE Feed_System SHALL validate file sizes are within specified limits

### Requirement 17: Error Handling

**User Story:** As a developer, I want comprehensive error handling, so that the system provides clear feedback and maintains stability.

#### Acceptance Criteria

1. WHEN a database operation fails, THE Feed_System SHALL rollback transactions and return appropriate error messages
2. WHEN a user requests a non-existent post, THE Feed_System SHALL return a 404 error
3. WHEN a user attempts an unauthorized action, THE Feed_System SHALL return a 403 error
4. WHEN validation fails, THE Feed_System SHALL return a 422 error with field-specific error messages
5. WHEN media upload fails, THE Feed_System SHALL clean up any partially uploaded files and return an error

### Requirement 18: API Response Format Consistency

**User Story:** As a frontend developer, I want consistent API responses, so that I can reliably parse and display data.

#### Acceptance Criteria

1. THE Feed_System SHALL return all posts with a consistent JSON structure including id, author, content, media, engagement counts, and timestamps
2. THE Feed_System SHALL return all comments with a consistent JSON structure including id, author, content, and timestamps
3. THE Feed_System SHALL include pagination metadata (current page, total pages, per page, total count) in all paginated responses
4. THE Feed_System SHALL include relationship flags (is_liked_by_user, is_saved_by_user) in post responses for the authenticated user
5. THE Feed_System SHALL format all timestamps in ISO 8601 format with timezone information
