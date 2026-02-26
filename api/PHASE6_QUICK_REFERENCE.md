# Phase 6: Social Feed - Quick Reference

## Common Operations

### Create a Post with Text Only
```bash
curl -X POST http://localhost:8000/api/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello, world!"}'
```

### Create a Post with Media
```bash
curl -X POST http://localhost:8000/api/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "content=Check out this photo!" \
  -F "media[]=@/path/to/image.jpg"
```

### Get Your Feed
```bash
curl -X GET http://localhost:8000/api/v1/posts \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Like a Post
```bash
curl -X POST http://localhost:8000/api/v1/posts/1/like \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Comment on a Post
```bash
curl -X POST http://localhost:8000/api/v1/posts/1/comments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Great post!"}'
```

### Save a Post
```bash
curl -X POST http://localhost:8000/api/v1/posts/1/save \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Saved Posts
```bash
curl -X GET http://localhost:8000/api/v1/posts/saved \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Code Snippets

### Using PostService in a Controller
```php
use App\Services\PostService;

class CustomController extends Controller
{
    public function __construct(private PostService $postService) {}
    
    public function createPost(Request $request)
    {
        $post = $this->postService->createPost(
            $request->user(),
            $request->input('content'),
            $request->file('media', [])
        );
        
        return response()->json($post);
    }
}
```

### Checking if User Liked a Post
```php
$post = Post::find(1);
$user = auth()->user();

if ($post->isLikedBy($user)) {
    // User has liked this post
}
```

### Getting Feed for a User
```php
$posts = Post::forFeed($user)
    ->with(['user', 'media'])
    ->orderBy('created_at', 'desc')
    ->paginate(20);
```

### Manually Incrementing Engagement Counts
```php
$post = Post::find(1);
$post->incrementLikes();
$post->incrementComments();
```

## Validation Examples

### Valid Post Creation
```json
{
  "content": "This is a valid post"
}
```

```json
{
  "media": ["file1.jpg", "file2.png"]
}
```

```json
{
  "content": "Post with media",
  "media": ["image.jpg"]
}
```

### Invalid Post Creation
```json
{
  // Empty - will fail validation
}
```

```json
{
  "content": "",
  "media": []
  // Both empty - will fail validation
}
```

```json
{
  "media": ["file1.jpg", "file2.jpg", "file3.jpg", "file4.jpg", "file5.jpg", "file6.jpg"]
  // Too many files (max 5) - will fail validation
}
```

## Common Errors and Solutions

### Error: "Post must have content or media"
**Cause:** Trying to create a post without content or media
**Solution:** Provide at least one of content or media

### Error: "You have already liked this post"
**Cause:** Trying to like a post that's already liked
**Solution:** Check if post is liked before attempting to like

### Error: "Unauthorized"
**Cause:** Trying to edit/delete another user's post
**Solution:** Only post authors can edit/delete their posts

### Error: "Unable to like this post"
**Cause:** Blocked by post author or blocking post author
**Solution:** Cannot interact with posts from blocked users

### Error: "Post not found"
**Cause:** Post doesn't exist or is from a blocked user
**Solution:** Verify post ID and check block relationships

## Database Queries

### Get Posts with Engagement Data
```php
$posts = Post::with(['user', 'media'])
    ->withCount(['likes', 'comments'])
    ->get();
```

### Get User's Posts
```php
$userPosts = Post::where('user_id', $userId)
    ->with(['media'])
    ->orderBy('created_at', 'desc')
    ->get();
```

### Get Posts Liked by User
```php
$likedPosts = Post::whereHas('likes', function ($query) use ($userId) {
    $query->where('user_id', $userId);
})->get();
```

### Get Posts Saved by User
```php
$savedPosts = Post::whereHas('savedBy', function ($query) use ($userId) {
    $query->where('user_id', $userId);
})->get();
```

## Testing Checklist

- [ ] Create post with text only
- [ ] Create post with media only
- [ ] Create post with both text and media
- [ ] Attempt to create empty post (should fail)
- [ ] Upload more than 5 media files (should fail)
- [ ] Edit own post
- [ ] Attempt to edit another user's post (should fail)
- [ ] Delete own post
- [ ] Verify cascading deletion (comments, likes, media)
- [ ] Like a post
- [ ] Attempt to like same post twice (should fail)
- [ ] Unlike a post
- [ ] View list of post likers
- [ ] Add comment to post
- [ ] Delete own comment
- [ ] Delete comment as post author
- [ ] Attempt to delete another user's comment (should fail)
- [ ] Save a post
- [ ] Attempt to save same post twice (should fail)
- [ ] Unsave a post
- [ ] View saved posts
- [ ] Verify feed includes followed users' posts
- [ ] Verify feed includes own posts
- [ ] Verify feed excludes blocked users' posts
- [ ] Test pagination on all list endpoints

## Performance Tips

1. **Eager Load Relationships**: Always eager load user and media when fetching posts
   ```php
   Post::with(['user', 'media'])->get();
   ```

2. **Use Cached Counts**: The likes_count and comments_count are cached on the posts table
   ```php
   $post->likes_count; // Fast - uses cached value
   ```

3. **Pagination**: Always paginate large result sets
   ```php
   Post::paginate(20); // Default page size
   ```

4. **Index Usage**: Queries on user_id, created_at, and deleted_at use indexes

## Troubleshooting

### Posts Not Appearing in Feed
- Check if user is following the post author
- Verify no block relationships exist
- Check if post is soft deleted

### Media Not Displaying
- Verify storage is configured correctly
- Check file permissions
- Ensure Storage::url() is configured properly

### Engagement Counts Incorrect
- Counts are cached - verify transactions completed
- Check for failed transactions
- Manually recalculate if needed:
  ```php
  $post->update([
      'likes_count' => $post->likes()->count(),
      'comments_count' => $post->comments()->count()
  ]);
  ```

### Block Relationships Not Working
- Verify Phase 2 (Social Features) is properly implemented
- Check that blocking/blocked relationships exist in database
- Ensure PostService checks are in place

## API Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error"]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data retrieved",
  "data": {
    "data": [...],
    "current_page": 1,
    "per_page": 20,
    "total": 100,
    "last_page": 5
  }
}
```
