# Implementation Plan: Phase 3 - Chat System

## Overview

This implementation plan breaks down the Chat System into discrete coding tasks. The approach follows Laravel best practices with database migrations first, then models, services, controllers, and finally real-time broadcasting integration. Testing tasks are included as optional sub-tasks to validate correctness properties.

## Tasks

- [x] 1. Create database schema and migrations
  - [x] 1.1 Create conversations table migration
    - Define conversations table with type, name, created_by fields
    - Add indexes for performance
    - _Requirements: 1.1, 2.1_
  
  - [x] 1.2 Create conversation_participants table migration
    - Define pivot table with conversation_id, user_id, joined_at, last_read_at
    - Add unique constraint on (conversation_id, user_id)
    - Add foreign key constraints with cascade delete
    - _Requirements: 1.1, 2.1, 7.2_
  
  - [x] 1.3 Create messages table migration
    - Define messages table with conversation_id, user_id, parent_message_id, content, type, status
    - Add soft deletes (deleted_at)
    - Add indexes on conversation_id and created_at for pagination
    - Add foreign key constraints
    - _Requirements: 3.1, 3.5, 5.1, 6.1, 8.2_
  
  - [x] 1.4 Create message_media table migration
    - Define message_media table with message_id, file_path, file_type, file_size, mime_type
    - Add foreign key constraint to messages with cascade delete
    - _Requirements: 4.2_
  
  - [x] 1.5 Create message_reactions table migration
    - Define message_reactions table with message_id, user_id, emoji
    - Add unique constraint on (message_id, user_id, emoji)
    - Add foreign key constraints with cascade delete
    - _Requirements: 9.1_

- [x] 2. Implement core models and relationships
  - [x] 2.1 Create Conversation model
    - Define fillable fields and casts
    - Add participants() belongsToMany relationship
    - Add messages() hasMany relationship
    - Add latestMessage() hasOne relationship
    - Implement isParticipant(User $user) method
    - Implement scopeForUser() and scopeDirect() and scopeGroup() scopes
    - _Requirements: 1.1, 1.4, 2.1_
  
  - [x] 2.2 Create Message model
    - Define fillable fields and casts
    - Add SoftDeletes trait
    - Add conversation() belongsTo relationship
    - Add user() belongsTo relationship
    - Add media() hasMany relationship
    - Add reactions() hasMany relationship
    - Add parentMessage() and replies() relationships
    - Implement isOwnedBy(User $user) method
    - _Requirements: 3.1, 3.5, 5.1, 8.2_
  
  - [x] 2.3 Create MessageMedia model
    - Define fillable fields
    - Add message() belongsTo relationship
    - Implement getUrl() accessor for file URLs
    - _Requirements: 4.2_
  
  - [x] 2.4 Create MessageReaction model
    - Define fillable fields
    - Add message() and user() belongsTo relationships
    - _Requirements: 9.1_
  
  - [ ]* 2.5 Write property test for conversation participant validation
    - **Property 9: Non-participants cannot access conversations**
    - **Validates: Requirements 2.4, 17.2, 17.3**

- [x] 3. Implement MediaService for file handling
  - [x] 3.1 Create MediaService class
    - Implement validateMediaFile() to check file type and size
    - Implement storeMediaFile() to save files to storage
    - Implement getMediaType() to determine type from MIME type
    - Implement deleteMediaFile() for cleanup
    - Define validation rules: images (10MB), videos (50MB), audio (20MB)
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 3.2 Write property test for media validation
    - **Property 15: Media file validation before storage**
    - **Validates: Requirements 4.1, 4.6**
  
  - [ ]* 3.3 Write unit tests for media file edge cases
    - Test boundary file sizes (exactly 10MB, 10MB + 1 byte)
    - Test each supported file type
    - Test unsupported file types
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 4. Implement ConversationService
  - [x] 4.1 Create ConversationService class
    - Implement findOrCreateDirectConversation() with duplicate detection
    - Implement createGroupConversation() with creator as first participant
    - Implement addGroupMember() with block relationship validation
    - Implement removeGroupMember()
    - Implement getConversationsForUser() with ordering by last activity
    - Integrate with existing User::hasBlockedOrIsBlockedBy() method
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 14.1, 14.2_
  
  - [ ]* 4.2 Write property test for direct conversation creation
    - **Property 1: Direct conversations have exactly two participants**
    - **Validates: Requirements 1.1**
  
  - [ ]* 4.3 Write property test for block relationship prevention
    - **Property 2: Block relationships prevent conversation creation**
    - **Validates: Requirements 1.2, 14.2**
  
  - [ ]* 4.4 Write property test for duplicate conversation idempotency
    - **Property 3: Duplicate direct conversation creation is idempotent**
    - **Validates: Requirements 1.3**
  
  - [ ]* 4.5 Write property test for conversation ordering
    - **Property 4: Conversations ordered by recent activity**
    - **Validates: Requirements 1.4**
  
  - [ ]* 4.6 Write property test for group creator participation
    - **Property 6: Group creator is always a participant**
    - **Validates: Requirements 2.1**
  
  - [ ]* 4.7 Write property test for blocked member addition
    - **Property 7: Block relationships prevent group member addition**
    - **Validates: Requirements 2.2**
  
  - [ ]* 4.8 Write property test for removed participant access
    - **Property 8: Removed participants cannot access messages**
    - **Validates: Requirements 2.3**

- [x] 5. Implement MessageService
  - [x] 5.1 Create MessageService class
    - Implement sendMessage() with participant validation and empty content rejection
    - Implement sendMediaMessage() with media storage integration
    - Implement deleteMessage() with ownership validation
    - Implement markConversationAsRead() with bulk status updates
    - Implement getMessages() with cursor-based pagination
    - Implement addReaction() and removeReaction() with duplicate handling
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.2, 5.1, 5.2, 6.3, 7.1, 7.2, 9.1, 9.2, 9.3, 15.2_
  
  - [ ]* 5.2 Write property test for message creation status
    - **Property 10: New messages have "sent" status**
    - **Validates: Requirements 3.1, 6.1**
  
  - [ ]* 5.3 Write property test for non-participant message rejection
    - **Property 11: Non-participants cannot send messages**
    - **Validates: Requirements 3.2**
  
  - [ ]* 5.4 Write property test for message ordering
    - **Property 12: Messages returned in chronological order**
    - **Validates: Requirements 3.3, 15.3**
  
  - [ ]* 5.5 Write property test for empty message rejection
    - **Property 13: Empty messages are rejected**
    - **Validates: Requirements 3.4**
  
  - [ ]* 5.6 Write property test for message persistence
    - **Property 14: Messages persist with required fields**
    - **Validates: Requirements 3.5**
  
  - [ ]* 5.7 Write property test for message deletion
    - **Property 17: Message deletion hides content**
    - **Validates: Requirements 5.1, 5.3**
  
  - [ ]* 5.8 Write property test for deletion authorization
    - **Property 18: Only message owners can delete**
    - **Validates: Requirements 5.2**
  
  - [ ]* 5.9 Write property test for deleted message metadata
    - **Property 19: Deleted messages preserve metadata**
    - **Validates: Requirements 5.4**
  
  - [ ]* 5.10 Write property test for read status updates
    - **Property 20: Marking conversation as read updates message status**
    - **Validates: Requirements 6.3, 7.1**
  
  - [ ]* 5.11 Write property test for unread count calculation
    - **Property 23: Unread count calculation accuracy**
    - **Validates: Requirements 7.3, 7.4**
  
  - [ ]* 5.12 Write property test for cursor pagination
    - **Property 42: Cursor pagination maintains consistency**
    - **Validates: Requirements 15.2**

- [x] 6. Implement reply-to functionality
  - [x] 6.1 Add reply support to MessageService
    - Validate parent message exists in same conversation
    - Store parent_message_id when sending replies
    - Include parent message details in message responses
    - Handle replies to deleted messages
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 6.2 Write property test for reply validation
    - **Property 24: Reply validation requires same conversation**
    - **Validates: Requirements 8.1**
  
  - [ ]* 6.3 Write property test for reply parent reference
    - **Property 25: Reply stores parent reference**
    - **Validates: Requirements 8.2**
  
  - [ ]* 6.4 Write unit test for replying to deleted messages
    - Test that replies to deleted messages are allowed
    - Verify parent is indicated as deleted
    - _Requirements: 8.4_

- [x] 7. Implement reaction functionality
  - [x] 7.1 Add reaction methods to MessageService
    - Implement addReaction() with duplicate handling (upsert behavior)
    - Implement removeReaction()
    - Add participant validation for reactions
    - Include reaction aggregation in message responses
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 7.2 Write property test for reaction storage
    - **Property 27: Reactions are stored with user and emoji**
    - **Validates: Requirements 9.1**
  
  - [ ]* 7.3 Write property test for duplicate reaction idempotency
    - **Property 28: Duplicate reactions are idempotent**
    - **Validates: Requirements 9.2**
  
  - [ ]* 7.4 Write property test for reaction removal
    - **Property 29: Reaction removal deletes record**
    - **Validates: Requirements 9.3**
  
  - [ ]* 7.5 Write property test for reaction grouping
    - **Property 30: Reactions grouped in message responses**
    - **Validates: Requirements 9.4**
  
  - [ ]* 7.6 Write property test for non-participant reaction rejection
    - **Property 31: Non-participants cannot react**
    - **Validates: Requirements 9.5**

- [x] 8. Create API controllers
  - [x] 8.1 Create ChatController for conversation management
    - Implement index() for listing conversations with metadata
    - Implement store() for creating direct conversations
    - Implement show() for conversation details
    - Add CheckBlockedUsers middleware
    - Add CheckConversationParticipant middleware
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 16.1, 16.2, 16.3_
  
  - [x] 8.2 Create GroupChatController for group management
    - Implement store() for creating groups
    - Implement addMember() for adding participants
    - Implement removeMember() for removing participants
    - Validate group size constraints (3-50 participants)
    - _Requirements: 2.1, 2.2, 2.3, 2.5_
  
  - [x] 8.3 Create MessageController for messaging
    - Implement index() for getting messages with cursor pagination
    - Implement store() for sending text messages
    - Implement destroy() for deleting messages
    - Implement markAsRead() for read receipts
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 6.3, 7.1, 7.2, 15.2, 15.3_
  
  - [x] 8.4 Create MediaMessageController for media uploads
    - Implement store() for uploading media files
    - Integrate with MediaService for validation and storage
    - Create message with media attachment
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 8.5 Create ReactionController for emoji reactions
    - Implement store() for adding reactions
    - Implement destroy() for removing reactions
    - _Requirements: 9.1, 9.2, 9.3, 9.5_
  
  - [ ]* 8.6 Write property test for conversation metadata
    - **Property 33: Conversation metadata includes last message**
    - **Property 34: Conversation metadata includes unread count**
    - **Property 35: Conversation metadata includes last activity timestamp**
    - **Validates: Requirements 16.1, 16.2, 16.3**
  
  - [ ]* 8.7 Write property test for metadata updates
    - **Property 36: Metadata updates after message operations**
    - **Validates: Requirements 16.4**

- [x] 9. Create API resources for JSON responses
  - [x] 9.1 Create ConversationResource
    - Include id, type, name, participants, latest_message, unread_count, last_activity
    - Format timestamps appropriately
    - _Requirements: 1.5, 16.1, 16.2, 16.3_
  
  - [x] 9.2 Create MessageResource
    - Include id, conversation_id, user, content, type, status, parent_message, reactions, created_at
    - Hide content for deleted messages
    - Group reactions by emoji with counts
    - _Requirements: 3.5, 5.3, 6.4, 8.3, 9.4_
  
  - [x] 9.3 Create MessageMediaResource
    - Include id, file_type, file_size, url
    - Generate signed URLs for media access
    - _Requirements: 4.2_
  
  - [ ]* 9.4 Write property test for message status inclusion
    - **Property 21: Message responses include status**
    - **Validates: Requirements 6.4**

- [x] 10. Implement middleware for authorization
  - [x] 10.1 Create CheckConversationParticipant middleware
    - Verify user is participant in conversation from route parameter
    - Return 403 if not authorized
    - _Requirements: 2.4, 17.2, 17.3_
  
  - [x] 10.2 Extend CheckBlockedUsers middleware for chat
    - Add logic to check blocked relationships for conversation creation
    - Add logic to check blocked relationships for message sending
    - _Requirements: 1.2, 14.1, 14.2, 14.3_
  
  - [ ]* 10.3 Write property test for blocked user message prevention
    - **Property 40: Blocked users cannot send messages**
    - **Validates: Requirements 14.1**
  
  - [ ]* 10.4 Write property test for unblock restoration
    - **Property 41: Unblocking restores messaging**
    - **Validates: Requirements 14.4**

- [x] 11. Define API routes
  - [x] 11.1 Add conversation routes to api.php
    - Add routes for conversation management endpoints
    - Apply auth:sanctum middleware
    - Apply CheckConversationParticipant middleware where needed
    - Apply CheckBlockedUsers middleware for creation endpoints
    - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.2, 2.3, 17.1_
  
  - [x] 11.2 Add message routes to api.php
    - Add routes for message endpoints
    - Apply auth:sanctum and CheckConversationParticipant middleware
    - _Requirements: 3.1, 3.2, 3.3, 5.1, 5.2, 7.1_
  
  - [x] 11.3 Add media and reaction routes to api.php
    - Add routes for media upload and reactions
    - Apply appropriate middleware
    - _Requirements: 4.1, 9.1, 9.3_

- [x] 12. Checkpoint - Test core functionality
  - Run migrations and verify database schema
  - Test conversation creation via API
  - Test message sending and retrieval
  - Test media upload
  - Test reactions
  - Ensure all property tests pass
  - Ask the user if questions arise

- [x] 13. Set up Laravel Broadcasting configuration
  - [x] 13.1 Configure broadcasting driver
    - Update config/broadcasting.php for pusher driver
    - Add broadcasting credentials to .env
    - Document setup for Laravel Echo Server or Soketi
    - _Requirements: 10.1, 10.3_
  
  - [x] 13.2 Create broadcast channel authorization
    - Define conversation.{id} private channel in routes/channels.php
    - Implement authorization callback using isParticipant()
    - _Requirements: 10.4, 17.4_
  
  - [ ]* 13.3 Write property test for channel authorization
    - **Property 32: WebSocket channel authorization**
    - **Validates: Requirements 10.4**

- [x] 14. Implement broadcast events
  - [x] 14.1 Create MessageSent event
    - Implement ShouldBroadcast interface
    - Define broadcastOn() to return private conversation channel
    - Include full message data in broadcast
    - _Requirements: 10.1, 10.5_
  
  - [x] 14.2 Create MessageDeleted event
    - Implement ShouldBroadcast interface
    - Broadcast message_id and conversation_id
    - _Requirements: 10.5_
  
  - [x] 14.3 Create MessageReactionAdded event
    - Implement ShouldBroadcast interface
    - Include reaction details in broadcast
    - _Requirements: 10.5_
  
  - [x] 14.4 Create MessageReactionRemoved event
    - Implement ShouldBroadcast interface
    - Include message_id, user_id, emoji in broadcast
    - _Requirements: 10.5_
  
  - [x] 14.5 Create UserTyping event
    - Implement ShouldBroadcast interface
    - Include conversation_id, user, isTyping flag
    - _Requirements: 11.1, 11.2_
  
  - [x] 14.6 Create MessageStatusUpdated event
    - Implement ShouldBroadcast interface
    - Broadcast when message status changes
    - _Requirements: 6.2, 13.2_

- [x] 15. Integrate events with services
  - [x] 15.1 Dispatch MessageSent event in MessageService
    - Trigger event after message creation
    - _Requirements: 10.1_
  
  - [x] 15.2 Dispatch MessageDeleted event in MessageService
    - Trigger event after soft delete
    - _Requirements: 10.5_
  
  - [x] 15.3 Dispatch reaction events in MessageService
    - Trigger MessageReactionAdded after adding reaction
    - Trigger MessageReactionRemoved after removing reaction
    - _Requirements: 10.5_
  
  - [x] 15.4 Dispatch MessageStatusUpdated event
    - Trigger when marking messages as read
    - Trigger when delivery receipts update status
    - _Requirements: 6.2, 6.3, 13.2_

- [x] 16. Implement typing indicators
  - [x] 16.1 Create typing indicator endpoint
    - Add POST /api/chat/conversations/{id}/typing endpoint
    - Dispatch UserTyping event with isTyping flag
    - Validate user is participant
    - _Requirements: 11.1, 11.2_
  
  - [x] 16.2 Add typing route to api.php
    - Apply auth:sanctum and CheckConversationParticipant middleware
    - _Requirements: 11.1_

- [x] 17. Implement online status tracking
  - [x] 17.1 Add online status to conversation responses
    - Include online status for each participant in conversation details
    - Use existing last_seen_at field from users table
    - Consider user online if last_seen_at is within last 5 minutes
    - _Requirements: 12.3_
  
  - [x] 17.2 Update last_seen_at on user activity
    - Update timestamp when users make API requests
    - Update timestamp when WebSocket connections close
    - _Requirements: 12.4_
  
  - [ ]* 17.3 Write property test for online status inclusion
    - **Property 12.3: Conversation details include online status**
    - **Validates: Requirements 12.3**

- [x] 18. Implement delivery receipts
  - [x] 18.1 Create delivery receipt endpoint
    - Add POST /api/chat/messages/{id}/delivered endpoint
    - Update message status based on participant acknowledgments
    - Implement aggregation logic for "delivered" status
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [ ]* 18.2 Write property test for delivery receipt aggregation
    - **Property 33: Delivery receipts aggregate before status update**
    - **Validates: Requirements 13.3**

- [x] 19. Add comprehensive error handling
  - [x] 19.1 Add transaction management to all services
    - Wrap multi-step operations in DB::transaction()
    - Implement proper rollback on failures
    - _Requirements: 18.1_
  
  - [x] 19.2 Add validation to all controllers
    - Use Form Request classes for validation
    - Return field-level error messages
    - _Requirements: 18.3_
  
  - [ ]* 19.3 Write property test for transaction rollback
    - **Property 37: Failed operations rollback transactions**
    - **Validates: Requirements 18.1**
  
  - [ ]* 19.4 Write property test for validation error format
    - **Property 38: Validation errors include field details**
    - **Validates: Requirements 18.3**

- [x] 20. Handle user deletion cascade
  - [x] 20.1 Update User model deletion behavior
    - Preserve messages when user is deleted
    - Anonymize user_id or use soft delete approach
    - Update message responses to show "[Deleted User]" for deleted users
    - _Requirements: 18.5_
  
  - [ ]* 20.2 Write property test for user deletion
    - **Property 39: User deletion preserves message history**
    - **Validates: Requirements 18.5**

- [x] 21. Create API documentation and testing collection
  - [x] 21.1 Create Postman collection for Phase 3
    - Add all conversation endpoints with examples
    - Add all message endpoints with examples
    - Add WebSocket connection examples
    - Include authentication setup
    - _Requirements: All_
  
  - [x] 21.2 Create setup documentation
    - Document Laravel Echo Server setup
    - Document environment variables needed
    - Document WebSocket client integration
    - Provide testing instructions

- [x] 22. Final integration and testing
  - [x] 22.1 Test complete conversation flows
    - Test direct conversation creation and messaging
    - Test group conversation with multiple participants
    - Test media message sending
    - Test reactions and replies
    - _Requirements: All_
  
  - [x] 22.2 Test block relationship integration
    - Verify blocked users cannot create conversations
    - Verify blocked users cannot send messages
    - Verify unblocking restores functionality
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [x] 22.3 Test real-time broadcasting
    - Verify events are broadcast to correct channels
    - Verify channel authorization works
    - Test typing indicators
    - Test message delivery
    - _Requirements: 10.1, 10.4, 11.1, 11.2_
  
  - [ ]* 22.4 Run all property tests
    - Execute all property-based tests
    - Verify minimum 100 iterations per test
    - Ensure all properties pass

- [x] 23. Final checkpoint
  - Ensure all tests pass
  - Verify API documentation is complete
  - Confirm WebSocket setup instructions are clear
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- WebSocket setup requires external service (Laravel Echo Server or Soketi)
- All endpoints use existing Sanctum authentication from Phase 1
- Block relationship integration uses existing User model methods from Phase 2
