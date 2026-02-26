# Design Document: Phase 3 - Chat System

## Overview

The Chat System implements real-time messaging functionality for the Talkin platform using Laravel's broadcasting capabilities with Laravel Echo Server for WebSocket support. The system provides RESTful API endpoints for conversation and message management, complemented by WebSocket channels for real-time event delivery.

The architecture follows Laravel's event broadcasting pattern, where API actions trigger events that are broadcast to WebSocket channels. This allows clients to receive instant updates while maintaining the ability to fall back to REST API polling if WebSocket connections fail.

Key design decisions:
- Use Laravel Broadcasting with Pusher driver (or compatible like Soketi/Laravel Echo Server)
- Implement private channels for conversation-level security
- Store all messages persistently in SQLite database
- Use polymorphic relationships for flexible message types
- Integrate with existing block relationships to prevent unwanted communication

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
│  ┌──────────────┐              ┌──────────────────────┐    │
│  │  REST Client │              │  WebSocket Client    │    │
│  │  (HTTP/JSON) │              │  (Laravel Echo)      │    │
│  └──────┬───────┘              └──────────┬───────────┘    │
└─────────┼──────────────────────────────────┼───────────────┘
          │                                   │
          │ HTTP                              │ WebSocket
          │                                   │
┌─────────┼───────────────────────────────────┼───────────────┐
│         ▼                                   ▼               │
│  ┌─────────────┐                    ┌─────────────┐        │
│  │   Routes    │                    │ Broadcasting │        │
│  │  (API)      │                    │   Server     │        │
│  └──────┬──────┘                    └──────┬───────┘        │
│         │                                   │                │
│         ▼                                   │                │
│  ┌─────────────┐      Events               │                │
│  │ Controllers │──────────────────────────►│                │
│  └──────┬──────┘                           │                │
│         │                                   │                │
│         ▼                                   │                │
│  ┌─────────────┐                           │                │
│  │  Services   │                           │                │
│  └──────┬──────┘                           │                │
│         │                                   │                │
│         ▼                                   │                │
│  ┌─────────────┐                           │                │
│  │   Models    │                           │                │
│  │  (Eloquent) │                           │                │
│  └──────┬──────┘                           │                │
│         │                                   │                │
│         ▼                                   │                │
│  ┌─────────────┐                           │                │
│  │  Database   │                           │                │
│  │  (SQLite)   │                           │                │
│  └─────────────┘                           │                │
│                                             │                │
│                Laravel Application          │                │
└─────────────────────────────────────────────┼────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  WebSocket       │
                                    │  Clients         │
                                    └──────────────────┘
```

### Layer Responsibilities

**Controllers**: Handle HTTP requests, validate input, coordinate service calls, return JSON responses
**Services**: Implement business logic, manage transactions, trigger events
**Models**: Define data structure, relationships, and basic queries
**Events**: Represent domain events that trigger WebSocket broadcasts
**Broadcasting**: Deliver real-time updates to connected clients via WebSocket channels

## Components and Interfaces

### Database Schema

**conversations table**:
```sql
id: bigint (primary key)
type: enum('direct', 'group')
name: string (nullable, for group chats)
created_by: bigint (foreign key to users, nullable)
created_at: timestamp
updated_at: timestamp
```

**conversation_participants table**:
```sql
id: bigint (primary key)
conversation_id: bigint (foreign key to conversations)
user_id: bigint (foreign key to users)
joined_at: timestamp
last_read_at: timestamp (nullable)
created_at: timestamp
updated_at: timestamp

unique(conversation_id, user_id)
```

**messages table**:
```sql
id: bigint (primary key)
conversation_id: bigint (foreign key to conversations)
user_id: bigint (foreign key to users)
parent_message_id: bigint (foreign key to messages, nullable, for replies)
content: text (nullable)
type: enum('text', 'media')
status: enum('sent', 'delivered', 'seen')
deleted_at: timestamp (nullable, soft delete)
created_at: timestamp
updated_at: timestamp
```

**message_media table**:
```sql
id: bigint (primary key)
message_id: bigint (foreign key to messages)
file_path: string
file_type: enum('image', 'video', 'audio')
file_size: integer (bytes)
mime_type: string
created_at: timestamp
updated_at: timestamp
```

**message_reactions table**:
```sql
id: bigint (primary key)
message_id: bigint (foreign key to messages)
user_id: bigint (foreign key to users)
emoji: string (emoji character or code)
created_at: timestamp
updated_at: timestamp

unique(message_id, user_id, emoji)
```

### API Endpoints

**Conversation Management**:
- `GET /api/chat/conversations` - List user's conversations
- `POST /api/chat/conversations` - Create direct conversation
- `GET /api/chat/conversations/{id}` - Get conversation details
- `POST /api/chat/groups` - Create group conversation
- `POST /api/chat/groups/{id}/members` - Add group member
- `DELETE /api/chat/groups/{id}/members/{userId}` - Remove group member

**Messaging**:
- `GET /api/chat/conversations/{id}/messages` - Get messages (paginated)
- `POST /api/chat/conversations/{id}/messages` - Send text message
- `POST /api/chat/conversations/{id}/media` - Upload media message
- `DELETE /api/chat/messages/{id}` - Delete message
- `POST /api/chat/messages/{id}/reactions` - Add reaction
- `DELETE /api/chat/messages/{id}/reactions/{emoji}` - Remove reaction
- `POST /api/chat/conversations/{id}/read` - Mark conversation as read

**Real-time Events**:
- `POST /api/chat/conversations/{id}/typing` - Send typing indicator

### Models

**Conversation Model**:
```php
class Conversation extends Model
{
    // Relationships
    public function participants(): BelongsToMany
    public function messages(): HasMany
    public function latestMessage(): HasOne
    
    // Scopes
    public function scopeForUser(Builder $query, User $user): Builder
    public function scopeDirect(Builder $query): Builder
    public function scopeGroup(Builder $query): Builder
    
    // Methods
    public function isParticipant(User $user): bool
    public function addParticipant(User $user): void
    public function removeParticipant(User $user): void
    public function getUnreadCount(User $user): int
}
```

**Message Model**:
```php
class Message extends Model
{
    use SoftDeletes;
    
    // Relationships
    public function conversation(): BelongsTo
    public function user(): BelongsTo
    public function media(): HasMany
    public function reactions(): HasMany
    public function parentMessage(): BelongsTo
    public function replies(): HasMany
    
    // Scopes
    public function scopeNotDeleted(Builder $query): Builder
    
    // Methods
    public function isOwnedBy(User $user): bool
    public function markAsDelivered(): void
    public function markAsSeen(): void
}
```

**MessageMedia Model**:
```php
class MessageMedia extends Model
{
    // Relationships
    public function message(): BelongsTo
    
    // Methods
    public function getUrl(): string
}
```

**MessageReaction Model**:
```php
class MessageReaction extends Model
{
    // Relationships
    public function message(): BelongsTo
    public function user(): BelongsTo
}
```

### Services

**ConversationService**:
```php
class ConversationService
{
    public function createDirectConversation(User $user1, User $user2): Conversation
    public function createGroupConversation(User $creator, string $name, array $participantIds): Conversation
    public function addGroupMember(Conversation $conversation, User $user): void
    public function removeGroupMember(Conversation $conversation, User $user): void
    public function getConversationsForUser(User $user, int $perPage): LengthAwarePaginator
    public function findOrCreateDirectConversation(User $user1, User $user2): Conversation
}
```

**MessageService**:
```php
class MessageService
{
    public function sendMessage(Conversation $conversation, User $sender, string $content, ?int $parentMessageId): Message
    public function sendMediaMessage(Conversation $conversation, User $sender, UploadedFile $file, ?string $caption): Message
    public function deleteMessage(Message $message): void
    public function addReaction(Message $message, User $user, string $emoji): MessageReaction
    public function removeReaction(Message $message, User $user, string $emoji): void
    public function markConversationAsRead(Conversation $conversation, User $user): int
    public function getMessages(Conversation $conversation, int $perPage, ?string $cursor): CursorPaginator
}
```

**MediaService**:
```php
class MediaService
{
    public function validateMediaFile(UploadedFile $file): array
    public function storeMediaFile(UploadedFile $file, string $type): string
    public function deleteMediaFile(string $path): void
    public function getMediaType(string $mimeType): string
}
```

### Events and Broadcasting

**Events**:
```php
class MessageSent implements ShouldBroadcast
{
    public function __construct(public Message $message) {}
    public function broadcastOn(): array // Returns PrivateChannel
}

class MessageDeleted implements ShouldBroadcast
{
    public function __construct(public int $messageId, public int $conversationId) {}
    public function broadcastOn(): array
}

class MessageReactionAdded implements ShouldBroadcast
{
    public function __construct(public MessageReaction $reaction) {}
    public function broadcastOn(): array
}

class MessageReactionRemoved implements ShouldBroadcast
{
    public function __construct(public int $messageId, public int $userId, public string $emoji) {}
    public function broadcastOn(): array
}

class UserTyping implements ShouldBroadcast
{
    public function __construct(public int $conversationId, public User $user, public bool $isTyping) {}
    public function broadcastOn(): array
}

class MessageStatusUpdated implements ShouldBroadcast
{
    public function __construct(public int $messageId, public string $status) {}
    public function broadcastOn(): array
}
```

**Channel Authorization**:
```php
// In routes/channels.php
Broadcast::channel('conversation.{conversationId}', function (User $user, int $conversationId) {
    $conversation = Conversation::find($conversationId);
    return $conversation && $conversation->isParticipant($user);
});
```

### Middleware

**CheckConversationParticipant**:
```php
class CheckConversationParticipant
{
    public function handle(Request $request, Closure $next): Response
    {
        $conversationId = $request->route('id') ?? $request->route('conversation');
        $conversation = Conversation::find($conversationId);
        
        if (!$conversation || !$conversation->isParticipant($request->user())) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        return $next($request);
    }
}
```

## Data Models

### Conversation Model Structure

```php
Conversation {
    id: int
    type: 'direct' | 'group'
    name: string | null
    created_by: int | null
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    participants: User[]
    messages: Message[]
    latestMessage: Message | null
    
    // Computed
    unreadCount(user): int
    lastActivity: timestamp
}
```

### Message Model Structure

```php
Message {
    id: int
    conversation_id: int
    user_id: int
    parent_message_id: int | null
    content: string | null
    type: 'text' | 'media'
    status: 'sent' | 'delivered' | 'seen'
    deleted_at: timestamp | null
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    conversation: Conversation
    user: User
    media: MessageMedia[]
    reactions: MessageReaction[]
    parentMessage: Message | null
    replies: Message[]
    
    // Computed
    isDeleted: bool
    reactionsSummary: array
}
```

### Participant Model Structure

```php
ConversationParticipant {
    id: int
    conversation_id: int
    user_id: int
    joined_at: timestamp
    last_read_at: timestamp | null
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    conversation: Conversation
    user: User
}
```

### Media Model Structure

```php
MessageMedia {
    id: int
    message_id: int
    file_path: string
    file_type: 'image' | 'video' | 'audio'
    file_size: int
    mime_type: string
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    message: Message
    
    // Computed
    url: string
}
```

### Reaction Model Structure

```php
MessageReaction {
    id: int
    message_id: int
    user_id: int
    emoji: string
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    message: Message
    user: User
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Direct conversations have exactly two participants

*For any* direct conversation creation request with two valid users, the resulting conversation should have exactly two participants.

**Validates: Requirements 1.1**

### Property 2: Block relationships prevent conversation creation

*For any* pair of users where one has blocked the other, attempting to create a direct conversation should be rejected.

**Validates: Requirements 1.2, 14.2**

### Property 3: Duplicate direct conversation creation is idempotent

*For any* pair of users, creating a direct conversation twice should return the same conversation instance without creating duplicates.

**Validates: Requirements 1.3**

### Property 4: Conversations ordered by recent activity

*For any* user's conversation list, conversations should be ordered with the most recently active conversation first.

**Validates: Requirements 1.4**

### Property 5: Conversation details include required data

*For any* conversation, the details response should include all participant information and the most recent message.

**Validates: Requirements 1.5**

### Property 6: Group creator is always a participant

*For any* group conversation creation, the creator should be included in the participant list.

**Validates: Requirements 2.1**

### Property 7: Block relationships prevent group member addition

*For any* group conversation and user pair where blocking exists, attempting to add the blocked user should be rejected.

**Validates: Requirements 2.2**

### Property 8: Removed participants cannot access messages

*For any* group conversation, after removing a participant, that user should not be able to retrieve messages or send new messages.

**Validates: Requirements 2.3**

### Property 9: Non-participants cannot access conversations

*For any* conversation and user who is not a participant, all access attempts should be rejected.

**Validates: Requirements 2.4, 17.2, 17.3**

### Property 10: New messages have "sent" status

*For any* text message sent to a conversation, the created message should have status "sent".

**Validates: Requirements 3.1, 6.1**

### Property 11: Non-participants cannot send messages

*For any* conversation and user who is not a participant, message sending attempts should be rejected.

**Validates: Requirements 3.2**

### Property 12: Messages returned in chronological order

*For any* conversation with multiple messages, retrieving messages should return them ordered chronologically.

**Validates: Requirements 3.3, 15.3**

### Property 13: Empty messages are rejected

*For any* string composed entirely of whitespace or empty content, attempting to send it as a message should be rejected.

**Validates: Requirements 3.4**

### Property 14: Messages persist with required fields

*For any* message created, retrieving it should return the sender, timestamp, and content fields.

**Validates: Requirements 3.5**

### Property 15: Media file validation before storage

*For any* uploaded file, the system should validate type and size before storing, rejecting invalid files.

**Validates: Requirements 4.1, 4.6**

### Property 16: Valid media creates message with file reference

*For any* valid media file upload, the system should store the file and create a message with a reference to the stored file path.

**Validates: Requirements 4.2**

### Property 17: Message deletion hides content

*For any* message deleted by its owner, retrieving the message should show it as deleted without exposing the original content.

**Validates: Requirements 5.1, 5.3**

### Property 18: Only message owners can delete

*For any* message and user who is not the message owner, deletion attempts should be rejected.

**Validates: Requirements 5.2**

### Property 19: Deleted messages preserve metadata

*For any* deleted message, the timestamp and sender information should remain accessible.

**Validates: Requirements 5.4**

### Property 20: Marking conversation as read updates message status

*For any* conversation with unread messages, marking it as read should update all unread messages to "seen" status.

**Validates: Requirements 6.3, 7.1**

### Property 21: Message responses include status

*For any* message retrieval, the response should include the current message status.

**Validates: Requirements 6.4**

### Property 22: Read timestamp is recorded

*For any* conversation marked as read, the participant's last_read_at timestamp should be updated to the current time.

**Validates: Requirements 7.2**

### Property 23: Unread count calculation accuracy

*For any* conversation and participant, the unread count should equal the number of messages created after the participant's last_read_at timestamp.

**Validates: Requirements 7.3, 7.4**

### Property 24: Reply validation requires same conversation

*For any* reply message, the parent message must exist in the same conversation, otherwise the reply should be rejected.

**Validates: Requirements 8.1**

### Property 25: Reply stores parent reference

*For any* valid reply message, the parent_message_id field should be stored and retrievable.

**Validates: Requirements 8.2**

### Property 26: Reply responses include parent details

*For any* reply message retrieved, the response should include the parent message details.

**Validates: Requirements 8.3**

### Property 27: Reactions are stored with user and emoji

*For any* reaction added to a message, the system should store the message_id, user_id, and emoji.

**Validates: Requirements 9.1**

### Property 28: Duplicate reactions are idempotent

*For any* user adding the same emoji reaction to a message multiple times, only one reaction should exist.

**Validates: Requirements 9.2**

### Property 29: Reaction removal deletes record

*For any* reaction, removing it should delete the reaction record from the database.

**Validates: Requirements 9.3**

### Property 30: Reactions grouped in message responses

*For any* message with reactions, the response should include reactions grouped by emoji with counts.

**Validates: Requirements 9.4**

### Property 31: Non-participants cannot react

*For any* message and user who is not a conversation participant, reaction attempts should be rejected.

**Validates: Requirements 9.5**

### Property 32: WebSocket channel authorization

*For any* WebSocket channel connection attempt, the user should only be authorized if they are a participant in that conversation.

**Validates: Requirements 10.4**

### Property 33: Conversation metadata includes last message

*For any* conversation in a user's conversation list, the response should include a preview of the last message.

**Validates: Requirements 16.1**

### Property 34: Conversation metadata includes unread count

*For any* conversation in a user's conversation list, the response should include the unread message count for that user.

**Validates: Requirements 16.2**

### Property 35: Conversation metadata includes last activity timestamp

*For any* conversation in a user's conversation list, the response should include the timestamp of the last activity.

**Validates: Requirements 16.3**

### Property 36: Metadata updates after message operations

*For any* conversation, sending a new message or marking as read should immediately update the conversation's metadata.

**Validates: Requirements 16.4**

### Property 37: Failed operations rollback transactions

*For any* database operation that fails, no partial data should be committed to the database.

**Validates: Requirements 18.1**

### Property 38: Validation errors include field details

*For any* invalid request, the error response should include specific field-level validation messages.

**Validates: Requirements 18.3**

### Property 39: User deletion preserves message history

*For any* user who is deleted, their messages should remain in conversations but with anonymized user information.

**Validates: Requirements 18.5**

### Property 40: Blocked users cannot send messages

*For any* existing conversation between users where one blocks the other, the blocked user should not be able to send messages.

**Validates: Requirements 14.1**

### Property 41: Unblocking restores messaging

*For any* conversation between users, blocking then unblocking should restore the ability to send messages (round-trip property).

**Validates: Requirements 14.4**

### Property 42: Cursor pagination maintains consistency

*For any* conversation with messages, paginating through all messages using cursors should return each message exactly once.

**Validates: Requirements 15.2**

## Error Handling

### Error Categories

**Validation Errors (400)**:
- Empty message content
- Invalid file types or sizes
- Missing required fields
- Invalid conversation type

**Authentication Errors (401)**:
- Missing or invalid Sanctum token
- Expired authentication token

**Authorization Errors (403)**:
- Non-participant accessing conversation
- Blocked user attempting to message
- User attempting to delete another user's message
- Non-participant attempting to add reactions

**Not Found Errors (404)**:
- Conversation does not exist
- Message does not exist
- User does not exist

**Conflict Errors (422)**:
- Attempting to add duplicate participant
- Attempting to create conversation with self
- Group size constraints violated

**Server Errors (500)**:
- Database transaction failures
- File storage failures
- Broadcasting service unavailable

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

All multi-step operations (conversation creation, member management, message sending with media) must use database transactions with proper rollback on failure.

## Testing Strategy

### Dual Testing Approach

The Chat System requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Validate specific examples, edge cases, and error conditions
- Specific conversation creation scenarios
- Media file upload edge cases (boundary sizes, specific file types)
- Error handling for blocked users
- Integration between components

**Property Tests**: Verify universal properties across all inputs
- Conversation creation and participant management
- Message ordering and pagination
- Authorization rules across all conversations
- Data integrity and transaction rollback

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library**: Use Pest with Pest Property Testing plugin for Laravel
**Configuration**: Each property test must run minimum 100 iterations
**Tagging**: Each test must reference its design property using the format:
```php
// Feature: phase3-chat-system, Property 1: Direct conversations have exactly two participants
```

**Test Organization**:
- Group tests by feature area (conversations, messages, reactions, etc.)
- Each correctness property maps to exactly one property-based test
- Place property tests close to implementation to catch errors early
- Use Laravel's database transactions for test isolation

### Integration Testing

**WebSocket Integration**:
- Test channel authorization callbacks
- Verify event broadcasting triggers correctly
- Test fallback to REST API when WebSocket unavailable

**Block Relationship Integration**:
- Test conversation creation with blocked users
- Test message sending with blocked users
- Test group member addition with blocked users

**Media Storage Integration**:
- Test file upload and storage
- Test file retrieval and URL generation
- Test file deletion when messages are deleted

### Test Data Generation

For property-based tests, generate:
- Random users with various relationships (following, blocked, none)
- Random conversations (direct and group) with varying participant counts
- Random messages with different types and content
- Random media files with varying sizes and types
- Random reaction combinations

### Coverage Goals

- 100% of correctness properties implemented as property tests
- Edge cases covered by unit tests
- All error conditions tested
- Integration points between chat and existing features validated
