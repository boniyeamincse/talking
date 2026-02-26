# Design Document: Phase 6 - Social Feed

## Overview

The Social Feed system implements a content sharing and engagement platform for the Talkin application. Users can create posts with text and media, engage through likes and comments, and curate content by saving posts for later reference. The system integrates with existing authentication (Laravel Sanctum), social relationships (follow/block from Phase 2), and media handling patterns established in Phase 3.

Key design decisions:
- Use cached engagement counts (likes_count, comments_count) on posts table for performance
- Store media using the existing MediaService pattern from Phase 3
- Implement soft deletes for posts to maintain referential integrity
- Use database transactions for operations that modify counts
- Integrate block relationship checks at the controller level
- Follow RESTful API design patterns consistent with existing phases

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│                    (Mobile/Web Frontend)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/JSON
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    Laravel API Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    Routes (api.php)                   │  │
│  │         POST /posts, GET /posts, etc.                │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │                   Controllers                         │  │
│  │  PostController, CommentController, LikeController   │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │                     Services                          │  │
│  │    PostService, MediaService (reused from Phase 3)   │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │                  Models (Eloquent)                    │  │
│  │      Post, Comment, Like, SavedPost, PostMedia       │  │
│  └────────────────────────┬─────────────────────────────┘  │
│                           │                                  │
│  ┌────────────────────────▼─────────────────────────────┐  │
│  │                Database (SQLite/MySQL)                │  │
│  │   posts, comments, likes, saved_posts, post_media    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Controllers**: Handle HTTP requests, validate input, authorize actions, coordinate service calls, return JSON responses
**Services**: Implement business logic, manage database transactions, handle media storage
**Models**: Define data structure, relationships, scopes, and basic queries
**Resources**: Transform model data into consistent JSON API responses
**Middleware**: Enforce authentication and rate limiting

## Components and Interfaces

### Database Schema

**posts table**:
```sql
id: bigint (primary key)
user_id: bigint (foreign key to users)
content: text (nullable)
likes_count: integer (default 0, cached)
comments_count: integer (default 0, cached)
is_edited: boolean (default false)
created_at: timestamp
updated_at: timestamp
deleted_at: timestamp (nullable, soft delete)

INDEX idx_user_id (user_id)
INDEX idx_created_at (created_at)
INDEX idx_deleted_at (deleted_at)
```

**post_media table**:
```sql
id: bigint (primary key)
post_id: bigint (foreign key to posts)
file_path: string
file_type: enum('image', 'video')
file_size: integer (bytes)
mime_type: string
display_order: integer (default 0)
created_at: timestamp
updated_at: timestamp

INDEX idx_post_id (post_id)
```

**comments table**:
```sql
id: bigint (primary key)
post_id: bigint (foreign key to posts)
user_id: bigint (foreign key to users)
content: text
created_at: timestamp
updated_at: timestamp

INDEX idx_post_id (post_id)
INDEX idx_user_id (user_id)
INDEX idx_created_at (created_at)
```

**likes table**:
```sql
id: bigint (primary key)
post_id: bigint (foreign key to posts)
user_id: bigint (foreign key to users)
created_at: timestamp

UNIQUE KEY unique_like (post_id, user_id)
INDEX idx_post_id (post_id)
INDEX idx_user_id (user_id)
```

**saved_posts table**:
```sql
id: bigint (primary key)
post_id: bigint (foreign key to posts)
user_id: bigint (foreign key to users)
created_at: timestamp

UNIQUE KEY unique_save (post_id, user_id)
INDEX idx_user_id (user_id)
INDEX idx_created_at (created_at)
```

### API Endpoints

**Post Management**:
- `GET /api/posts` - Get feed with pagination
- `POST /api/posts` - Create post (text/photo/video)
- `GET /api/posts/{id}` - Get single post
- `PUT /api/posts/{id}` - Edit own post
- `DELETE /api/posts/{id}` - Delete own post
- `POST /api/posts/{id}/media` - Upload post media

**Engagement**:
- `POST /api/posts/{id}/like` - Like post
- `DELETE /api/posts/{id}/like` - Unlike post
- `GET /api/posts/{id}/likes` - Get post likers
- `POST /api/posts/{id}/save` - Save post
- `DELETE /api/posts/{id}/save` - Unsave post
- `GET /api/posts/saved` - Get saved posts

**Comments**:
- `GET /api/posts/{id}/comments` - Get comments
- `POST /api/posts/{id}/comments` - Add comment
- `DELETE /api/comments/{id}` - Delete comment

### Models

**Post Model**:
```php
class Post extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'user_id',
        'content',
        'likes_count',
        'comments_count',
        'is_edited'
    ];
    
    protected $casts = [
        'is_edited' => 'boolean',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];
    
    // Relationships
    public function user(): BelongsTo
    public function media(): HasMany
    public function comments(): HasMany
    public function likes(): HasMany
    public function savedBy(): HasMany
    
    // Scopes
    public function scopeWithEngagement(Builder $query): Builder
    public function scopeForFeed(Builder $query, User $user): Builder
    
    // Methods
    public function isOwnedBy(User $user): bool
    public function isLikedBy(User $user): bool
    public function isSavedBy(User $user): bool
    public function incrementLikes(): void
    public function decrementLikes(): void
    public function incrementComments(): void
    public function decrementComments(): void
}
```

**PostMedia Model**:
```php
class PostMedia extends Model
{
    protected $table = 'post_media';
    
    protected $fillable = [
        'post_id',
        'file_path',
        'file_type',
        'file_size',
        'mime_type',
        'display_order'
    ];
    
    protected $casts = [
        'file_size' => 'integer',
        'display_order' => 'integer'
    ];
    
    // Relationships
    public function post(): BelongsTo
    
    // Methods
    public function getUrl(): string
}
```

**Comment Model**:
```php
class Comment extends Model
{
    protected $fillable = [
        'post_id',
        'user_id',
        'content'
    ];
    
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];
    
    // Relationships
    public function post(): BelongsTo
    public function user(): BelongsTo
    
    // Methods
    public function isOwnedBy(User $user): bool
    public function canBeDeletedBy(User $user): bool
}
```

**Like Model**:
```php
class Like extends Model
{
    protected $fillable = [
        'post_id',
        'user_id'
    ];
    
    public $timestamps = false;
    
    protected $casts = [
        'created_at' => 'datetime'
    ];
    
    // Relationships
    public function post(): BelongsTo
    public function user(): BelongsTo
}
```

**SavedPost Model**:
```php
class SavedPost extends Model
{
    protected $fillable = [
        'post_id',
        'user_id'
    ];
    
    public $timestamps = false;
    
    protected $casts = [
        'created_at' => 'datetime'
    ];
    
    // Relationships
    public function post(): BelongsTo
    public function user(): BelongsTo
}
```

### Services

**PostService**:
```php
class PostService
{
    public function __construct(
        private MediaService $mediaService
    ) {}
    
    public function createPost(User $user, ?string $content, array $mediaFiles = []): Post
    public function updatePost(Post $post, string $content): Post
    public function deletePost(Post $post): void
    public function uploadMedia(Post $post, UploadedFile $file): PostMedia
    public function getFeed(User $user, int $perPage = 20): LengthAwarePaginator
    public function getPost(int $postId, User $user): ?Post
    public function likePost(Post $post, User $user): void
    public function unlikePost(Post $post, User $user): void
    public function getLikers(Post $post, int $perPage = 20): LengthAwarePaginator
    public function savePost(Post $post, User $user): void
    public function unsavePost(Post $post, User $user): void
    public function getSavedPosts(User $user, int $perPage = 20): LengthAwarePaginator
    public function addComment(Post $post, User $user, string $content): Comment
    public function deleteComment(Comment $comment): void
    public function getComments(Post $post, int $perPage = 20): LengthAwarePaginator
}
```

### Controllers

**PostController**:
```php
class PostController extends BaseController
{
    public function __construct(
        private PostService $postService
    ) {}
    
    public function index(Request $request): JsonResponse
    public function store(StorePostRequest $request): JsonResponse
    public function show(Request $request, int $id): JsonResponse
    public function update(UpdatePostRequest $request, int $id): JsonResponse
    public function destroy(Request $request, int $id): JsonResponse
    public function uploadMedia(UploadMediaRequest $request, int $id): JsonResponse
}
```

**LikeController**:
```php
class LikeController extends BaseController
{
    public function __construct(
        private PostService $postService
    ) {}
    
    public function store(Request $request, int $postId): JsonResponse
    public function destroy(Request $request, int $postId): JsonResponse
    public function index(Request $request, int $postId): JsonResponse
}
```

**SavedPostController**:
```php
class SavedPostController extends BaseController
{
    public function __construct(
        private PostService $postService
    ) {}
    
    public function store(Request $request, int $postId): JsonResponse
    public function destroy(Request $request, int $postId): JsonResponse
    public function index(Request $request): JsonResponse
}
```

**CommentController**:
```php
class CommentController extends BaseController
{
    public function __construct(
        private PostService $postService
    ) {}
    
    public function index(Request $request, int $postId): JsonResponse
    public function store(StoreCommentRequest $request, int $postId): JsonResponse
    public function destroy(Request $request, int $id): JsonResponse
}
```

### Request Validation

**StorePostRequest**:
```php
class StorePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'content' => 'nullable|string|max:5000',
            'media' => 'nullable|array|max:5',
            'media.*' => 'file|mimes:jpeg,png,gif,webp,mp4,webm|max:102400'
        ];
    }
    
    public function authorize(): bool
    {
        return true; // Handled by auth:sanctum middleware
    }
    
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if (empty($this->content) && empty($this->media)) {
                $validator->errors()->add('content', 'Post must have content or media');
            }
        });
    }
}
```

**UpdatePostRequest**:
```php
class UpdatePostRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'content' => 'required|string|max:5000'
        ];
    }
    
    public function authorize(): bool
    {
        $post = Post::find($this->route('id'));
        return $post && $post->user_id === $this->user()->id;
    }
}
```

**StoreCommentRequest**:
```php
class StoreCommentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'content' => 'required|string|max:1000'
        ];
    }
}
```

**UploadMediaRequest**:
```php
class UploadMediaRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'media' => 'required|file|mimes:jpeg,png,gif,webp,mp4,webm|max:102400'
        ];
    }
    
    public function authorize(): bool
    {
        $post = Post::find($this->route('id'));
        return $post && $post->user_id === $this->user()->id;
    }
}
```

### Resources

**PostResource**:
```php
class PostResource extends JsonResource
{
    public function toArray($request)
    {
        $authUser = $request->user();
        
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'content' => $this->content,
            'media' => PostMediaResource::collection($this->whenLoaded('media')),
            'likes_count' => $this->likes_count,
            'comments_count' => $this->comments_count,
            'is_edited' => $this->is_edited,
            'is_liked_by_user' => $authUser ? $this->isLikedBy($authUser) : false,
            'is_saved_by_user' => $authUser ? $this->isSavedBy($authUser) : false,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String()
        ];
    }
}
```

**PostMediaResource**:
```php
class PostMediaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'url' => $this->getUrl(),
            'file_type' => $this->file_type,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'display_order' => $this->display_order
        ];
    }
}
```

**CommentResource**:
```php
class CommentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'post_id' => $this->post_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'content' => $this->content,
            'created_at' => $this->created_at->toIso8601String()
        ];
    }
}
```

## Data Models

### Post Model Structure

```php
Post {
    id: int
    user_id: int
    content: string | null
    likes_count: int
    comments_count: int
    is_edited: bool
    created_at: timestamp
    updated_at: timestamp
    deleted_at: timestamp | null
    
    // Relationships
    user: User
    media: PostMedia[]
    comments: Comment[]
    likes: Like[]
    savedBy: SavedPost[]
    
    // Computed
    isLikedBy(user): bool
    isSavedBy(user): bool
    isOwnedBy(user): bool
}
```

### Comment Model Structure

```php
Comment {
    id: int
    post_id: int
    user_id: int
    content: string
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    post: Post
    user: User
    
    // Computed
    isOwnedBy(user): bool
    canBeDeletedBy(user): bool
}
```

### Like Model Structure

```php
Like {
    id: int
    post_id: int
    user_id: int
    created_at: timestamp
    
    // Relationships
    post: Post
    user: User
}
```

### SavedPost Model Structure

```php
SavedPost {
    id: int
    post_id: int
    user_id: int
    created_at: timestamp
    
    // Relationships
    post: Post
    user: User
}
```

### PostMedia Model Structure

```php
PostMedia {
    id: int
    post_id: int
    file_path: string
    file_type: 'image' | 'video'
    file_size: int
    mime_type: string
    display_order: int
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    post: Post
    
    // Computed
    url: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Post creation with text stores content

*For any* valid text content, creating a post should result in a post record with that exact content stored.

**Validates: Requirements 1.1**

### Property 2: Post creation with media stores files

*For any* valid media file, creating a post with that media should result in the file being stored and a media record created.

**Validates: Requirements 1.2, 5.2**

### Property 3: Post creation with text and media stores both

*For any* valid text content and valid media file, creating a post with both should result in both the text and media being stored together.

**Validates: Requirements 1.3**

### Property 4: Media attachment limit enforcement

*For any* post, attempting to attach more than 5 media files should be rejected, while 5 or fewer should succeed.

**Validates: Requirements 1.5**

### Property 5: Post creation records author and timestamp

*For any* post created by a user, the post record should contain the user_id and a creation timestamp.

**Validates: Requirements 1.8**

### Property 6: Feed posts ordered by creation time

*For any* user's feed with multiple posts, the posts should be ordered with the newest post first.

**Validates: Requirements 2.1**

### Property 7: Feed includes followed users' posts

*For any* user who follows other users, their feed should include posts from all users they follow.

**Validates: Requirements 2.2**

### Property 8: Feed includes own posts

*For any* user with posts, their feed should include their own posts.

**Validates: Requirements 2.3**

### Property 9: Feed excludes blocked users' posts

*For any* user with block relationships, their feed should not include posts from users they blocked or users who blocked them.

**Validates: Requirements 2.4, 10.1**

### Property 10: Post retrieval includes all metadata

*For any* post retrieved, the response should include author information, media attachments, likes_count, comments_count, and timestamps.

**Validates: Requirements 2.5, 2.7**

### Property 11: Post editing updates content and sets edited flag

*For any* post edited by its author, the content should be updated, is_edited should be true, and updated_at should be set to the current time.

**Validates: Requirements 3.1, 3.4**

### Property 12: Only post authors can edit posts

*For any* post and user who is not the post author, edit attempts should be rejected.

**Validates: Requirements 3.2, 12.2**

### Property 13: Post editing preserves creation timestamp

*For any* post that is edited, the created_at timestamp should remain unchanged.

**Validates: Requirements 3.3**

### Property 14: Post editing does not modify media

*For any* post with media attachments, editing the text content should not modify, add, or remove media attachments.

**Validates: Requirements 3.5**

### Property 15: Post deletion cascades to all related data

*For any* post that is deleted, all associated comments, likes, saved post records, and media files should be removed.

**Validates: Requirements 4.1, 4.4, 13.1, 13.2, 13.3, 13.4**

### Property 16: Only post authors can delete posts

*For any* post and user who is not the post author, delete attempts should be rejected.

**Validates: Requirements 4.2, 12.3**

### Property 17: Media deletion removes storage files

*For any* post with media that is deleted, the media files should be removed from storage.

**Validates: Requirements 4.3**

### Property 18: Media file names are unique

*For any* set of media uploads, all generated file names should be unique to prevent collisions.

**Validates: Requirements 5.4, 14.2**

### Property 19: Media records contain required fields

*For any* media upload, the created media record should include file_type, file_size, and file_path.

**Validates: Requirements 5.6**

### Property 20: Liking a post increments like count

*For any* post and user who hasn't liked it, liking the post should increment likes_count by 1 and create a like record.

**Validates: Requirements 6.1**

### Property 21: Duplicate likes are rejected

*For any* post already liked by a user, attempting to like it again should be rejected.

**Validates: Requirements 6.2**

### Property 22: Unliking a post decrements like count

*For any* post liked by a user, unliking should decrement likes_count by 1 and remove the like record.

**Validates: Requirements 6.3**

### Property 23: Like count matches actual likes

*For any* post, the cached likes_count should equal the actual number of like records in the database.

**Validates: Requirements 15.1**

### Property 24: Likers list matches like records

*For any* post, the list of users returned by the likers endpoint should match the users who have like records for that post.

**Validates: Requirements 6.5**

### Property 25: Comment creation increments comment count

*For any* post and valid comment text, adding a comment should increment comments_count by 1 and create a comment record.

**Validates: Requirements 7.1, 7.6**

### Property 26: Comments ordered chronologically

*For any* post with multiple comments, retrieving comments should return them ordered by creation time (oldest first).

**Validates: Requirements 7.3**

### Property 27: Comment responses include required data

*For any* comment retrieved, the response should include commenter information, content, and timestamp.

**Validates: Requirements 7.4**

### Property 28: Comment count matches actual comments

*For any* post, the cached comments_count should equal the actual number of comment records in the database.

**Validates: Requirements 15.2**

### Property 29: Comment deletion decrements comment count

*For any* comment, deleting it should decrement the post's comments_count by 1 and remove the comment record.

**Validates: Requirements 8.1, 8.4**

### Property 30: Post authors can delete any comment on their posts

*For any* post and comment on that post, the post author should be able to delete the comment regardless of who wrote it.

**Validates: Requirements 8.2**

### Property 31: Comment deletion authorization

*For any* comment, only the comment author or the post author should be able to delete it.

**Validates: Requirements 8.3, 12.4**

### Property 32: Saving a post creates saved record

*For any* post and user who hasn't saved it, saving should create a saved_post record with a timestamp.

**Validates: Requirements 9.1**

### Property 33: Duplicate saves are rejected

*For any* post already saved by a user, attempting to save it again should be rejected.

**Validates: Requirements 9.2**

### Property 34: Unsaving removes saved record

*For any* saved post, unsaving should remove the saved_post record.

**Validates: Requirements 9.3**

### Property 35: Saved posts ordered by save time

*For any* user's saved posts collection, posts should be ordered by save time (newest first).

**Validates: Requirements 9.4**

### Property 36: Post deletion removes all saved references

*For any* post that has been saved by users, deleting the post should remove all saved_post records.

**Validates: Requirements 9.5**

### Property 37: Blocked users cannot view posts

*For any* post and user who is blocked by the post author, attempting to view the post should return a 404 error.

**Validates: Requirements 10.2, 10.4**

### Property 38: Blocked users cannot engage with posts

*For any* post and user who is blocked by the post author (or who has blocked the author), attempting to like or comment should be rejected.

**Validates: Requirements 10.3, 10.5**

### Property 39: Pagination returns correct page size

*For any* feed request, the default page size should be 20 posts unless otherwise specified.

**Validates: Requirements 11.1**

### Property 40: Cursor pagination maintains consistency

*For any* feed with posts, paginating through all pages should return each post exactly once.

**Validates: Requirements 11.2**

### Property 41: Authentication required for all endpoints

*For any* API endpoint in the feed system, requests without valid authentication tokens should be rejected.

**Validates: Requirements 12.1**

### Property 42: Authenticated users can engage with accessible posts

*For any* post and authenticated user (not blocked), the user should be able to like, comment on, and save the post.

**Validates: Requirements 12.5**

### Property 43: Transaction rollback on failure

*For any* database operation that fails, no partial data should be committed to the database.

**Validates: Requirements 17.1**

### Property 44: XSS prevention through sanitization

*For any* text input containing potentially dangerous HTML/JavaScript, the stored content should be sanitized to prevent XSS attacks.

**Validates: Requirements 16.3**

### Property 45: Post responses have consistent structure

*For any* post returned by the API, the JSON structure should include id, user, content, media, likes_count, comments_count, is_edited, is_liked_by_user, is_saved_by_user, created_at, and updated_at.

**Validates: Requirements 18.1**

### Property 46: Comment responses have consistent structure

*For any* comment returned by the API, the JSON structure should include id, post_id, user, content, and created_at.

**Validates: Requirements 18.2**

### Property 47: Paginated responses include metadata

*For any* paginated API response, the response should include current_page, per_page, total, and last_page metadata.

**Validates: Requirements 18.3**

### Property 48: Relationship flags reflect actual state

*For any* post returned to an authenticated user, is_liked_by_user should be true if and only if the user has liked the post, and is_saved_by_user should be true if and only if the user has saved the post.

**Validates: Requirements 18.4**

### Property 49: Timestamps in ISO 8601 format

*For any* timestamp in API responses, the format should be ISO 8601 with timezone information.

**Validates: Requirements 18.5**

## Error Handling

### Error Categories

**Validation Errors (422)**:
- Empty post (no content and no media)
- Content exceeds maximum length (5000 chars for posts, 1000 for comments)
- Invalid media file type or size
- Too many media attachments (>5)
- Empty comment content

**Authentication Errors (401)**:
- Missing or invalid Sanctum token
- Expired authentication token

**Authorization Errors (403)**:
- User attempting to edit another user's post
- User attempting to delete another user's post
- Non-owner/non-author attempting to delete comment

**Not Found Errors (404)**:
- Post does not exist
- Comment does not exist
- Post is from blocked user (disguised as not found)

**Conflict Errors (422)**:
- Attempting to like already-liked post
- Attempting to unlike non-liked post
- Attempting to save already-saved post
- Attempting to unsave non-saved post

**Server Errors (500)**:
- Database transaction failures
- File storage failures
- Media deletion failures

### Error Response Format

All errors follow the existing API error format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": {
    "field_name": ["Specific validation error"]
  }
}
```

### Transaction Management

All operations that modify engagement counts use database transactions:

```php
try {
    DB::beginTransaction();
    
    // Create/delete records
    // Update counts
    
    DB::commit();
    return $this->successResponse($data, $message);
    
} catch (\Exception $e) {
    DB::rollBack();
    return $this->errorResponse('Operation failed', null, 500);
}
```

## Testing Strategy

### Dual Testing Approach

The Social Feed system requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Validate specific examples, edge cases, and error conditions
- Specific post creation scenarios (text only, media only, both)
- Media file upload edge cases (boundary sizes, specific file types)
- Error handling for blocked users
- Integration between components
- Specific pagination examples

**Property Tests**: Verify universal properties across all inputs
- Post creation and retrieval
- Engagement count accuracy (likes, comments)
- Authorization rules across all posts
- Feed composition and ordering
- Cascading deletes
- Data integrity and transaction rollback

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library**: Use Pest with Pest Property Testing plugin for Laravel
**Configuration**: Each property test must run minimum 100 iterations
**Tagging**: Each test must reference its design property using the format:
```php
// Feature: phase6-social-feed, Property 1: Post creation with text stores content
```

**Test Organization**:
- Group tests by feature area (posts, comments, likes, saved posts)
- Each correctness property maps to exactly one property-based test
- Place property tests close to implementation to catch errors early
- Use Laravel's database transactions for test isolation

### Integration Testing

**Block Relationship Integration**:
- Test feed filtering with blocked users
- Test post access with blocked users
- Test engagement prevention with blocked users

**Media Storage Integration**:
- Test file upload and storage
- Test file retrieval and URL generation
- Test file deletion when posts are deleted

**Follow Relationship Integration**:
- Test feed includes posts from followed users
- Test feed composition with various follow graphs

### Test Data Generation

For property-based tests, generate:
- Random users with various relationships (following, blocked, none)
- Random posts with varying content lengths and media counts
- Random comments with different content
- Random like and save combinations
- Random media files with varying sizes and types

### Coverage Goals

- 100% of correctness properties implemented as property tests
- Edge cases covered by unit tests
- All error conditions tested
- Integration points between feed and existing features validated
