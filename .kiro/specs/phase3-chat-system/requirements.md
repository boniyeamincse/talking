# Requirements Document: Phase 3 - Chat System

## Introduction

The Chat System enables real-time communication between users of the Talkin social language learning platform. This system provides 1-to-1 direct messaging, group chat functionality, media sharing, and real-time message delivery with WebSocket support. The chat system integrates with existing authentication (Laravel Sanctum) and social features (follow/block relationships) from Phase 1 and Phase 2.

## Glossary

- **Chat_System**: The complete real-time messaging subsystem including conversations, messages, and WebSocket broadcasting
- **Conversation**: A communication channel between two or more users (direct or group)
- **Direct_Conversation**: A 1-to-1 conversation between exactly two users
- **Group_Conversation**: A conversation with three or more participants
- **Message**: A single communication unit within a conversation (text, media, or both)
- **Participant**: A user who is a member of a conversation
- **Message_Status**: The delivery state of a message (sent, delivered, seen)
- **Media_Message**: A message containing uploaded media files (images, videos, audio)
- **Typing_Indicator**: A real-time signal showing when a user is actively typing
- **Read_Receipt**: A confirmation that a user has seen messages in a conversation
- **WebSocket_Channel**: A real-time communication channel for broadcasting events
- **Blocked_Relationship**: An existing social feature where one user has blocked another, preventing all interactions

## Requirements

### Requirement 1: Direct Conversation Management

**User Story:** As a user, I want to create and manage direct conversations with other users, so that I can have private 1-to-1 communication.

#### Acceptance Criteria

1. WHEN a user creates a direct conversation with another user, THE Chat_System SHALL create a new Direct_Conversation with exactly two participants
2. WHEN a user attempts to create a direct conversation with a user they have blocked or who has blocked them, THE Chat_System SHALL reject the request
3. WHEN a user attempts to create a duplicate direct conversation with the same user, THE Chat_System SHALL return the existing conversation
4. WHEN a user requests their conversation list, THE Chat_System SHALL return all conversations ordered by most recent activity
5. WHEN a user requests conversation details, THE Chat_System SHALL include participant information and the most recent message

### Requirement 2: Group Conversation Management

**User Story:** As a user, I want to create and manage group conversations, so that I can communicate with multiple people simultaneously.

#### Acceptance Criteria

1. WHEN a user creates a group conversation, THE Chat_System SHALL create a new Group_Conversation with the creator as the first participant
2. WHEN a user adds a member to a group conversation, THE Chat_System SHALL add the new participant if they are not blocked
3. WHEN a user removes a member from a group conversation, THE Chat_System SHALL remove that participant and prevent them from accessing future messages
4. WHEN a user who is not a participant attempts to access a group conversation, THE Chat_System SHALL reject the request
5. THE Group_Conversation SHALL support a minimum of 3 participants and a maximum of 50 participants

### Requirement 3: Text Message Sending and Retrieval

**User Story:** As a user, I want to send and receive text messages in conversations, so that I can communicate with other users.

#### Acceptance Criteria

1. WHEN a participant sends a text message to a conversation, THE Chat_System SHALL create a new Message with status "sent"
2. WHEN a user who is not a participant attempts to send a message, THE Chat_System SHALL reject the request
3. WHEN a user requests messages from a conversation, THE Chat_System SHALL return messages in chronological order with pagination support
4. WHEN a user sends an empty message, THE Chat_System SHALL reject the request
5. THE Chat_System SHALL store the sender, timestamp, and content for each message

### Requirement 4: Media Message Handling

**User Story:** As a user, I want to share media files in conversations, so that I can communicate with images, videos, and audio.

#### Acceptance Criteria

1. WHEN a participant uploads a media file, THE Chat_System SHALL validate the file type and size before storage
2. WHEN a valid media file is uploaded, THE Chat_System SHALL store the file and create a Media_Message with a reference to the stored file
3. THE Chat_System SHALL support image files (JPEG, PNG, GIF, WebP) up to 10MB
4. THE Chat_System SHALL support video files (MP4, WebM) up to 50MB
5. THE Chat_System SHALL support audio files (MP3, WAV, OGG) up to 20MB
6. WHEN an invalid file type or oversized file is uploaded, THE Chat_System SHALL reject the upload with a descriptive error

### Requirement 5: Message Deletion

**User Story:** As a user, I want to delete my messages, so that I can remove content I no longer want visible.

#### Acceptance Criteria

1. WHEN a user deletes their own message, THE Chat_System SHALL mark the message as deleted and hide its content
2. WHEN a user attempts to delete another user's message, THE Chat_System SHALL reject the request
3. WHEN a deleted message is retrieved, THE Chat_System SHALL indicate it has been deleted without showing the original content
4. THE Chat_System SHALL preserve message metadata (timestamp, sender) for deleted messages to maintain conversation continuity

### Requirement 6: Message Status Tracking

**User Story:** As a user, I want to see message delivery status, so that I know if my messages have been delivered and seen.

#### Acceptance Criteria

1. WHEN a message is created, THE Chat_System SHALL set its status to "sent"
2. WHEN all participants have received a message via WebSocket, THE Chat_System SHALL update the status to "delivered"
3. WHEN a participant marks a conversation as read, THE Chat_System SHALL update all unread messages to status "seen"
4. WHEN a user requests messages, THE Chat_System SHALL include the current status for each message

### Requirement 7: Read Receipts

**User Story:** As a user, I want to mark conversations as read, so that other participants know I have seen their messages.

#### Acceptance Criteria

1. WHEN a user marks a conversation as read, THE Chat_System SHALL update all unread messages in that conversation to "seen" status
2. WHEN a user marks a conversation as read, THE Chat_System SHALL record the timestamp of the last read message
3. WHEN a user requests conversation details, THE Chat_System SHALL include the count of unread messages
4. THE Chat_System SHALL calculate unread count based on messages received after the user's last read timestamp

### Requirement 8: Reply-to Functionality

**User Story:** As a user, I want to reply to specific messages, so that I can maintain context in conversations.

#### Acceptance Criteria

1. WHEN a user sends a message with a reply-to reference, THE Chat_System SHALL validate that the referenced message exists in the same conversation
2. WHEN a valid reply is sent, THE Chat_System SHALL store the reference to the parent message
3. WHEN messages are retrieved, THE Chat_System SHALL include the parent message details for replies
4. WHEN a user replies to a deleted message, THE Chat_System SHALL allow the reply but indicate the parent is deleted

### Requirement 9: Emoji Reactions

**User Story:** As a user, I want to add emoji reactions to messages, so that I can express quick responses without sending new messages.

#### Acceptance Criteria

1. WHEN a participant adds an emoji reaction to a message, THE Chat_System SHALL store the reaction with the user and emoji identifier
2. WHEN a user adds a duplicate reaction to the same message, THE Chat_System SHALL replace the existing reaction
3. WHEN a user removes a reaction, THE Chat_System SHALL delete that reaction record
4. WHEN messages are retrieved, THE Chat_System SHALL include all reactions grouped by emoji with user counts
5. WHEN a non-participant attempts to react to a message, THE Chat_System SHALL reject the request

### Requirement 10: Real-time Message Broadcasting

**User Story:** As a user, I want to receive messages instantly, so that I can have real-time conversations.

#### Acceptance Criteria

1. WHEN a message is sent to a conversation, THE Chat_System SHALL broadcast the message to all participants via WebSocket
2. WHEN a user is not connected via WebSocket, THE Chat_System SHALL queue the message for delivery when they reconnect
3. THE Chat_System SHALL use private WebSocket channels for each conversation to ensure message privacy
4. WHEN a user connects to a WebSocket channel, THE Chat_System SHALL verify they are a participant in that conversation
5. THE Chat_System SHALL broadcast message events including new messages, deletions, reactions, and status updates

### Requirement 11: Typing Indicators

**User Story:** As a user, I want to see when other participants are typing, so that I know when to expect a response.

#### Acceptance Criteria

1. WHEN a user starts typing in a conversation, THE Chat_System SHALL broadcast a typing indicator to other participants
2. WHEN a user stops typing or sends a message, THE Chat_System SHALL broadcast a stop-typing indicator
3. THE Chat_System SHALL automatically expire typing indicators after 5 seconds of inactivity
4. WHEN multiple users are typing simultaneously, THE Chat_System SHALL display all active typing indicators

### Requirement 12: Online Status

**User Story:** As a user, I want to see when other users are online, so that I know if they are available for real-time chat.

#### Acceptance Criteria

1. WHEN a user connects via WebSocket, THE Chat_System SHALL mark them as online
2. WHEN a user disconnects or closes their connection, THE Chat_System SHALL mark them as offline
3. WHEN a user requests conversation details, THE Chat_System SHALL include the online status of all participants
4. THE Chat_System SHALL update the user's last_seen_at timestamp when they go offline

### Requirement 13: Message Delivery Receipts

**User Story:** As a user, I want to receive confirmation when my messages are delivered, so that I know the system is working correctly.

#### Acceptance Criteria

1. WHEN a participant receives a message via WebSocket, THE Chat_System SHALL send a delivery receipt to the sender
2. WHEN a delivery receipt is received, THE Chat_System SHALL update the message status accordingly
3. THE Chat_System SHALL aggregate delivery receipts from all participants before updating status to "delivered"
4. WHEN a user is offline, THE Chat_System SHALL send delivery receipts when they next connect and retrieve messages

### Requirement 14: Block Relationship Integration

**User Story:** As a user, I want blocked users to be unable to message me, so that I can maintain my boundaries.

#### Acceptance Criteria

1. WHEN a user blocks another user, THE Chat_System SHALL prevent both users from sending messages to each other in existing conversations
2. WHEN a user blocks another user, THE Chat_System SHALL prevent creation of new direct conversations between them
3. WHEN a blocked user attempts to send a message, THE Chat_System SHALL reject the request without revealing the block status
4. WHEN a user unblocks another user, THE Chat_System SHALL restore messaging capabilities in existing conversations

### Requirement 15: Conversation Pagination and Performance

**User Story:** As a user, I want to load messages efficiently, so that I can access chat history without performance issues.

#### Acceptance Criteria

1. WHEN a user requests messages, THE Chat_System SHALL return paginated results with a default page size of 50 messages
2. WHEN a user requests older messages, THE Chat_System SHALL support cursor-based pagination for efficient loading
3. THE Chat_System SHALL order messages chronologically with newest messages first in the API response
4. WHEN a conversation has more than 1000 messages, THE Chat_System SHALL maintain response times under 500ms for message retrieval

### Requirement 16: Conversation Metadata

**User Story:** As a user, I want to see conversation metadata, so that I can understand conversation context at a glance.

#### Acceptance Criteria

1. WHEN a user requests their conversation list, THE Chat_System SHALL include the last message preview for each conversation
2. WHEN a user requests their conversation list, THE Chat_System SHALL include the unread message count for each conversation
3. WHEN a user requests their conversation list, THE Chat_System SHALL include the timestamp of the last activity
4. THE Chat_System SHALL update conversation metadata immediately when new messages are sent or read

### Requirement 17: Authentication and Authorization

**User Story:** As a system, I want to enforce authentication and authorization, so that only authorized users can access conversations and messages.

#### Acceptance Criteria

1. THE Chat_System SHALL require valid Sanctum authentication tokens for all API endpoints
2. WHEN a user requests a conversation, THE Chat_System SHALL verify they are a participant before returning data
3. WHEN a user attempts to access another user's private conversation, THE Chat_System SHALL reject the request
4. THE Chat_System SHALL validate WebSocket connections using the same authentication mechanism as REST API endpoints

### Requirement 18: Error Handling and Data Integrity

**User Story:** As a developer, I want robust error handling, so that the system gracefully handles failures and maintains data integrity.

#### Acceptance Criteria

1. WHEN a database operation fails, THE Chat_System SHALL rollback transactions and return appropriate error messages
2. WHEN a WebSocket connection fails, THE Chat_System SHALL allow users to continue using REST API endpoints
3. WHEN invalid data is provided, THE Chat_System SHALL return validation errors with specific field-level feedback
4. THE Chat_System SHALL maintain referential integrity between conversations, messages, and participants using foreign key constraints
5. WHEN a user is deleted, THE Chat_System SHALL preserve message history but anonymize the deleted user's messages
