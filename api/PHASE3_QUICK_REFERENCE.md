# Phase 3: Chat System - Quick Reference

## API Endpoints

### Conversations
```
GET    /api/v1/chat/conversations              # List conversations
POST   /api/v1/chat/conversations              # Create direct chat
GET    /api/v1/chat/conversations/{id}         # Get conversation
POST   /api/v1/chat/conversations/{id}/typing  # Typing indicator
```

### Groups
```
POST   /api/v1/chat/groups                     # Create group
POST   /api/v1/chat/groups/{id}/members        # Add member
DELETE /api/v1/chat/groups/{id}/members/{userId} # Remove member
```

### Messages
```
GET    /api/v1/chat/conversations/{id}/messages # Get messages
POST   /api/v1/chat/conversations/{id}/messages # Send message
POST   /api/v1/chat/conversations/{id}/media    # Send media
DELETE /api/v1/chat/messages/{id}               # Delete message
POST   /api/v1/chat/conversations/{id}/read     # Mark as read
```

### Reactions
```
POST   /api/v1/chat/messages/{id}/reactions     # Add reaction
DELETE /api/v1/chat/messages/{id}/reactions/{emoji} # Remove reaction
```

## Request Examples

### Create Direct Conversation
```json
POST /api/v1/chat/conversations
{
  "user_id": 2
}
```

### Send Text Message
```json
POST /api/v1/chat/conversations/1/messages
{
  "content": "Hello!",
  "parent_message_id": null
}
```

### Send Media Message
```
POST /api/v1/chat/conversations/1/media
Content-Type: multipart/form-data

file: [binary]
caption: "Check this out!"
```

### Create Group
```json
POST /api/v1/chat/groups
{
  "name": "Study Group",
  "participant_ids": [2, 3, 4]
}
```

### Add Reaction
```json
POST /api/v1/chat/messages/1/reactions
{
  "emoji": "👍"
}
```

### Typing Indicator
```json
POST /api/v1/chat/conversations/1/typing
{
  "is_typing": true
}
```

## WebSocket Events

### Channel: `conversation.{id}`

**message.sent**
```json
{
  "message": {
    "id": 1,
    "content": "Hello!",
    "user": {...},
    "created_at": "2024-01-03T10:00:00Z"
  }
}
```

**user.typing**
```json
{
  "user_id": 2,
  "username": "john",
  "is_typing": true
}
```

**message.reaction.added**
```json
{
  "reaction": {
    "message_id": 1,
    "user_id": 2,
    "emoji": "👍"
  }
}
```

## Models

### Conversation
- `id`, `type` (direct/group), `name`, `created_by`
- Relationships: `participants`, `messages`, `latestMessage`

### Message
- `id`, `conversation_id`, `user_id`, `content`, `type`, `status`
- Soft deletes enabled
- Relationships: `user`, `media`, `reactions`, `parentMessage`

### MessageMedia
- `id`, `message_id`, `file_path`, `file_type`, `file_size`
- Types: image, video, audio

### MessageReaction
- `id`, `message_id`, `user_id`, `emoji`
- Unique constraint on (message_id, user_id, emoji)

## File Size Limits

- Images: 10MB (JPEG, PNG, GIF, WebP)
- Videos: 50MB (MP4, WebM)
- Audio: 20MB (MP3, WAV, OGG)

## Broadcasting Setup

### Development (Log Driver)
```env
BROADCAST_DRIVER=log
```

### Production (Pusher/Soketi)
```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1
```

## Common Queries

### Get unread count
```php
$conversation->getUnreadCount($user);
```

### Check if user is participant
```php
$conversation->isParticipant($user);
```

### Get messages with pagination
```php
$messages = $messageService->getMessages($conversation, 50);
```

## Error Codes

- `400` - Validation error (empty message, invalid file)
- `403` - Unauthorized (not a participant, blocked user)
- `404` - Resource not found
- `422` - Conflict (duplicate participant, group size limit)

## Testing Checklist

- [ ] Create direct conversation
- [ ] Send text message
- [ ] Upload media (image, video, audio)
- [ ] Add/remove reactions
- [ ] Reply to message
- [ ] Delete own message
- [ ] Mark conversation as read
- [ ] Create group chat
- [ ] Add/remove group members
- [ ] Test with blocked users
- [ ] Test typing indicators
- [ ] Test WebSocket events

## Performance Tips

- Use cursor pagination for large message lists
- Enable Redis for broadcasting in production
- Set up queue workers for async events
- Index frequently queried fields
- Use eager loading for relationships

## Security Notes

- All endpoints require Sanctum authentication
- Private WebSocket channels with authorization
- Block relationships enforced
- File uploads validated
- Soft deletes preserve history

