# Phase 3: Chat System - Setup Guide

## Overview

Phase 3 implements a complete real-time chat system with WebSocket support for the Talkin API. This includes direct messaging, group chats, media sharing, reactions, and real-time features like typing indicators.

## Prerequisites

- Phase 1 (Authentication) and Phase 2 (Social Features) must be completed
- PHP 8.2+
- Composer
- MySQL or SQLite database
- Node.js and npm (for Laravel Echo Server or Soketi)

## Database Setup

The migrations have already been run. The following tables were created:

- `conversations` - Stores conversation metadata
- `conversation_participants` - Pivot table for conversation members
- `messages` - Stores all messages with soft deletes
- `message_media` - Stores media file references
- `message_reactions` - Stores emoji reactions

## Broadcasting Setup

### Option 1: Using Log Driver (Development Only)

The default configuration uses the `log` driver which logs broadcast events without actually broadcasting them. This is useful for development and testing the REST API without WebSocket setup.

No additional setup required - this is already configured.

### Option 2: Using Pusher (Production Ready)

1. Sign up for a Pusher account at https://pusher.com
2. Create a new Channels app
3. Update your `.env` file:

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1
```

4. Install Pusher PHP SDK:
```bash
composer require pusher/pusher-php-server
```

### Option 3: Using Soketi (Self-Hosted, Free)

Soketi is a free, open-source Pusher alternative that you can self-host.

1. Install Soketi globally:
```bash
npm install -g @soketi/soketi
```

2. Start Soketi server:
```bash
soketi start
```

3. Update your `.env` file:
```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=app-id
PUSHER_APP_KEY=app-key
PUSHER_APP_SECRET=app-secret
PUSHER_APP_CLUSTER=mt1
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
```

4. Install Pusher PHP SDK:
```bash
composer require pusher/pusher-php-server
```

### Option 4: Using Laravel Echo Server (Legacy)

1. Install Laravel Echo Server:
```bash
npm install -g laravel-echo-server
```

2. Initialize configuration:
```bash
laravel-echo-server init
```

3. Start the server:
```bash
laravel-echo-server start
```

4. Update your `.env` file similar to Soketi configuration above.

## API Endpoints

### Conversation Management

- `GET /api/v1/chat/conversations` - List all conversations
- `POST /api/v1/chat/conversations` - Create direct conversation
  - Body: `{ "user_id": 2 }`
- `GET /api/v1/chat/conversations/{id}` - Get conversation details
- `POST /api/v1/chat/conversations/{id}/typing` - Send typing indicator
  - Body: `{ "is_typing": true }`

### Group Chat Management

- `POST /api/v1/chat/groups` - Create group conversation
  - Body: `{ "name": "Group Name", "participant_ids": [2, 3, 4] }`
- `POST /api/v1/chat/groups/{id}/members` - Add member
  - Body: `{ "user_id": 5 }`
- `DELETE /api/v1/chat/groups/{id}/members/{userId}` - Remove member

### Messaging

- `GET /api/v1/chat/conversations/{id}/messages` - Get messages (paginated)
- `POST /api/v1/chat/conversations/{id}/messages` - Send text message
  - Body: `{ "content": "Hello!", "parent_message_id": null }`
- `POST /api/v1/chat/conversations/{id}/media` - Upload media message
  - Body: `multipart/form-data` with `file` and optional `caption`
- `DELETE /api/v1/chat/messages/{id}` - Delete message
- `POST /api/v1/chat/conversations/{id}/read` - Mark conversation as read

### Reactions

- `POST /api/v1/chat/messages/{id}/reactions` - Add reaction
  - Body: `{ "emoji": "👍" }`
- `DELETE /api/v1/chat/messages/{id}/reactions/{emoji}` - Remove reaction

## WebSocket Events

When using a real broadcasting driver (Pusher, Soketi, etc.), the following events are broadcast:

### Private Channel: `conversation.{conversationId}`

- `message.sent` - New message sent
- `message.deleted` - Message deleted
- `message.status.updated` - Message status changed
- `message.reaction.added` - Reaction added
- `message.reaction.removed` - Reaction removed
- `user.typing` - User typing indicator

## Client Integration

### Laravel Echo (JavaScript)

1. Install Laravel Echo and Pusher JS:
```bash
npm install --save laravel-echo pusher-js
```

2. Initialize Echo:
```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.PUSHER_APP_KEY,
    cluster: process.env.PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: '/api/v1/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${yourAuthToken}`
        }
    }
});
```

3. Listen to conversation events:
```javascript
Echo.private(`conversation.${conversationId}`)
    .listen('.message.sent', (e) => {
        console.log('New message:', e.message);
    })
    .listen('.user.typing', (e) => {
        console.log(`${e.username} is typing:`, e.is_typing);
    });
```

## Testing

### Using Postman

1. Import the Postman collection: `Talkin_API_Phase3.postman_collection.json`
2. Set up environment variables:
   - `base_url`: http://localhost:8000/api/v1
   - `token`: Your authentication token from Phase 1

### Manual Testing

1. Create two user accounts (Phase 1)
2. Login with both users to get auth tokens
3. Create a direct conversation between them
4. Send messages back and forth
5. Test reactions, replies, and media uploads
6. Create a group conversation with multiple users

## File Storage

Media files are stored in `storage/app/public/chat/media/`:
- `images/` - Image files
- `videos/` - Video files
- `audios/` - Audio files

Make sure the storage link is created:
```bash
php artisan storage:link
```

## Troubleshooting

### Messages not broadcasting

1. Check `BROADCAST_DRIVER` in `.env`
2. Verify broadcasting server is running (Soketi/Echo Server)
3. Check Laravel logs: `storage/logs/laravel.log`
4. Test with `php artisan tinker`:
```php
broadcast(new \App\Events\MessageSent($message));
```

### File upload errors

1. Check file permissions on `storage/app/public`
2. Verify `php.ini` upload limits:
   - `upload_max_filesize`
   - `post_max_size`
3. Check storage disk configuration in `config/filesystems.php`

### Authentication errors

1. Ensure Sanctum token is included in headers:
   - `Authorization: Bearer {token}`
2. Check token hasn't expired
3. Verify user is authenticated: `GET /api/v1/users/me`

## Performance Considerations

- Messages use cursor-based pagination for efficient loading
- Conversations are ordered by last activity
- Database indexes are in place for common queries
- Consider using Redis for broadcasting in production
- Use queue workers for processing broadcasts asynchronously

## Security Notes

- All endpoints require authentication via Sanctum
- WebSocket channels use private channels with authorization
- Block relationships are enforced at the service level
- File uploads are validated for type and size
- Soft deletes preserve message history while hiding content

## Next Steps

- Set up queue workers for async broadcasting
- Configure Redis for better performance
- Set up monitoring for WebSocket connections
- Implement rate limiting for message sending
- Add message search functionality (future phase)

