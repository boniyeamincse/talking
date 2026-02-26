# Requirements Document: Phase 5 - Voice Rooms

## Introduction

This document specifies the requirements for implementing live group audio rooms in the Talkin social language learning platform. Voice rooms enable real-time group audio communication with host controls, speaker management, and audience participation, similar to Twitter Spaces or Clubhouse. The system builds on existing infrastructure including authentication (Phase 1), social features (Phase 2), chat system (Phase 3), and WebRTC calling (Phase 4).

## Glossary

- **Voice_Room_System**: The complete voice room subsystem including room management, participant handling, and real-time audio coordination
- **Voice_Room**: A live group audio session with a host, optional speakers, and audience members
- **Host**: The user who created the room and has full control over room settings and participants
- **Co_Host**: A user granted elevated privileges by the host to manage speakers and participants
- **Speaker**: A user with permission to transmit audio in the room
- **Audience**: Users in the room who can listen but not speak unless promoted
- **Room_Capacity**: The maximum number of participants allowed in a voice room
- **Speaker_Request**: A request from an audience member to be promoted to speaker status
- **Room_State**: The current status of a room (active, ended)
- **Participant_List**: The collection of all users currently in a room with their roles
- **Reaction**: An emoji expression sent by participants during the room session
- **Room_Settings**: Configurable properties of a room including title, description, privacy, and capacity

## Requirements

### Requirement 1: Voice Room Creation

**User Story:** As a user, I want to create voice rooms, so that I can host live group audio conversations.

#### Acceptance Criteria

1. WHEN a user creates a voice room, THE Voice_Room_System SHALL create a new Voice_Room with the creator as the host
2. WHEN a Voice_Room is created, THE Voice_Room_System SHALL assign a unique identifier and set the state to "active"
3. WHEN creating a room, THE Voice_Room_System SHALL accept optional title, description, and privacy settings
4. WHEN a Voice_Room is created, THE Voice_Room_System SHALL set the default capacity to 50 participants
5. WHEN a Voice_Room is created, THE Voice_Room_System SHALL record the creation timestamp

### Requirement 2: Voice Room Discovery

**User Story:** As a user, I want to discover active voice rooms, so that I can find interesting conversations to join.

#### Acceptance Criteria

1. WHEN a user requests the room list, THE Voice_Room_System SHALL return all public active rooms
2. WHEN room list is returned, THE Voice_Room_System SHALL include room title, host information, participant count, and creation time
3. WHEN room list is requested, THE Voice_Room_System SHALL order rooms by creation time in descending order
4. WHEN room list is requested with pagination parameters, THE Voice_Room_System SHALL return results in pages of specified size
5. WHEN a user requests details for a specific room, THE Voice_Room_System SHALL return complete room information including settings and participant list

### Requirement 3: Voice Room Settings Management

**User Story:** As a host, I want to update room settings, so that I can control the room environment and access.

#### Acceptance Criteria

1. WHEN a host updates room settings, THE Voice_Room_System SHALL modify the title, description, or privacy settings
2. WHEN a non-host attempts to update room settings, THE Voice_Room_System SHALL reject the request
3. WHEN a host updates room capacity, THE Voice_Room_System SHALL enforce the new limit for future joins
4. IF the new capacity is lower than current participant count, THEN THE Voice_Room_System SHALL allow existing participants to remain
5. WHEN room settings are updated, THE Voice_Room_System SHALL broadcast the changes to all participants

### Requirement 4: Voice Room Closure

**User Story:** As a host, I want to close voice rooms, so that I can end sessions when conversations are complete.

#### Acceptance Criteria

1. WHEN a host closes a voice room, THE Voice_Room_System SHALL set the room state to "ended"
2. WHEN a room is closed, THE Voice_Room_System SHALL remove all participants and notify them
3. WHEN a non-host attempts to close a room, THE Voice_Room_System SHALL reject the request
4. WHEN a room is closed, THE Voice_Room_System SHALL record the end timestamp and calculate total duration
5. WHEN a room is closed, THE Voice_Room_System SHALL prevent new participants from joining

### Requirement 5: Room Capacity Management

**User Story:** As a host, I want to set room capacity limits, so that I can manage room size and performance.

#### Acceptance Criteria

1. THE Voice_Room_System SHALL enforce a minimum capacity of 2 participants and maximum of 500 participants
2. WHEN a room reaches capacity, THE Voice_Room_System SHALL reject new join requests
3. WHEN a participant leaves a full room, THE Voice_Room_System SHALL allow new participants to join
4. WHEN capacity is checked, THE Voice_Room_System SHALL count all participants regardless of role
5. WHEN a room is created without specifying capacity, THE Voice_Room_System SHALL use the default capacity of 50

### Requirement 6: Joining Voice Rooms

**User Story:** As a user, I want to join voice rooms as an audience member, so that I can listen to live conversations.

#### Acceptance Criteria

1. WHEN a user joins a voice room, THE Voice_Room_System SHALL add them to the Participant_List with audience role
2. WHEN a user attempts to join a room at capacity, THE Voice_Room_System SHALL reject the request
3. WHEN a user attempts to join a room they are blocked from, THE Voice_Room_System SHALL reject the request
4. WHEN a user joins a room, THE Voice_Room_System SHALL broadcast the participant addition to all existing participants
5. WHEN a user joins a room, THE Voice_Room_System SHALL return the current room state and participant list

### Requirement 7: Leaving Voice Rooms

**User Story:** As a user, I want to leave voice rooms, so that I can exit conversations when I'm no longer interested.

#### Acceptance Criteria

1. WHEN a user leaves a voice room, THE Voice_Room_System SHALL remove them from the Participant_List
2. WHEN a user leaves a room, THE Voice_Room_System SHALL broadcast the participant removal to all remaining participants
3. WHEN the host leaves a room, THE Voice_Room_System SHALL transfer host privileges to the oldest co-host or close the room if no co-hosts exist
4. WHEN a speaker leaves a room, THE Voice_Room_System SHALL remove their speaker privileges
5. WHEN a user leaves a room, THE Voice_Room_System SHALL release any audio resources associated with that participant

### Requirement 8: Speaker Request Management

**User Story:** As an audience member, I want to request permission to speak, so that I can participate actively in the conversation.

#### Acceptance Criteria

1. WHEN an audience member requests to speak, THE Voice_Room_System SHALL create a Speaker_Request and notify the host and co-hosts
2. WHEN a user who is already a speaker requests to speak, THE Voice_Room_System SHALL reject the request
3. WHEN a user who is not in the room requests to speak, THE Voice_Room_System SHALL reject the request
4. WHEN a speaker request is created, THE Voice_Room_System SHALL include the requester's user information and timestamp
5. THE Voice_Room_System SHALL maintain a queue of pending speaker requests in chronological order

### Requirement 9: Speaker Promotion

**User Story:** As a host or co-host, I want to promote audience members to speakers, so that I can enable active participation.

#### Acceptance Criteria

1. WHEN a host or co-host promotes an audience member, THE Voice_Room_System SHALL grant speaker privileges to that user
2. WHEN a non-host and non-co-host attempts to promote a user, THE Voice_Room_System SHALL reject the request
3. WHEN a user is promoted to speaker, THE Voice_Room_System SHALL broadcast the role change to all participants
4. WHEN a user is promoted to speaker, THE Voice_Room_System SHALL remove any pending speaker request from that user
5. WHEN a user who is not in the room is promoted, THE Voice_Room_System SHALL reject the request

### Requirement 10: Speaker Demotion

**User Story:** As a host or co-host, I want to demote speakers to audience, so that I can manage active participation.

#### Acceptance Criteria

1. WHEN a host or co-host demotes a speaker, THE Voice_Room_System SHALL revoke speaker privileges and change role to audience
2. WHEN a non-host and non-co-host attempts to demote a speaker, THE Voice_Room_System SHALL reject the request
3. WHEN a user is demoted, THE Voice_Room_System SHALL broadcast the role change to all participants
4. WHEN the host is demoted, THE Voice_Room_System SHALL reject the request
5. WHEN a co-host is demoted, THE Voice_Room_System SHALL remove co-host privileges and change role to audience

### Requirement 11: Participant Removal

**User Story:** As a host or co-host, I want to kick participants from the room, so that I can manage disruptive behavior.

#### Acceptance Criteria

1. WHEN a host or co-host kicks a participant, THE Voice_Room_System SHALL remove that user from the room immediately
2. WHEN a user is kicked, THE Voice_Room_System SHALL broadcast the removal to all remaining participants
3. WHEN a non-host and non-co-host attempts to kick a participant, THE Voice_Room_System SHALL reject the request
4. WHEN the host is kicked, THE Voice_Room_System SHALL reject the request
5. WHEN a kicked user attempts to rejoin the same room, THE Voice_Room_System SHALL allow them to rejoin

### Requirement 12: Co-Host Management

**User Story:** As a host, I want to add and remove co-hosts, so that I can share room management responsibilities.

#### Acceptance Criteria

1. WHEN a host adds a co-host, THE Voice_Room_System SHALL grant co-host privileges to that participant
2. WHEN a non-host attempts to add a co-host, THE Voice_Room_System SHALL reject the request
3. WHEN a host removes a co-host, THE Voice_Room_System SHALL revoke co-host privileges and change role to speaker or audience
4. WHEN co-host status changes, THE Voice_Room_System SHALL broadcast the role change to all participants
5. WHEN a user who is not in the room is added as co-host, THE Voice_Room_System SHALL reject the request

### Requirement 13: Emoji Reactions in Rooms

**User Story:** As a participant, I want to send emoji reactions during the room, so that I can express responses without interrupting speakers.

#### Acceptance Criteria

1. WHEN a participant sends an emoji reaction, THE Voice_Room_System SHALL broadcast it to all participants in real-time
2. WHEN a non-participant attempts to send a reaction, THE Voice_Room_System SHALL reject the request
3. WHEN a reaction is sent, THE Voice_Room_System SHALL include the sender's user information and emoji identifier
4. THE Voice_Room_System SHALL support standard Unicode emoji reactions
5. WHEN reactions are broadcast, THE Voice_Room_System SHALL deliver them within 200ms

### Requirement 14: Real-time Participant List Updates

**User Story:** As a participant, I want to see the current participant list, so that I know who is in the room and their roles.

#### Acceptance Criteria

1. WHEN a user joins or leaves, THE Voice_Room_System SHALL broadcast updated participant list to all participants
2. WHEN a participant's role changes, THE Voice_Room_System SHALL broadcast the updated participant list
3. WHEN participant list is returned, THE Voice_Room_System SHALL group participants by role (host, co-hosts, speakers, audience)
4. WHEN participant list is returned, THE Voice_Room_System SHALL include user information and join timestamp for each participant
5. THE Voice_Room_System SHALL order participants within each role group by join time

### Requirement 15: Room Privacy Controls

**User Story:** As a host, I want to control room privacy, so that I can create both public and private conversations.

#### Acceptance Criteria

1. WHEN a room is created as public, THE Voice_Room_System SHALL include it in the public room list
2. WHEN a room is created as private, THE Voice_Room_System SHALL exclude it from the public room list
3. WHEN a user attempts to join a private room without invitation, THE Voice_Room_System SHALL reject the request
4. WHEN a host changes room privacy settings, THE Voice_Room_System SHALL update the room visibility immediately
5. THE Voice_Room_System SHALL default to public privacy when not specified

### Requirement 16: Block Relationship Integration

**User Story:** As a user, I want blocked users to be unable to join my rooms, so that I can maintain a safe environment.

#### Acceptance Criteria

1. WHEN a blocked user attempts to join a room hosted by the blocker, THE Voice_Room_System SHALL reject the request
2. WHEN a user blocks another user during an active room, THE Voice_Room_System SHALL remove the blocked user if the blocker is the host
3. WHEN a user blocks another user during an active room, THE Voice_Room_System SHALL allow both to remain if neither is the host
4. WHEN checking block status, THE Voice_Room_System SHALL verify bidirectional blocks (blocker and blocked)
5. WHEN a block prevents joining, THE Voice_Room_System SHALL return an error without revealing the block status

### Requirement 17: Authentication and Authorization

**User Story:** As a system, I want to enforce authentication and authorization, so that only authorized users can access and manage rooms.

#### Acceptance Criteria

1. THE Voice_Room_System SHALL require valid Sanctum authentication tokens for all API endpoints
2. WHEN a user requests room details, THE Voice_Room_System SHALL verify they are a participant or the room is public
3. WHEN a user attempts a privileged action, THE Voice_Room_System SHALL verify they have the required role
4. THE Voice_Room_System SHALL validate WebSocket connections using the same authentication mechanism as REST API endpoints
5. WHEN an unauthenticated request is made, THE Voice_Room_System SHALL reject it and return an authentication error

### Requirement 18: Real-time Broadcasting

**User Story:** As a participant, I want to receive real-time updates about room events, so that I stay synchronized with room state.

#### Acceptance Criteria

1. WHEN a room event occurs, THE Voice_Room_System SHALL broadcast it to all participants via Pusher WebSocket
2. THE Voice_Room_System SHALL use private channels for each room to ensure event privacy
3. WHEN a user connects to a room channel, THE Voice_Room_System SHALL verify they are a participant
4. THE Voice_Room_System SHALL broadcast events for joins, leaves, role changes, reactions, and room updates
5. WHEN a broadcast fails, THE Voice_Room_System SHALL continue operation and allow participants to poll for updates

### Requirement 19: Error Handling and Data Integrity

**User Story:** As a developer, I want robust error handling, so that the system gracefully handles failures and maintains data integrity.

#### Acceptance Criteria

1. WHEN a database operation fails, THE Voice_Room_System SHALL rollback transactions and return appropriate error messages
2. WHEN invalid data is provided, THE Voice_Room_System SHALL return validation errors with specific field-level feedback
3. THE Voice_Room_System SHALL maintain referential integrity between rooms, participants, and users using foreign key constraints
4. WHEN a user is deleted, THE Voice_Room_System SHALL remove them from all active rooms
5. WHEN concurrent role changes occur, THE Voice_Room_System SHALL use database locking to prevent race conditions

### Requirement 20: Room Lifecycle Management

**User Story:** As a system, I want to manage room lifecycle properly, so that resources are cleaned up and history is maintained.

#### Acceptance Criteria

1. WHEN a room has zero participants, THE Voice_Room_System SHALL automatically close the room after 5 minutes
2. WHEN a room is closed, THE Voice_Room_System SHALL persist room metadata and duration for historical records
3. WHEN a room is closed, THE Voice_Room_System SHALL clean up all associated WebSocket channels
4. THE Voice_Room_System SHALL prevent operations on rooms with state "ended"
5. WHEN a user requests their room history, THE Voice_Room_System SHALL return all rooms they participated in with role information

### Requirement 21: Speaker Management Constraints

**User Story:** As a host, I want reasonable speaker limits, so that conversations remain manageable and performant.

#### Acceptance Criteria

1. THE Voice_Room_System SHALL enforce a maximum of 20 simultaneous speakers per room
2. WHEN speaker limit is reached, THE Voice_Room_System SHALL reject new speaker promotions
3. WHEN a speaker is demoted from a full speaker list, THE Voice_Room_System SHALL allow new speaker promotions
4. WHEN speaker limit is checked, THE Voice_Room_System SHALL count host, co-hosts, and speakers
5. WHEN a promotion would exceed the limit, THE Voice_Room_System SHALL return a descriptive error message

### Requirement 22: Participant Role Hierarchy

**User Story:** As a system, I want to enforce role hierarchy, so that permissions are properly managed.

#### Acceptance Criteria

1. THE Voice_Room_System SHALL recognize four roles in order of privilege: host, co-host, speaker, audience
2. WHEN a co-host attempts to kick the host, THE Voice_Room_System SHALL reject the request
3. WHEN a co-host attempts to remove another co-host, THE Voice_Room_System SHALL reject the request
4. WHEN a speaker attempts privileged actions, THE Voice_Room_System SHALL reject the request
5. THE Voice_Room_System SHALL allow hosts to perform all actions on any participant

### Requirement 23: Real-time Participant Synchronization

**User Story:** As a participant, I want the participant list to stay synchronized, so that I always see accurate room state.

#### Acceptance Criteria

1. WHEN a participant joins, THE Voice_Room_System SHALL broadcast the updated participant list within 200ms
2. WHEN a participant leaves, THE Voice_Room_System SHALL broadcast the updated participant list within 200ms
3. WHEN a role changes, THE Voice_Room_System SHALL broadcast the updated participant list within 200ms
4. WHEN a participant reconnects after disconnection, THE Voice_Room_System SHALL send the current participant list
5. THE Voice_Room_System SHALL include role, join time, and user information for each participant in broadcasts

### Requirement 24: Reaction Broadcasting

**User Story:** As a participant, I want my reactions to appear instantly for all participants, so that I can engage with the conversation in real-time.

#### Acceptance Criteria

1. WHEN a participant sends a reaction, THE Voice_Room_System SHALL broadcast it to all participants within 200ms
2. WHEN a reaction is broadcast, THE Voice_Room_System SHALL include the sender's user information and timestamp
3. THE Voice_Room_System SHALL support all standard Unicode emoji as reactions
4. THE Voice_Room_System SHALL NOT persist reactions to the database
5. WHEN a non-participant attempts to send a reaction, THE Voice_Room_System SHALL reject the request

### Requirement 25: Host Transfer on Departure

**User Story:** As a system, I want to handle host departure gracefully, so that rooms can continue when the host leaves.

#### Acceptance Criteria

1. WHEN the host leaves and co-hosts exist, THE Voice_Room_System SHALL promote the oldest co-host to host
2. WHEN the host leaves and no co-hosts exist but speakers exist, THE Voice_Room_System SHALL promote the oldest speaker to host
3. WHEN the host leaves and only audience members exist, THE Voice_Room_System SHALL promote the oldest audience member to host
4. WHEN the host leaves and no other participants exist, THE Voice_Room_System SHALL close the room
5. WHEN host transfer occurs, THE Voice_Room_System SHALL broadcast the role change to all participants

### Requirement 26: API Response Consistency

**User Story:** As a developer, I want consistent API responses, so that client integration is predictable and maintainable.

#### Acceptance Criteria

1. THE Voice_Room_System SHALL use Laravel API resources for all JSON responses
2. WHEN returning room data, THE Voice_Room_System SHALL include consistent field names and data types
3. WHEN returning participant data, THE Voice_Room_System SHALL include user information using the existing User resource format
4. WHEN errors occur, THE Voice_Room_System SHALL return standard Laravel validation error format
5. THE Voice_Room_System SHALL return appropriate HTTP status codes for all operations

### Requirement 27: Integration with Existing Middleware

**User Story:** As a developer, I want voice rooms to integrate with existing middleware, so that security and tracking features work consistently.

#### Acceptance Criteria

1. THE Voice_Room_System SHALL use the CheckBlockedUsers middleware for all participant interactions
2. THE Voice_Room_System SHALL use the UpdateLastSeen middleware for all API endpoints
3. WHEN blocked users are detected, THE Voice_Room_System SHALL prevent room access using existing middleware logic
4. THE Voice_Room_System SHALL use Sanctum authentication middleware for all protected endpoints
5. THE Voice_Room_System SHALL follow existing API routing patterns and conventions
