# Design Document: Phase 5 - Voice Rooms

## Overview

The Voice Rooms system implements live group audio communication for the Talkin platform, enabling Twitter Spaces or Clubhouse-style audio rooms with host controls, speaker management, and audience participation. The design leverages Laravel's existing WebSocket infrastructure (Pusher) for real-time updates and builds on the WebRTC foundation from Phase 4.

Key design decisions:
- Use Laravel Broadcasting (Pusher) for real-time room events and participant synchronization
- Store room metadata and participant state in SQLite database
- Implement role-based access control (host, co-host, speaker, audience)
- Integrate with existing block relationships to prevent unwanted participation
- Support automatic host transfer when host leaves
- Track room lifecycle for historical records
- Use private channels per room for event broadcasting

The architecture follows a hybrid approach: REST API for room lifecycle management (create, update, close, join, leave) and WebSocket channels for real-time events (participant updates, role changes, reactions).

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client Application                           │
│  ┌──────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
│  │  REST Client │  │ WebSocket Client │  │ WebRTC Engine   │  │
│  │  (HTTP/JSON) │  │ (Laravel Echo)   │  │ (Browser API)   │  │
│  └──────┬───────┘  └────────┬─────────┘  └────────┬────────┘  │
└─────────┼────────────────────┼─────────────────────┼───────────┘
          │                    │                     │
          │ HTTP               │ WebSocket           │ Media (P2P)
          │                    │                     │
┌─────────┼────────────────────┼─────────────────────┼───────────┐
│         ▼                    ▼                     │            │
│  ┌─────────────┐      ┌─────────────┐            │            │
│  │   Routes    │      │ Broadcasting │            │            │
│  │  (API)      │      │   Server     │            │            │
│  └──────┬──────┘      └──────┬───────┘            │            │
│         │                    │                     │            │
│         ▼                    │                     │            │
│  ┌─────────────┐            │                     │            │
│  │ Controllers │────Events───┤                     │            │
│  └──────┬──────┘            │                     │            │
│         │                    │                     │            │
│         ▼                    │                     │            │
│  ┌─────────────┐            │                     │            │
│  │  Services   │            │                     │            │
│  └──────┬──────┘            │                     │            │
│         │                    │                     │            │
│         ▼                    │                     │            │
│  ┌─────────────┐            │                     │            │
│  │   Models    │            │                     │            │
│  └──────┬──────┘            │                     │            │
│         │                    │                     │            │
│         ▼                    │                     │            │
│  ┌─────────────┐            │                     │            │
│  │  Database   │            │                     │            │
│  │  (SQLite)   │            │                     │            │
│  └─────────────┘            │                     │            │
│                              │                     │            │
│      Laravel Application     │                     │            │
└──────────────────────────────┼─────────────────────┼────────────┘
                               │                     │
                               ▼                     ▼
                     ┌──────────────────┐  ┌──────────────┐
                     │  WebSocket       │  │ WebRTC Mesh  │
                     │  Clients         │  │ (Multi-peer) │
                     └──────────────────┘  └──────────────┘
```

### Voice Room Flow Sequence

```
User                    API Server              Broadcasting (WS)        Other Participants
  │                         │                         │                         │
  │──POST /rooms───────────>│                         │                         │
  │<────201 {room}──────────│                         │                         │
  │                         │                         │                         │
  │──POST /rooms/{id}/join─>│                         │                         │
  │                         │──ParticipantJoined─────>│──participant joined────>│
  │<────200 {room_state}────│                         │                         │
  │                         │                         │                         │
  │──POST /rooms/{id}/speak>│                         │                         │
  │                         │──SpeakerRequested──────>│──speaker request───────>│
  │                         │                         │                         │
  │                         │<──POST /rooms/{id}/speakers/{userId}──────────────│
  │                         │──SpeakerPromoted───────>│──role changed──────────>│
  │<──role changed──────────│                         │                         │
  │                         │                         │                         │
  │──POST /rooms/{id}/reactions─>│──ReactionSent─────>│──reaction──────────────>│
  │                         │                         │                         │
  │──POST /rooms/{id}/leave>│──ParticipantLeft───────>│──participant left──────>│
  │                         │                         │                         │
```

### Layer Responsibilities

**Controllers**: Handle HTTP requests for room lifecycle, validate authorization, coordinate service calls
**Services**: Implement room business logic, manage role transitions, handle host transfer
**Models**: Define room and participant data structure, relationships, and role queries
**Events**: Represent room events (joins, leaves, role changes, reactions)
**Broadcasting**: Deliver real-time updates to all room participants via WebSocket

## Components and Interfaces

### Database Schema

**voice_rooms table**:
```sql
id: bigint (primary key)
host_id: bigint (foreign key to users)
title: string (nullable)
description: text (nullable)
is_public: boolean (default true)
capacity: integer (default 50)
state: enum('active', 'ended')
created_at: timestamp
updated_at: timestamp
ended_at: timestamp (nullable)
duration: integer (nullable, seconds)

index(host_id)
index(state)
index(is_public)
index(created_at)
```

**voice_room_participants table**:
```sql
id: bigint (primary key)
room_id: bigint (foreign key to voice_rooms)
user_id: bigint (foreign key to users)
role: enum('host', 'co_host', 'speaker', 'audience')
joined_at: timestamp
created_at: timestamp
updated_at: timestamp

unique(room_id, user_id)
index(room_id)
index(user_id)
index(role)
```

**speaker_requests table**:
```sql
id: bigint (primary key)
room_id: bigint (foreign key to voice_rooms)
user_id: bigint (foreign key to users)
status: enum('pending', 'approved', 'denied')
created_at: timestamp
updated_at: timestamp

unique(room_id, user_id)
index(room_id)
index(status)
```

### API Endpoints

**Room Management**:
- `GET /api/rooms` - List public active rooms (paginated)
- `POST /api/rooms` - Create voice room
- `GET /api/rooms/{id}` - Get room details
- `PUT /api/rooms/{id}` - Update room settings (host only)
- `DELETE /api/rooms/{id}` - Close room (host only)
- `GET /api/rooms/history` - Get user's room history

**Participant Management**:
- `POST /api/rooms/{id}/join` - Join room as audience
- `POST /api/rooms/{id}/leave` - Leave room
- `POST /api/rooms/{id}/speak` - Request to speak
- `POST /api/rooms/{id}/speakers/{userId}` - Promote to speaker (host/co-host only)
- `DELETE /api/rooms/{id}/speakers/{userId}` - Demote speaker (host/co-host only)
- `POST /api/rooms/{id}/kick/{userId}` - Kick participant (host/co-host only)

**Room Features**:
- `POST /api/rooms/{id}/cohosts/{userId}` - Add co-host (host only)
- `DELETE /api/rooms/{id}/cohosts/{userId}` - Remove co-host (host only)
- `POST /api/rooms/{id}/reactions` - Send emoji reaction

### Models

**VoiceRoom Model**:
```php
class VoiceRoom extends Model
{
    protected $fillable = [
        'host_id',
        'title',
        'description',
        'is_public',
        'capacity',
        'state',
        'ended_at',
        'duration',
    ];
    
    protected $casts = [
        'is_public' => 'boolean',
        'capacity' => 'integer',
        'ended_at' => 'datetime',
        'duration' => 'integer',
    ];
    
    // Relationships
    public function host(): BelongsTo
    public function participants(): HasMany
    public function speakerRequests(): HasMany
    
    // State checks
    public function isActive(): bool
    public function isFull(): bool
    public function isParticipant(User $user): bool
    public function getParticipantRole(User $user): ?string
    public function canManageSpeakers(User $user): bool
    public function canManageRoom(User $user): bool
    
    // Participant queries
    public function getSpeakerCount(): int
    public function getParticipantCount(): int
    public function getParticipantsByRole(): array
    
    // State transitions
    public function close(): void
    public function updateSettings(array $settings): void
    
    // Scopes
    public function scopeActive(Builder $query): Builder
    public function scopePublic(Builder $query): Builder
    public function scopeForUser(Builder $query, User $user): Builder
}
```

**VoiceRoomParticipant Model**:
```php
class VoiceRoomParticipant extends Model
{
    protected $fillable = [
        'room_id',
        'user_id',
        'role',
        'joined_at',
    ];
    
    protected $casts = [
        'joined_at' => 'datetime',
    ];
    
    // Relationships
    public function room(): BelongsTo
    public function user(): BelongsTo
    
    // Role checks
    public function isHost(): bool
    public function isCoHost(): bool
    public function isSpeaker(): bool
    public function isAudience(): bool
    public function canSpeak(): bool
    
    // Role transitions
    public function promoteToSpeaker(): void
    public function promoteToCoHost(): void
    public function demoteToAudience(): void
    public function demoteToSpeaker(): void
}
```

**SpeakerRequest Model**:
```php
class SpeakerRequest extends Model
{
    protected $fillable = [
        'room_id',
        'user_id',
        'status',
    ];
    
    // Relationships
    public function room(): BelongsTo
    public function user(): BelongsTo
    
    // State methods
    public function approve(): void
    public function deny(): void
    public function isPending(): bool
    
    // Scopes
    public function scopePending(Builder $query): Builder
}
```

### Services

**VoiceRoomService**:
```php
class VoiceRoomService
{
    public function createRoom(User $host, array $settings): VoiceRoom
    {
        // Create room with host as first participant
        // Set default capacity if not provided
        // Validate settings
        // Return room instance
    }
    
    public function updateRoomSettings(VoiceRoom $room, User $user, array $settings): VoiceRoom
    {
        // Validate user is host
        // Update room settings
        // Broadcast RoomUpdated event
        // Return updated room
    }
    
    public function closeRoom(VoiceRoom $room, User $user): VoiceRoom
    {
        // Validate user is host
        // Calculate duration
        // Set state to ended
        // Remove all participants
        // Broadcast RoomClosed event
        // Return closed room
    }
    
    public function joinRoom(VoiceRoom $room, User $user): VoiceRoomParticipant
    {
        // Validate room is active
        // Validate room not at capacity
        // Check block relationships with host
        // Add participant with audience role
        // Broadcast ParticipantJoined event
        // Return participant instance
    }
    
    public function leaveRoom(VoiceRoom $room, User $user): void
    {
        // Remove participant
        // Handle host transfer if user is host
        // Broadcast ParticipantLeft event
        // Close room if no participants remain
    }
    
    public function requestToSpeak(VoiceRoom $room, User $user): SpeakerRequest
    {
        // Validate user is participant
        // Validate user is not already speaker
        // Create speaker request
        // Broadcast SpeakerRequested event
        // Return request instance
    }
    
    public function promoteToSpeaker(VoiceRoom $room, User $manager, User $target): VoiceRoomParticipant
    {
        // Validate manager can manage speakers
        // Validate target is participant
        // Validate speaker limit not exceeded
        // Update participant role to speaker
        // Remove any pending speaker request
        // Broadcast RoleChanged event
        // Return updated participant
    }
    
    public function demoteToAudience(VoiceRoom $room, User $manager, User $target): VoiceRoomParticipant
    {
        // Validate manager can manage speakers
        // Validate target is not host
        // Update participant role to audience
        // Broadcast RoleChanged event
        // Return updated participant
    }
    
    public function kickParticipant(VoiceRoom $room, User $manager, User $target): void
    {
        // Validate manager can manage participants
        // Validate target is not host
        // Remove participant
        // Broadcast ParticipantKicked event
    }
    
    public function addCoHost(VoiceRoom $room, User $host, User $target): VoiceRoomParticipant
    {
        // Validate user is host
        // Validate target is participant
        // Update participant role to co_host
        // Broadcast RoleChanged event
        // Return updated participant
    }
    
    public function removeCoHost(VoiceRoom $room, User $host, User $target): VoiceRoomParticipant
    {
        // Validate user is host
        // Validate target is co-host
        // Demote to speaker or audience
        // Broadcast RoleChanged event
        // Return updated participant
    }
    
    public function sendReaction(VoiceRoom $room, User $user, string $emoji): void
    {
        // Validate user is participant
        // Validate emoji format
        // Broadcast ReactionSent event (not persisted)
    }
    
    public function getPublicRooms(int $perPage): LengthAwarePaginator
    {
        // Get active public rooms
        // Order by created_at descending
        // Include host and participant count
        // Paginate results
    }
    
    public function getRoomHistory(User $user, int $perPage): LengthAwarePaginator
    {
        // Get rooms where user was participant
        // Include role information
        // Order by created_at descending
        // Paginate results
    }
    
    private function transferHost(VoiceRoom $room): void
    {
        // Find oldest co-host, or oldest speaker, or oldest audience
        // Promote to host
        // Broadcast RoleChanged event
        // If no participants, close room
    }
    
    private function autoCloseEmptyRoom(VoiceRoom $room): void
    {
        // Check if room has zero participants
        // Wait 5 minutes
        // Close room if still empty
    }
}
```

### Events and Broadcasting

**ParticipantJoined Event**:
```php
class ParticipantJoined implements ShouldBroadcast
{
    public function __construct(
        public VoiceRoom $room,
        public VoiceRoomParticipant $participant
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->room->id),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'participant.joined';
    }
    
    public function broadcastWith(): array
    {
        return [
            'participant' => new ParticipantResource($this->participant),
            'participant_count' => $this->room->getParticipantCount(),
        ];
    }
}
```

**ParticipantLeft Event**:
```php
class ParticipantLeft implements ShouldBroadcast
{
    public function __construct(
        public int $roomId,
        public int $userId
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->roomId),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'participant.left';
    }
    
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
        ];
    }
}
```

**RoleChanged Event**:
```php
class RoleChanged implements ShouldBroadcast
{
    public function __construct(
        public int $roomId,
        public int $userId,
        public string $newRole,
        public string $oldRole
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->roomId),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'role.changed';
    }
    
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'new_role' => $this->newRole,
            'old_role' => $this->oldRole,
        ];
    }
}
```

**SpeakerRequested Event**:
```php
class SpeakerRequested implements ShouldBroadcast
{
    public function __construct(
        public SpeakerRequest $request
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->request->room_id),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'speaker.requested';
    }
    
    public function broadcastWith(): array
    {
        return [
            'request' => new SpeakerRequestResource($this->request),
        ];
    }
}
```

**ReactionSent Event**:
```php
class ReactionSent implements ShouldBroadcast
{
    public function __construct(
        public int $roomId,
        public int $userId,
        public string $emoji
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->roomId),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'reaction.sent';
    }
    
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
            'emoji' => $this->emoji,
            'timestamp' => now()->toISOString(),
        ];
    }
}
```

**RoomUpdated Event**:
```php
class RoomUpdated implements ShouldBroadcast
{
    public function __construct(public VoiceRoom $room) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->room->id),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'room.updated';
    }
    
    public function broadcastWith(): array
    {
        return [
            'room' => new VoiceRoomResource($this->room),
        ];
    }
}
```

**RoomClosed Event**:
```php
class RoomClosed implements ShouldBroadcast
{
    public function __construct(public int $roomId) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->roomId),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'room.closed';
    }
}
```

**ParticipantKicked Event**:
```php
class ParticipantKicked implements ShouldBroadcast
{
    public function __construct(
        public int $roomId,
        public int $userId
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('voice-room.' . $this->roomId),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'participant.kicked';
    }
    
    public function broadcastWith(): array
    {
        return [
            'user_id' => $this->userId,
        ];
    }
}
```

### Channel Authorization

```php
// In routes/channels.php
Broadcast::channel('voice-room.{roomId}', function (User $user, int $roomId) {
    $room = VoiceRoom::find($roomId);
    return $room && $room->isActive() && $room->isParticipant($user);
});
```

### Middleware

**CheckRoomParticipant**:
```php
class CheckRoomParticipant
{
    public function handle(Request $request, Closure $next): Response
    {
        $roomId = $request->route('id');
        $room = VoiceRoom::find($roomId);
        
        if (!$room || !$room->isParticipant($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        return $next($request);
    }
}
```

**CheckRoomHost**:
```php
class CheckRoomHost
{
    public function handle(Request $request, Closure $next): Response
    {
        $roomId = $request->route('id');
        $room = VoiceRoom::find($roomId);
        
        if (!$room || $room->host_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the host can perform this action'
            ], 403);
        }
        
        return $next($request);
    }
}
```

**CheckRoomManager**:
```php
class CheckRoomManager
{
    public function handle(Request $request, Closure $next): Response
    {
        $roomId = $request->route('id');
        $room = VoiceRoom::find($roomId);
        
        if (!$room || !$room->canManageSpeakers($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Only host or co-hosts can perform this action'
            ], 403);
        }
        
        return $next($request);
    }
}
```

## Data Models

### VoiceRoom Model Structure

```php
VoiceRoom {
    id: int
    host_id: int
    title: string | null
    description: string | null
    is_public: bool
    capacity: int
    state: 'active' | 'ended'
    created_at: timestamp
    updated_at: timestamp
    ended_at: timestamp | null
    duration: int | null (seconds)
    
    // Relationships
    host: User
    participants: VoiceRoomParticipant[]
    speakerRequests: SpeakerRequest[]
    
    // Computed
    isActive: bool
    isFull: bool
    participantCount: int
    speakerCount: int
    participantsByRole: {
        host: User,
        co_hosts: User[],
        speakers: User[],
        audience: User[]
    }
}
```

### VoiceRoomParticipant Model Structure

```php
VoiceRoomParticipant {
    id: int
    room_id: int
    user_id: int
    role: 'host' | 'co_host' | 'speaker' | 'audience'
    joined_at: timestamp
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    room: VoiceRoom
    user: User
    
    // Computed
    isHost: bool
    isCoHost: bool
    isSpeaker: bool
    isAudience: bool
    canSpeak: bool (host, co_host, or speaker)
}
```

### SpeakerRequest Model Structure

```php
SpeakerRequest {
    id: int
    room_id: int
    user_id: int
    status: 'pending' | 'approved' | 'denied'
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    room: VoiceRoom
    user: User
    
    // Computed
    isPending: bool
}
```

### Role Hierarchy

```
host (highest privilege)
  ├─ Can update room settings
  ├─ Can close room
  ├─ Can add/remove co-hosts
  ├─ Can promote/demote speakers
  ├─ Can kick any participant
  └─ Can speak

co_host
  ├─ Can promote/demote speakers
  ├─ Can kick participants (except host and other co-hosts)
  └─ Can speak

speaker
  └─ Can speak

audience (lowest privilege)
  └─ Can listen only
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Room creator becomes host

*For any* user creating a voice room, the creator should be set as the host and added to the participant list with host role.

**Validates: Requirements 1.1**

### Property 2: New rooms initialize in active state

*For any* room creation, the room should have a unique identifier and state set to "active".

**Validates: Requirements 1.2**

### Property 3: Optional room settings are accepted

*For any* room creation with or without optional fields (title, description, is_public), the room should be created successfully with provided values or defaults.

**Validates: Requirements 1.3**

### Property 4: Room creation records timestamp

*For any* room creation, the created_at timestamp should be set and non-null.

**Validates: Requirements 1.5**

### Property 5: Public room list filters correctly

*For any* set of rooms with various states and privacy settings, the public room list should return only rooms that are both active and public.

**Validates: Requirements 2.1, 15.1, 15.2**

### Property 6: Room list includes required fields

*For any* room in the public room list, the response should include title, host information, participant count, and creation time.

**Validates: Requirements 2.2**

### Property 7: Room list ordered by recency

*For any* room list with multiple rooms, rooms should be ordered by created_at in descending order (newest first).

**Validates: Requirements 2.3**

### Property 8: Room list pagination respects page size

*For any* room list request with pagination parameters, the returned results should not exceed the specified page size.

**Validates: Requirements 2.4**

### Property 9: Room details include complete information

*For any* room details request, the response should include all settings and the complete participant list.

**Validates: Requirements 2.5**

### Property 10: Host can update room settings

*For any* room and its host, the host should be able to update title, description, and privacy settings successfully.

**Validates: Requirements 3.1**

### Property 11: Non-hosts cannot update settings

*For any* room and user who is not the host, attempting to update room settings should be rejected.

**Validates: Requirements 3.2**

### Property 12: Capacity updates enforce new limit

*For any* room with updated capacity, subsequent join attempts should respect the new capacity limit.

**Validates: Requirements 3.3**

### Property 13: Settings updates broadcast to participants

*For any* room settings update, a RoomUpdated event should be broadcast to all participants.

**Validates: Requirements 3.5**

### Property 14: Room closure sets ended state

*For any* active room closed by the host, the room state should transition to "ended".

**Validates: Requirements 4.1**

### Property 15: Room closure removes all participants

*For any* room being closed, all participants should be removed and a ParticipantLeft or RoomClosed event should be broadcast.

**Validates: Requirements 4.2**

### Property 16: Non-hosts cannot close rooms

*For any* room and user who is not the host, attempting to close the room should be rejected.

**Validates: Requirements 4.3**

### Property 17: Room closure calculates duration

*For any* room being closed, the duration should be calculated as (ended_at - created_at) in seconds and persisted.

**Validates: Requirements 4.4, 20.2**

### Property 18: Ended rooms reject operations

*For any* room with state "ended", all participant operations (join, leave, promote, etc.) should be rejected.

**Validates: Requirements 4.5, 20.4**

### Property 19: Capacity bounds are enforced

*For any* room creation or update, capacity values below 2 or above 500 should be rejected.

**Validates: Requirements 5.1**

### Property 20: Full rooms reject joins

*For any* room at capacity, new join requests should be rejected with an appropriate error.

**Validates: Requirements 5.2, 6.2**

### Property 21: Leaving frees capacity

*For any* room at capacity, after a participant leaves, the next join attempt should succeed.

**Validates: Requirements 5.3**

### Property 22: Capacity counts all roles

*For any* room, the participant count should include host, co-hosts, speakers, and audience members.

**Validates: Requirements 5.4**

### Property 23: Joining assigns audience role

*For any* user joining a room, they should be added to the participant list with role "audience".

**Validates: Requirements 6.1**

### Property 24: Block relationships prevent joining

*For any* pair of users where one has blocked the other, the blocked user should not be able to join rooms hosted by the blocker.

**Validates: Requirements 6.3, 16.1, 16.4**

### Property 25: Joining broadcasts to participants

*For any* user joining a room, a ParticipantJoined event should be broadcast to all existing participants.

**Validates: Requirements 6.4**

### Property 26: Join response includes room state

*For any* successful join, the response should include current room state and the complete participant list.

**Validates: Requirements 6.5**

### Property 27: Leaving removes from participant list

*For any* participant leaving a room, they should no longer appear in the room's participant list.

**Validates: Requirements 7.1**

### Property 28: Leaving broadcasts to participants

*For any* participant leaving a room, a ParticipantLeft event should be broadcast to all remaining participants.

**Validates: Requirements 7.2**

### Property 29: Host departure transfers or closes

*For any* room where the host leaves, the system should either transfer host to another participant (if any exist) or close the room (if none exist).

**Validates: Requirements 7.3, 25.1, 25.2, 25.3, 25.4**

### Property 30: Speaker requests create pending requests

*For any* audience member requesting to speak, a speaker request with status "pending" should be created and broadcast to managers.

**Validates: Requirements 8.1**

### Property 31: Speakers cannot request to speak

*For any* user with speaker, co-host, or host role, requesting to speak should be rejected.

**Validates: Requirements 8.2**

### Property 32: Non-participants cannot request to speak

*For any* user not in a room, requesting to speak in that room should be rejected.

**Validates: Requirements 8.3**

### Property 33: Speaker requests include required data

*For any* speaker request, it should include the requester's user information and creation timestamp.

**Validates: Requirements 8.4**

### Property 34: Speaker requests ordered chronologically

*For any* room with multiple pending speaker requests, they should be ordered by created_at in ascending order (oldest first).

**Validates: Requirements 8.5**

### Property 35: Promotion grants speaker role

*For any* audience member promoted by a manager, their role should change to "speaker".

**Validates: Requirements 9.1**

### Property 36: Only managers can promote

*For any* user with speaker or audience role, attempting to promote another user should be rejected.

**Validates: Requirements 9.2**

### Property 37: Promotion broadcasts role change

*For any* user promoted to speaker, a RoleChanged event should be broadcast to all participants.

**Validates: Requirements 9.3**

### Property 38: Promotion removes speaker request

*For any* user with a pending speaker request who is promoted, the speaker request should be removed or marked as approved.

**Validates: Requirements 9.4**

### Property 39: Cannot promote non-participants

*For any* user not in a room, attempting to promote them should be rejected.

**Validates: Requirements 9.5**

### Property 40: Demotion revokes speaker role

*For any* speaker demoted by a manager, their role should change to "audience".

**Validates: Requirements 10.1, 10.5**

### Property 41: Only managers can demote

*For any* user with speaker or audience role, attempting to demote another user should be rejected.

**Validates: Requirements 10.2**

### Property 42: Demotion broadcasts role change

*For any* user demoted, a RoleChanged event should be broadcast to all participants.

**Validates: Requirements 10.3**

### Property 43: Host cannot be demoted

*For any* room, attempting to demote the host should be rejected.

**Validates: Requirements 10.4**

### Property 44: Kicking removes participant

*For any* participant kicked by a manager, they should be immediately removed from the participant list.

**Validates: Requirements 11.1**

### Property 45: Kicking broadcasts removal

*For any* participant kicked, a ParticipantKicked event should be broadcast to all remaining participants.

**Validates: Requirements 11.2**

### Property 46: Only managers can kick

*For any* user with speaker or audience role, attempting to kick another user should be rejected.

**Validates: Requirements 11.3**

### Property 47: Host cannot be kicked

*For any* room, attempting to kick the host should be rejected.

**Validates: Requirements 11.4**

### Property 48: Kicked users can rejoin

*For any* user kicked from a room, they should be able to rejoin the same room successfully (no permanent ban).

**Validates: Requirements 11.5**

### Property 49: Host can add co-hosts

*For any* participant promoted to co-host by the host, their role should change to "co_host".

**Validates: Requirements 12.1**

### Property 50: Only host can add co-hosts

*For any* user who is not the host, attempting to add a co-host should be rejected.

**Validates: Requirements 12.2**

### Property 51: Host can remove co-hosts

*For any* co-host removed by the host, their role should change to a lower privilege level (speaker or audience).

**Validates: Requirements 12.3**

### Property 52: Co-host changes broadcast

*For any* co-host addition or removal, a RoleChanged event should be broadcast to all participants.

**Validates: Requirements 12.4**

### Property 53: Cannot promote non-participants to co-host

*For any* user not in a room, attempting to make them a co-host should be rejected.

**Validates: Requirements 12.5**

### Property 54: Reactions broadcast to all participants

*For any* participant sending a reaction, it should be broadcast to all participants in the room.

**Validates: Requirements 13.1, 24.1**

### Property 55: Only participants can send reactions

*For any* user not in a room, attempting to send a reaction should be rejected.

**Validates: Requirements 13.2, 24.5**

### Property 56: Reactions include sender and emoji

*For any* reaction broadcast, it should include the sender's user information and the emoji identifier.

**Validates: Requirements 13.3, 24.2**

### Property 57: Reactions are not persisted

*For any* reaction sent, it should not create a database record (reactions are ephemeral).

**Validates: Requirements 24.4**

### Property 58: Participant list grouped by role

*For any* participant list response, participants should be grouped into four categories: host, co-hosts, speakers, and audience.

**Validates: Requirements 14.3**

### Property 59: Participant data includes required fields

*For any* participant in a participant list, the data should include user information and join timestamp.

**Validates: Requirements 14.4, 23.5**

### Property 60: Participants ordered by join time within role

*For any* role group in a participant list, participants should be ordered by joined_at in ascending order (oldest first).

**Validates: Requirements 14.5**

### Property 61: Privacy updates affect visibility

*For any* room with privacy changed from public to private or vice versa, the room's presence in the public room list should update accordingly.

**Validates: Requirements 15.4**

### Property 62: Dynamic blocking removes participants

*For any* room where the host blocks a participant during the session, that participant should be removed from the room.

**Validates: Requirements 16.2**

### Property 63: Non-host blocks don't affect room

*For any* room where a non-host participant blocks another non-host participant, both should remain in the room.

**Validates: Requirements 16.3**

### Property 64: Block errors don't reveal block status

*For any* join rejection due to blocking, the error message should not explicitly mention blocking.

**Validates: Requirements 16.5**

### Property 65: Authentication required for all endpoints

*For any* voice room API endpoint, requests without valid Sanctum tokens should be rejected with authentication error.

**Validates: Requirements 17.1, 17.5**

### Property 66: Room details authorization

*For any* room details request, access should be granted only if the user is a participant or the room is public.

**Validates: Requirements 17.2**

### Property 67: Privileged actions require appropriate role

*For any* privileged action (promote, demote, kick, add co-host), the requesting user must have the required role (host or co-host as appropriate).

**Validates: Requirements 17.3, 22.4, 22.5**

### Property 68: WebSocket channel authorization

*For any* WebSocket channel connection attempt for a room, authorization should succeed only if the user is a participant.

**Validates: Requirements 17.4, 18.2, 18.3**

### Property 69: Room events broadcast to participants

*For any* room event (join, leave, role change, reaction, room update), it should be broadcast via Pusher to the room's private channel.

**Validates: Requirements 18.1, 18.4**

### Property 70: Failed transactions rollback

*For any* database operation that fails during room or participant management, no partial data should be committed to the database.

**Validates: Requirements 19.1**

### Property 71: Validation errors include field details

*For any* invalid request, the error response should include specific field-level validation messages.

**Validates: Requirements 19.2, 26.4**

### Property 72: User deletion removes from rooms

*For any* user who is deleted, they should be removed from all active rooms they are participating in.

**Validates: Requirements 19.4**

### Property 73: Room history includes all participated rooms

*For any* user requesting room history, the response should include all rooms they participated in with their role information.

**Validates: Requirements 20.5**

### Property 74: Speaker limit enforced

*For any* room, the total count of participants with roles host, co-host, or speaker should not exceed 20.

**Validates: Requirements 21.1, 21.2, 21.4**

### Property 75: Demotion frees speaker slot

*For any* room at speaker capacity, demoting a speaker should allow a new speaker promotion to succeed.

**Validates: Requirements 21.3**

### Property 76: Speaker limit errors are descriptive

*For any* promotion attempt that would exceed speaker limit, the error message should clearly indicate the speaker limit has been reached.

**Validates: Requirements 21.5**

### Property 77: Co-hosts cannot kick host

*For any* room, a co-host attempting to kick the host should be rejected.

**Validates: Requirements 22.2**

### Property 78: Co-hosts cannot remove each other

*For any* room with multiple co-hosts, one co-host attempting to remove another co-host should be rejected.

**Validates: Requirements 22.3**

### Property 79: Reconnection sends participant list

*For any* participant reconnecting to a room's WebSocket channel, they should receive the current participant list.

**Validates: Requirements 23.4**

### Property 80: Host transfer follows priority order

*For any* room where the host leaves, the new host should be selected in priority order: oldest co-host, then oldest speaker, then oldest audience member.

**Validates: Requirements 25.1, 25.2, 25.3**

### Property 81: Empty room closes on host departure

*For any* room where the host is the only participant, the host leaving should cause the room to close.

**Validates: Requirements 25.4**

### Property 82: Host transfer broadcasts role change

*For any* host transfer, a RoleChanged event should be broadcast showing the old host's new role and the new host's promotion.

**Validates: Requirements 25.5**

### Property 83: Response field consistency

*For any* room or participant response, field names and data types should be consistent across all endpoints.

**Validates: Requirements 26.2**

### Property 84: User resource format consistency

*For any* participant data in responses, user information should use the same format as existing User resources from previous phases.

**Validates: Requirements 26.3**

### Property 85: HTTP status codes are appropriate

*For any* API operation, the HTTP status code should match the operation result (200 for success, 201 for creation, 403 for authorization failure, 404 for not found, 422 for validation error).

**Validates: Requirements 26.5**

## Error Handling

### Error Categories

**Validation Errors (400)**:
- Invalid capacity values (< 2 or > 500)
- Invalid speaker limit (> 20)
- Empty required fields
- Invalid emoji format
- Invalid role values

**Authentication Errors (401)**:
- Missing or invalid Sanctum token
- Expired authentication token

**Authorization Errors (403)**:
- Non-host attempting to update settings
- Non-host attempting to close room
- Non-manager attempting to promote/demote
- Non-host attempting to add/remove co-hosts
- Non-participant attempting to send reactions
- Blocked user attempting to join
- Co-host attempting to kick host
- Co-host attempting to remove another co-host

**Not Found Errors (404)**:
- Room does not exist
- User does not exist
- Participant does not exist

**Conflict Errors (422)**:
- Room at capacity
- Speaker limit reached
- User already in room
- User not in room
- Invalid role transition
- Operations on ended room
- Attempting to demote host
- Attempting to kick host

**Server Errors (500)**:
- Database transaction failures
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

All multi-step operations (room creation with host participant, role changes, host transfer) use database transactions:
```php
DB::beginTransaction();
try {
    // Create/update room
    // Modify participants
    // Broadcast events
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

## Testing Strategy

### Dual Testing Approach

The Voice Room System requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Validate specific examples, edge cases, and error conditions
- Specific room creation scenarios
- Default capacity and privacy values
- Edge cases (capacity reduction with existing participants, empty room auto-close)
- Error handling for blocked users
- Host transfer scenarios
- Integration with existing middleware

**Property Tests**: Verify universal properties across all inputs
- Room creation and settings management
- Participant role transitions and hierarchy
- Capacity and speaker limit enforcement
- Authorization rules across all roles
- Event broadcasting for all operations
- Block relationship integration

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library**: Use Pest with Pest Property Testing plugin for Laravel
**Configuration**: Each property test must run minimum 100 iterations
**Tagging**: Each test must reference its design property using the format:
```php
// Feature: phase5-voice-rooms, Property 1: Room creator becomes host
```

**Test Organization**:
- Group tests by feature area (room management, participant management, role hierarchy, etc.)
- Each correctness property maps to exactly one property-based test
- Place property tests close to implementation to catch errors early
- Use Laravel's database transactions for test isolation
- Mock Pusher broadcasting for testing event dispatch

### Integration Testing

**WebSocket Integration**:
- Test channel authorization callbacks
- Verify event broadcasting triggers correctly
- Test participant list synchronization

**Block Relationship Integration**:
- Test room joining with blocked users
- Test dynamic blocking during active rooms
- Test block status privacy in error messages

**Role Hierarchy Integration**:
- Test permission enforcement across all roles
- Test host transfer scenarios
- Test co-host peer protection

**Middleware Integration**:
- Test CheckBlockedUsers middleware integration
- Test UpdateLastSeen middleware integration
- Test Sanctum authentication

### Test Data Generation

For property-based tests, generate:
- Random users with various relationships (following, blocked, none)
- Random rooms with different settings (public/private, various capacities)
- Random participant lists with various role distributions
- Random role transitions and management actions
- Random speaker requests

### Coverage Goals

- 100% of correctness properties implemented as property tests
- Edge cases covered by unit tests (default values, capacity edge cases, empty rooms)
- All error conditions tested
- Integration points between voice rooms and existing features validated
- Role hierarchy and authorization fully tested

## Implementation Notes

### WebRTC Audio Mesh Architecture

Unlike Phase 4's peer-to-peer calls, voice rooms require a mesh network where each speaker maintains WebRTC connections to all other participants:

```
Speaker A ←→ Speaker B
    ↓ ↘      ↙ ↓
    ↓   ↘  ↙   ↓
    ↓     ↘↙    ↓
Speaker C ←→ Speaker D
```

For rooms with many speakers, consider using a Selective Forwarding Unit (SFU) in future phases to reduce bandwidth requirements.

### Host Transfer Logic

Priority order for host transfer:
1. Oldest co-host (by joined_at timestamp)
2. Oldest speaker (if no co-hosts)
3. Oldest audience member (if no speakers)
4. Close room (if no participants)

Implementation:
```php
private function transferHost(VoiceRoom $room): void
{
    $newHost = $room->participants()
        ->whereIn('role', ['co_host', 'speaker', 'audience'])
        ->orderBy('role', 'desc') // co_host > speaker > audience
        ->orderBy('joined_at', 'asc')
        ->first();
    
    if (!$newHost) {
        $room->close();
        return;
    }
    
    $oldRole = $newHost->role;
    $newHost->role = 'host';
    $newHost->save();
    
    $room->host_id = $newHost->user_id;
    $room->save();
    
    broadcast(new RoleChanged($room->id, $newHost->user_id, 'host', $oldRole));
}
```

### Speaker Limit Calculation

Speaker count includes:
- 1 host (always can speak)
- N co-hosts (always can speak)
- M speakers (explicitly granted permission)

Total: 1 + N + M ≤ 20

### Capacity vs Speaker Limit

- Capacity: Maximum total participants (all roles)
- Speaker limit: Maximum participants who can transmit audio

Example: Room with capacity 100 can have up to 100 participants, but only 20 can speak simultaneously.

### Room Lifecycle States

```
[Create] → active → ended
              ↑
              │
         [Auto-close after 5min if empty]
```

### Automatic Room Cleanup

Implement a scheduled job to close empty rooms:
```php
// In app/Console/Kernel.php
$schedule->call(function () {
    VoiceRoom::active()
        ->whereDoesntHave('participants')
        ->where('updated_at', '<', now()->subMinutes(5))
        ->each(function ($room) {
            $room->close();
        });
})->everyMinute();
```

### Block Relationship Checking

Check blocks in both directions:
```php
$isBlocked = Block::where(function ($query) use ($user, $host) {
    $query->where('blocker_id', $host->id)
          ->where('blocked_id', $user->id);
})->orWhere(function ($query) use ($user, $host) {
    $query->where('blocker_id', $user->id)
          ->where('blocked_id', $host->id);
})->exists();
```

### Reaction Format

Reactions are ephemeral (not persisted) and broadcast immediately:
```json
{
  "user_id": 123,
  "emoji": "👏",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### API Resource Examples

**VoiceRoomResource**:
```php
class VoiceRoomResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'host' => new UserResource($this->host),
            'title' => $this->title,
            'description' => $this->description,
            'is_public' => $this->is_public,
            'capacity' => $this->capacity,
            'state' => $this->state,
            'participant_count' => $this->getParticipantCount(),
            'speaker_count' => $this->getSpeakerCount(),
            'created_at' => $this->created_at->toISOString(),
            'ended_at' => $this->ended_at?->toISOString(),
            'duration' => $this->duration,
        ];
    }
}
```

**ParticipantResource**:
```php
class ParticipantResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->user),
            'role' => $this->role,
            'joined_at' => $this->joined_at->toISOString(),
            'can_speak' => $this->canSpeak(),
        ];
    }
}
```

## Future Enhancements

Potential improvements for future phases:
- Scheduled rooms (create rooms that start at a specific time)
- Room invitations for private rooms
- Recording and playback of voice rooms
- Transcription and translation services
- Room moderation tools (mute participants, ban users)
- Room analytics (peak participants, total listen time)
- Integration with user profiles (show hosted rooms)
- Room discovery by topic or language
- Notification preferences for room events
- SFU (Selective Forwarding Unit) for better scalability
