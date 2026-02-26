# Design Document: Phase 4 - Audio and Video Calls

## Overview

The Calls and Video system implements WebRTC-based real-time audio and video communication for the Talkin platform. The design leverages Laravel's existing WebSocket infrastructure (Laravel Broadcasting) for WebRTC signaling while maintaining RESTful API endpoints for call management and history tracking.

Key design decisions:
- Use Laravel Broadcasting (Pusher/Reverb) for WebRTC signaling messages
- Store call metadata in SQLite database for history tracking
- Implement call state machine to prevent invalid transitions
- Integrate with existing block relationships to prevent unwanted calls
- Support STUN/TURN server configuration for NAT traversal
- Track call duration and outcomes for analytics
- Separate audio and video call endpoints for clarity

The architecture follows a hybrid approach: REST API for call lifecycle management (initiate, answer, decline, end) and WebSocket channels for real-time WebRTC signaling (SDP offers/answers, ICE candidates).

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
                     │  WebSocket       │  │ STUN/TURN    │
                     │  Clients         │  │ Servers      │
                     └──────────────────┘  └──────────────┘
```

### Call Flow Sequence

```
Caller                  API Server              Signaling (WS)           Callee
  │                         │                         │                    │
  │──POST /calls/initiate──>│                         │                    │
  │                         │──CallInitiated event───>│                    │
  │                         │                         │──offer + SDP──────>│
  │<────201 {call_id}───────│                         │                    │
  │                         │                         │                    │
  │                         │<──POST /calls/{id}/answer──────────────────│
  │                         │──CallAnswered event────>│                    │
  │<──answer + SDP──────────│                         │<───────────────────│
  │                         │                         │                    │
  │──POST /ice-candidate───>│──ICECandidate event────>│──ice candidate────>│
  │<──ice candidate─────────│<──POST /ice-candidate───│<───────────────────│
  │                         │                         │                    │
  │═══════════════════ WebRTC Media Connection (P2P) ═══════════════════>│
  │                         │                         │                    │
  │──POST /calls/{id}/end──>│──CallEnded event───────>│──call ended───────>│
  │                         │                         │                    │
```

### Layer Responsibilities

**Controllers**: Handle HTTP requests for call lifecycle, validate authorization, coordinate service calls
**Services**: Implement call business logic, manage state transitions, calculate durations
**Models**: Define call data structure, relationships, and state queries
**Events**: Represent WebRTC signaling events (offers, answers, ICE candidates, call state changes)
**Broadcasting**: Deliver real-time signaling messages to connected clients via WebSocket

## Components and Interfaces

### Database Schema

**calls table**:
```sql
id: bigint (primary key)
caller_id: bigint (foreign key to users)
callee_id: bigint (foreign key to users)
type: enum('audio', 'video')
status: enum('initiating', 'ringing', 'active', 'ended', 'declined', 'failed', 'missed')
initiated_at: timestamp
answered_at: timestamp (nullable)
ended_at: timestamp (nullable)
duration: integer (nullable, seconds)
end_reason: enum('completed', 'declined', 'missed', 'failed', 'cancelled') (nullable)
created_at: timestamp
updated_at: timestamp

index(caller_id)
index(callee_id)
index(status)
index(created_at)
```

**call_ice_candidates table** (optional, for debugging):
```sql
id: bigint (primary key)
call_id: bigint (foreign key to calls)
user_id: bigint (foreign key to users)
candidate: text (JSON)
created_at: timestamp

index(call_id)
```

**call_recordings table** (optional feature):
```sql
id: bigint (primary key)
call_id: bigint (foreign key to calls)
file_path: string
file_size: integer (bytes)
duration: integer (seconds)
created_at: timestamp
updated_at: timestamp

index(call_id)
```

### API Endpoints

**Audio Call Management**:
- `POST /api/calls/initiate` - Initiate audio call
- `POST /api/calls/{id}/answer` - Answer incoming call
- `POST /api/calls/{id}/decline` - Decline incoming call
- `POST /api/calls/{id}/end` - End active call
- `POST /api/calls/{id}/ice-candidate` - Exchange ICE candidate
- `GET /api/calls/history` - Get call history (paginated)

**Video Call Management**:
- `POST /api/video/initiate` - Initiate video call
- `POST /api/video/{id}/answer` - Answer video call
- `POST /api/video/{id}/decline` - Decline video call
- `POST /api/video/{id}/end` - End video call
- `POST /api/video/{id}/ice-candidate` - Exchange ICE candidate for video
- `POST /api/video/{id}/toggle-video` - Toggle camera on/off
- `GET /api/video/history` - Get video call history (paginated)

**Configuration**:
- `GET /api/calls/config` - Get STUN/TURN server configuration

### Models

**Call Model**:
```php
class Call extends Model
{
    protected $fillable = [
        'caller_id',
        'callee_id',
        'type',
        'status',
        'initiated_at',
        'answered_at',
        'ended_at',
        'duration',
        'end_reason',
    ];
    
    protected $casts = [
        'initiated_at' => 'datetime',
        'answered_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration' => 'integer',
    ];
    
    // Relationships
    public function caller(): BelongsTo
    public function callee(): BelongsTo
    public function recording(): HasOne
    
    // State checks
    public function isActive(): bool
    public function canBeAnswered(): bool
    public function canBeEnded(): bool
    public function involvesUser(User $user): bool
    
    // State transitions
    public function markAsRinging(): void
    public function markAsAnswered(): void
    public function markAsEnded(string $reason): void
    public function markAsDeclined(): void
    public function markAsFailed(): void
    
    // Scopes
    public function scopeForUser(Builder $query, User $user): Builder
    public function scopeActive(Builder $query): Builder
    public function scopeByType(Builder $query, string $type): Builder
}
```

**CallRecording Model** (optional):
```php
class CallRecording extends Model
{
    protected $fillable = [
        'call_id',
        'file_path',
        'file_size',
        'duration',
    ];
    
    // Relationships
    public function call(): BelongsTo
    
    // Methods
    public function getUrl(): string
}
```

### Services

**CallService**:
```php
class CallService
{
    public function initiateCall(User $caller, User $callee, string $type, array $sdpOffer): Call
    {
        // Validate users are not blocked
        // Check callee availability (not in another call)
        // Create call record with 'initiating' status
        // Broadcast CallInitiated event with SDP offer
        // Return call instance
    }
    
    public function answerCall(Call $call, User $user, array $sdpAnswer): Call
    {
        // Validate user is the callee
        // Validate call can be answered (status = 'ringing')
        // Update call status to 'active'
        // Record answered_at timestamp
        // Broadcast CallAnswered event with SDP answer
        // Return updated call
    }
    
    public function declineCall(Call $call, User $user): Call
    {
        // Validate user is the callee
        // Validate call can be declined
        // Update status to 'declined'
        // Record end_reason
        // Broadcast CallDeclined event
        // Return updated call
    }
    
    public function endCall(Call $call, User $user): Call
    {
        // Validate user is participant
        // Validate call is active
        // Calculate duration
        // Update status to 'ended'
        // Record ended_at and duration
        // Broadcast CallEnded event
        // Return updated call
    }
    
    public function exchangeIceCandidate(Call $call, User $user, array $candidate): void
    {
        // Validate user is participant
        // Validate call is active or ringing
        // Broadcast ICECandidateReceived event to other participant
    }
    
    public function toggleVideo(Call $call, User $user, bool $enabled): void
    {
        // Validate user is participant
        // Validate call is video type
        // Validate call is active
        // Broadcast VideoToggled event to other participant
    }
    
    public function getCallHistory(User $user, string $type, int $perPage): LengthAwarePaginator
    {
        // Get calls where user is caller or callee
        // Filter by type if specified
        // Order by initiated_at descending
        // Paginate results
        // Return with participant details
    }
    
    public function getUserCallStatus(User $user): ?Call
    {
        // Check if user has an active call
        // Return active call or null
    }
    
    public function getStunTurnConfig(): array
    {
        // Return configured STUN/TURN servers
        // Include credentials for TURN servers
    }
}
```

### Events and Broadcasting

**CallInitiated Event**:
```php
class CallInitiated implements ShouldBroadcast
{
    public function __construct(
        public Call $call,
        public array $sdpOffer
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->call->callee_id),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'call.initiated';
    }
    
    public function broadcastWith(): array
    {
        return [
            'call' => new CallResource($this->call),
            'sdp_offer' => $this->sdpOffer,
        ];
    }
}
```

**CallAnswered Event**:
```php
class CallAnswered implements ShouldBroadcast
{
    public function __construct(
        public Call $call,
        public array $sdpAnswer
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->call->caller_id),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'call.answered';
    }
    
    public function broadcastWith(): array
    {
        return [
            'call_id' => $this->call->id,
            'sdp_answer' => $this->sdpAnswer,
        ];
    }
}
```

**CallDeclined Event**:
```php
class CallDeclined implements ShouldBroadcast
{
    public function __construct(public Call $call) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->call->caller_id),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'call.declined';
    }
}
```

**CallEnded Event**:
```php
class CallEnded implements ShouldBroadcast
{
    public function __construct(public Call $call) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->call->caller_id),
            new PrivateChannel('user.' . $this->call->callee_id),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'call.ended';
    }
    
    public function broadcastWith(): array
    {
        return [
            'call_id' => $this->call->id,
            'duration' => $this->call->duration,
            'end_reason' => $this->call->end_reason,
        ];
    }
}
```

**ICECandidateReceived Event**:
```php
class ICECandidateReceived implements ShouldBroadcast
{
    public function __construct(
        public int $callId,
        public int $fromUserId,
        public int $toUserId,
        public array $candidate
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->toUserId),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'call.ice-candidate';
    }
    
    public function broadcastWith(): array
    {
        return [
            'call_id' => $this->callId,
            'from_user_id' => $this->fromUserId,
            'candidate' => $this->candidate,
        ];
    }
}
```

**VideoToggled Event**:
```php
class VideoToggled implements ShouldBroadcast
{
    public function __construct(
        public int $callId,
        public int $userId,
        public int $otherUserId,
        public bool $videoEnabled
    ) {}
    
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->otherUserId),
        ];
    }
    
    public function broadcastAs(): string
    {
        return 'call.video-toggled';
    }
    
    public function broadcastWith(): array
    {
        return [
            'call_id' => $this->callId,
            'user_id' => $this->userId,
            'video_enabled' => $this->videoEnabled,
        ];
    }
}
```

### Channel Authorization

```php
// In routes/channels.php
Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    return $user->id === $userId;
});
```

### Middleware

**CheckCallParticipant**:
```php
class CheckCallParticipant
{
    public function handle(Request $request, Closure $next): Response
    {
        $callId = $request->route('id');
        $call = Call::find($callId);
        
        if (!$call || !$call->involvesUser($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        return $next($request);
    }
}
```

## Data Models

### Call Model Structure

```php
Call {
    id: int
    caller_id: int
    callee_id: int
    type: 'audio' | 'video'
    status: 'initiating' | 'ringing' | 'active' | 'ended' | 'declined' | 'failed' | 'missed'
    initiated_at: timestamp
    answered_at: timestamp | null
    ended_at: timestamp | null
    duration: int | null (seconds)
    end_reason: 'completed' | 'declined' | 'missed' | 'failed' | 'cancelled' | null
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    caller: User
    callee: User
    recording: CallRecording | null
    
    // Computed
    isActive: bool
    canBeAnswered: bool
    canBeEnded: bool
    otherParticipant(user): User
}
```

### Call Recording Model Structure (Optional)

```php
CallRecording {
    id: int
    call_id: int
    file_path: string
    file_size: int (bytes)
    duration: int (seconds)
    created_at: timestamp
    updated_at: timestamp
    
    // Relationships
    call: Call
    
    // Computed
    url: string
}
```

### Call State Machine

```
initiating ──> ringing ──> active ──> ended
    │              │          │
    │              │          └──> failed
    │              │
    │              └──> declined
    │              └──> missed
    │
    └──> cancelled
```

**Valid Transitions**:
- `initiating` → `ringing`: When call is delivered to callee
- `ringing` → `active`: When callee answers
- `ringing` → `declined`: When callee declines
- `ringing` → `missed`: When callee doesn't respond within timeout
- `active` → `ended`: When either participant ends call
- `active` → `failed`: When connection drops
- `initiating` → `cancelled`: When caller cancels before ringing

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Call creation generates session with SDP offer

*For any* valid pair of users, initiating a call should create a Call_Session with a unique identifier, initial "initiating" state, and generate an SDP offer.

**Validates: Requirements 1.1, 1.2**

### Property 2: Call answering generates SDP answer and updates state

*For any* call in "ringing" state, answering should generate an SDP answer, transition to "active" state, and record the answer timestamp.

**Validates: Requirements 2.1, 2.4**

### Property 3: Call declining updates state and records reason

*For any* call in "ringing" state, declining should transition to "declined" state and record the decline reason in call history.

**Validates: Requirements 2.2, 2.5**

### Property 4: Call termination calculates and persists duration

*For any* active call, ending it should calculate the duration (ended_at - answered_at), transition to "ended" state, and persist the duration immediately.

**Validates: Requirements 3.1, 3.2, 3.5**

### Property 5: ICE candidate exchange broadcasts to remote peer

*For any* active or ringing call, when an ICE candidate is submitted by one participant, it should be broadcast to the other participant via WebSocket.

**Validates: Requirements 4.1**

### Property 6: ICE candidate validation before processing

*For any* ICE candidate submission, the system should validate the candidate format before broadcasting, rejecting malformed candidates.

**Validates: Requirements 4.5**

### Property 7: Call history completeness

*For any* user, requesting call history should return all calls where that user is either the caller or callee, with no calls from other users.

**Validates: Requirements 5.1, 14.5**

### Property 8: Call history includes required fields

*For any* call in call history, the response should include call type, both participants, duration, timestamp, and outcome (end_reason).

**Validates: Requirements 5.2**

### Property 9: Call history pagination respects page size

*For any* call history request with pagination parameters, the returned results should not exceed the specified page size.

**Validates: Requirements 5.3**

### Property 10: Call history ordered by recency

*For any* call history response with multiple calls, the calls should be ordered by initiated_at timestamp in descending order (most recent first).

**Validates: Requirements 5.4**

### Property 11: Call persistence is immediate

*For any* call initiation, the Call_Session should be persisted to the database before the API response is returned.

**Validates: Requirements 5.5**

### Property 12: Video call type is recorded

*For any* video call initiation, the created Call_Session should have type set to "video".

**Validates: Requirements 6.1**

### Property 13: Video SDP offers include video tracks

*For any* video call initiation, the generated SDP offer should include video media track information.

**Validates: Requirements 6.2**

### Property 14: Video call answering includes video tracks

*For any* video call answer, the generated SDP answer should include video media track information.

**Validates: Requirements 7.1**

### Property 15: Video toggle broadcasts state change

*For any* active video call, toggling video on or off should broadcast the new state to the other participant.

**Validates: Requirements 8.5**

### Property 16: Signaling events include call identifier

*For any* signaling event (offer, answer, ICE candidate), the broadcast message should include the Call_Session identifier.

**Validates: Requirements 10.5**

### Property 17: Call initiation broadcasts to callee

*For any* call initiation, a CallInitiated event should be broadcast to the callee's private channel.

**Validates: Requirements 10.1**

### Property 18: Call answer broadcasts to caller

*For any* call answer, a CallAnswered event should be broadcast to the caller's private channel.

**Validates: Requirements 10.2**

### Property 19: ICE candidates broadcast to remote peer

*For any* ICE candidate submission, the candidate should be broadcast to the other participant's private channel.

**Validates: Requirements 10.3**

### Property 20: New calls initialize in "initiating" state

*For any* call creation, the initial status should be "initiating".

**Validates: Requirements 11.1**

### Property 21: State transitions follow valid paths

*For any* call, state transitions should only follow valid paths in the state machine (initiating→ringing→active→ended, etc.), rejecting invalid transitions.

**Validates: Requirements 11.2, 11.3, 11.4, 11.5**

### Property 22: Connection failure records reason

*For any* call that fails to establish, the end_reason should be set to "failed" and persisted.

**Validates: Requirements 13.3**

### Property 23: Error responses are descriptive

*For any* error condition (blocked user, busy user, invalid state), the error response should include a descriptive message indicating the specific failure type.

**Validates: Requirements 13.4**

### Property 24: Blocked users cannot initiate calls

*For any* pair of users where one has blocked the other, call initiation attempts should be rejected with an authorization error.

**Validates: Requirements 14.1, 14.2**

### Property 25: Unauthenticated requests are rejected

*For any* call-related API request without valid authentication, the request should be rejected with an authentication error.

**Validates: Requirements 14.3, 14.4**

### Property 26: Call history authorization

*For any* user requesting call history, only calls involving that user should be returned (no access to other users' calls).

**Validates: Requirements 14.5**

## Error Handling

### Error Categories

**Validation Errors (400)**:
- Invalid SDP offer/answer format
- Invalid ICE candidate format
- Missing required fields
- Invalid call type

**Authentication Errors (401)**:
- Missing or invalid Sanctum token
- Expired authentication token

**Authorization Errors (403)**:
- Blocked user attempting to call
- Non-participant attempting to control call
- User attempting to access another user's call history

**Not Found Errors (404)**:
- Call does not exist
- User does not exist

**Conflict Errors (422)**:
- User already in an active call
- Callee is offline
- Invalid state transition
- Cannot call self

**Server Errors (500)**:
- Database transaction failures
- Broadcasting service unavailable
- TURN server unavailable

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

All call state transitions use database transactions to ensure consistency:
```php
DB::beginTransaction();
try {
    // Update call state
    // Record timestamps
    // Broadcast events
    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();
    throw $e;
}
```

## Testing Strategy

### Dual Testing Approach

The Call System requires both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Validate specific examples, edge cases, and error conditions
- Specific call scenarios (successful call, declined call, missed call)
- Edge cases (offline user, busy user, blocked user)
- Error handling for invalid state transitions
- Integration with existing block relationships
- STUN/TURN configuration examples

**Property Tests**: Verify universal properties across all inputs
- Call state machine transitions across all valid paths
- Call history authorization across all users
- ICE candidate exchange for all active calls
- Duration calculation for all completed calls
- Event broadcasting for all call lifecycle events

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library**: Use Pest with Pest Property Testing plugin for Laravel
**Configuration**: Each property test must run minimum 100 iterations
**Tagging**: Each test must reference its design property using the format:
```php
// Feature: phase4-calls-video, Property 1: Call creation generates session with SDP offer
```

**Test Organization**:
- Group tests by feature area (call lifecycle, signaling, history, authorization)
- Each correctness property maps to exactly one property-based test
- Place property tests close to implementation to catch errors early
- Use Laravel's database transactions for test isolation
- Mock WebSocket broadcasting for testing event dispatch

### Integration Testing

**WebSocket Integration**:
- Test channel authorization callbacks
- Verify event broadcasting triggers correctly
- Test signaling message delivery

**Block Relationship Integration**:
- Test call initiation with blocked users
- Test call history filtering with blocked users

**Call State Integration**:
- Test complete call flows (initiate → answer → end)
- Test state machine transitions
- Test concurrent call handling

### Test Data Generation

For property-based tests, generate:
- Random users with various relationships (following, blocked, none)
- Random calls with different types (audio, video)
- Random call states and transitions
- Random SDP offers and answers
- Random ICE candidates
- Random call durations and timestamps

### Coverage Goals

- 100% of correctness properties implemented as property tests
- Edge cases covered by unit tests (offline, busy, blocked users)
- All error conditions tested
- Integration points between calls and existing features validated
- State machine transitions fully tested

## Implementation Notes

### WebRTC Signaling Flow

1. Caller initiates call via REST API
2. Server creates call record and broadcasts offer to callee
3. Callee receives offer via WebSocket
4. Callee answers via REST API
5. Server broadcasts answer to caller
6. Both peers exchange ICE candidates via REST API
7. Server relays ICE candidates via WebSocket
8. WebRTC connection establishes peer-to-peer
9. Either peer ends call via REST API
10. Server calculates duration and broadcasts end event

### STUN/TURN Configuration

Configuration stored in environment variables:
```env
STUN_SERVERS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
TURN_SERVER_URL=turn:turnserver.example.com:3478
TURN_SERVER_USERNAME=username
TURN_SERVER_CREDENTIAL=password
```

Returned via API endpoint:
```json
{
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" },
    { "urls": "stun:stun1.l.google.com:19302" },
    {
      "urls": "turn:turnserver.example.com:3478",
      "username": "username",
      "credential": "password"
    }
  ]
}
```

### Call Duration Calculation

Duration is calculated as the difference between answered_at and ended_at timestamps:
```php
$duration = $call->ended_at->diffInSeconds($call->answered_at);
```

For calls that were never answered (declined, missed, failed), duration remains null.

### User Availability Check

Before initiating a call, check if callee has an active call:
```php
$activeCall = Call::where(function($q) use ($callee) {
    $q->where('caller_id', $callee->id)
      ->orWhere('callee_id', $callee->id);
})->where('status', 'active')->first();

if ($activeCall) {
    throw new UserBusyException();
}
```

### Video Toggle Implementation

Video toggle doesn't modify the call record, it only broadcasts the state change:
```php
public function toggleVideo(Call $call, User $user, bool $enabled): void
{
    // Validate call is video type and active
    // Determine other participant
    // Broadcast VideoToggled event
    // No database update needed
}
```

## Future Enhancements

Potential improvements for future phases:
- Group audio/video calls (more than 2 participants)
- Screen sharing capability
- Call quality metrics and monitoring
- Automatic call recording with consent
- Voicemail for missed calls
- Call transfer functionality
- Conference room creation
- Call scheduling and reminders
- Integration with calendar systems
- Call analytics dashboard
