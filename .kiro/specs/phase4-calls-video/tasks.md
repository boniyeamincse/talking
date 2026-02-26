# Implementation Plan: Phase 4 - Audio and Video Calls

## Overview

This implementation plan breaks down the WebRTC-based calling system into incremental coding tasks. The approach follows this sequence: database schema → models → services → events → controllers → testing. Each task builds on previous work, with property-based tests placed close to implementation to catch errors early.

## Tasks

- [x] 1. Set up database schema and migrations
  - Create calls table migration with all fields (caller_id, callee_id, type, status, timestamps, duration, end_reason)
  - Create call_recordings table migration (optional feature)
  - Add indexes for performance (caller_id, callee_id, status, created_at)
  - _Requirements: 1.1, 3.2, 5.5, 6.1, 12.3_

- [ ]* 1.1 Write property test for call persistence
  - **Property 11: Call persistence is immediate**
  - **Validates: Requirements 5.5**

- [x] 2. Create Call model with relationships and state management
  - [x] 2.1 Create Call model with fillable fields and casts
    - Define fillable array with all call fields
    - Add datetime casts for timestamp fields
    - Add integer cast for duration
    - _Requirements: 1.1, 3.2, 11.1_
  
  - [x] 2.2 Add relationships to User model
    - Define caller() belongsTo relationship
    - Define callee() belongsTo relationship
    - Define recording() hasOne relationship (optional)
    - _Requirements: 1.1, 5.2, 12.4_
  
  - [x] 2.3 Implement state check methods
    - Add isActive() method checking status = 'active'
    - Add canBeAnswered() method checking status = 'ringing'
    - Add canBeEnded() method checking status in ['active', 'ringing']
    - Add involvesUser(User $user) method
    - _Requirements: 11.1, 11.2, 11.3, 11.4_
  
  - [x] 2.4 Implement state transition methods
    - Add markAsRinging() method
    - Add markAsAnswered() method with timestamp
    - Add markAsEnded(string $reason) method with duration calculation
    - Add markAsDeclined() method
    - Add markAsFailed() method
    - _Requirements: 11.2, 11.3, 11.4, 11.5_
  
  - [x] 2.5 Add query scopes
    - Add scopeForUser(Builder $query, User $user) scope
    - Add scopeActive(Builder $query) scope
    - Add scopeByType(Builder $query, string $type) scope
    - _Requirements: 5.1, 14.5_

- [ ]* 2.6 Write property test for state transitions
  - **Property 21: State transitions follow valid paths**
  - **Validates: Requirements 11.2, 11.3, 11.4, 11.5**

- [ ]* 2.7 Write property test for initial state
  - **Property 20: New calls initialize in "initiating" state**
  - **Validates: Requirements 11.1**

- [x] 3. Create CallService for business logic
  - [x] 3.1 Create CallService class with dependency injection
    - Set up constructor with dependencies
    - _Requirements: 1.1, 2.1, 3.1_
  
  - [x] 3.2 Implement initiateCall method
    - Validate users are not blocked (check both directions)
    - Check callee availability (no active calls)
    - Validate caller and callee are different users
    - Create call record with 'initiating' status
    - Set initiated_at timestamp
    - Return call instance
    - _Requirements: 1.1, 1.4, 1.5, 14.1, 14.2_
  
  - [x] 3.3 Implement answerCall method
    - Validate user is the callee
    - Validate call status is 'ringing'
    - Update status to 'active'
    - Record answered_at timestamp
    - Return updated call
    - _Requirements: 2.1, 2.4_
  
  - [x] 3.4 Implement declineCall method
    - Validate user is the callee
    - Validate call can be declined (status = 'ringing')
    - Update status to 'declined'
    - Set end_reason to 'declined'
    - Return updated call
    - _Requirements: 2.2, 2.5_
  
  - [x] 3.5 Implement endCall method
    - Validate user is participant (caller or callee)
    - Validate call is active
    - Calculate duration (ended_at - answered_at)
    - Update status to 'ended'
    - Record ended_at and duration
    - Set end_reason to 'completed'
    - Return updated call
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [x] 3.6 Implement getCallHistory method
    - Query calls where user is caller or callee
    - Filter by type if specified
    - Order by initiated_at descending
    - Eager load caller and callee relationships
    - Paginate results
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 14.5_
  
  - [x] 3.7 Implement getUserCallStatus method
    - Check if user has active call (caller or callee)
    - Return active call or null
    - _Requirements: 1.5_
  
  - [x] 3.8 Implement getStunTurnConfig method
    - Parse STUN servers from environment
    - Parse TURN server with credentials from environment
    - Return ICE servers configuration array
    - _Requirements: 9.1, 9.2, 9.5_

- [ ]* 3.9 Write property test for call creation
  - **Property 1: Call creation generates session with SDP offer**
  - **Validates: Requirements 1.1, 1.2**

- [ ]* 3.10 Write property test for call answering
  - **Property 2: Call answering generates SDP answer and updates state**
  - **Validates: Requirements 2.1, 2.4**

- [ ]* 3.11 Write property test for call declining
  - **Property 3: Call declining updates state and records reason**
  - **Validates: Requirements 2.2, 2.5**

- [ ]* 3.12 Write property test for call termination
  - **Property 4: Call termination calculates and persists duration**
  - **Validates: Requirements 3.1, 3.2, 3.5**

- [ ]* 3.13 Write property test for call history completeness
  - **Property 7: Call history completeness**
  - **Validates: Requirements 5.1, 14.5**

- [ ]* 3.14 Write property test for call history fields
  - **Property 8: Call history includes required fields**
  - **Validates: Requirements 5.2**

- [ ]* 3.15 Write property test for call history pagination
  - **Property 9: Call history pagination respects page size**
  - **Validates: Requirements 5.3**

- [ ]* 3.16 Write property test for call history ordering
  - **Property 10: Call history ordered by recency**
  - **Validates: Requirements 5.4**

- [ ]* 3.17 Write property test for blocked user rejection
  - **Property 24: Blocked users cannot initiate calls**
  - **Validates: Requirements 14.1, 14.2**

- [ ]* 3.18 Write unit tests for edge cases
  - Test offline user error
  - Test busy user error
  - Test self-call prevention
  - _Requirements: 1.4, 1.5_

- [x] 4. Create broadcasting events for WebRTC signaling
  - [x] 4.1 Create CallInitiated event
    - Implement ShouldBroadcast interface
    - Broadcast to callee's private channel (user.{callee_id})
    - Include call details and SDP offer in broadcast data
    - _Requirements: 1.3, 10.1, 10.5_
  
  - [x] 4.2 Create CallAnswered event
    - Implement ShouldBroadcast interface
    - Broadcast to caller's private channel (user.{caller_id})
    - Include call_id and SDP answer in broadcast data
    - _Requirements: 2.3, 10.2, 10.5_
  
  - [x] 4.3 Create CallDeclined event
    - Implement ShouldBroadcast interface
    - Broadcast to caller's private channel
    - Include call_id in broadcast data
    - _Requirements: 2.2, 10.5_
  
  - [x] 4.4 Create CallEnded event
    - Implement ShouldBroadcast interface
    - Broadcast to both participants' private channels
    - Include call_id, duration, and end_reason in broadcast data
    - _Requirements: 3.3, 10.5_
  
  - [x] 4.5 Create ICECandidateReceived event
    - Implement ShouldBroadcast interface
    - Broadcast to other participant's private channel
    - Include call_id, from_user_id, and candidate data
    - _Requirements: 4.1, 10.3, 10.5_
  
  - [x] 4.6 Create VideoToggled event
    - Implement ShouldBroadcast interface
    - Broadcast to other participant's private channel
    - Include call_id, user_id, and video_enabled flag
    - _Requirements: 8.3, 10.5_

- [ ]* 4.7 Write property test for event broadcasting
  - **Property 17: Call initiation broadcasts to callee**
  - **Property 18: Call answer broadcasts to caller**
  - **Property 19: ICE candidates broadcast to remote peer**
  - **Validates: Requirements 10.1, 10.2, 10.3**

- [ ]* 4.8 Write property test for signaling message structure
  - **Property 16: Signaling events include call identifier**
  - **Validates: Requirements 10.5**

- [x] 5. Implement CallController for audio calls
  - [x] 5.1 Create CallController with authentication middleware
    - Set up controller extending BaseController
    - Apply auth:sanctum middleware
    - _Requirements: 14.3, 14.4_
  
  - [x] 5.2 Implement initiate endpoint
    - Validate request (callee_id, sdp_offer required)
    - Call CallService->initiateCall()
    - Broadcast CallInitiated event
    - Return 201 with call resource
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 5.3 Implement answer endpoint
    - Validate request (sdp_answer required)
    - Apply CheckCallParticipant middleware
    - Call CallService->answerCall()
    - Broadcast CallAnswered event
    - Return 200 with call resource
    - _Requirements: 2.1, 2.3, 2.4_
  
  - [x] 5.4 Implement decline endpoint
    - Apply CheckCallParticipant middleware
    - Call CallService->declineCall()
    - Broadcast CallDeclined event
    - Return 200 with success message
    - _Requirements: 2.2, 2.5_
  
  - [x] 5.5 Implement end endpoint
    - Apply CheckCallParticipant middleware
    - Call CallService->endCall()
    - Broadcast CallEnded event
    - Return 200 with call resource including duration
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [x] 5.6 Implement ice-candidate endpoint
    - Validate request (candidate required)
    - Apply CheckCallParticipant middleware
    - Call CallService->exchangeIceCandidate()
    - Broadcast ICECandidateReceived event
    - Return 200 with success message
    - _Requirements: 4.1, 4.5_
  
  - [x] 5.7 Implement history endpoint
    - Call CallService->getCallHistory() with 'audio' filter
    - Return paginated call history
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 5.8 Implement config endpoint
    - Call CallService->getStunTurnConfig()
    - Return STUN/TURN server configuration
    - _Requirements: 9.1, 9.2, 9.5_

- [ ]* 5.9 Write property test for authentication requirement
  - **Property 25: Unauthenticated requests are rejected**
  - **Validates: Requirements 14.3, 14.4**

- [ ]* 5.10 Write property test for authorization
  - **Property 26: Call history authorization**
  - **Validates: Requirements 14.5**

- [x] 6. Implement VideoController for video calls
  - [x] 6.1 Create VideoController extending CallController patterns
    - Set up controller with authentication middleware
    - _Requirements: 14.3_
  
  - [x] 6.2 Implement video initiate endpoint
    - Validate request (callee_id, sdp_offer required)
    - Call CallService->initiateCall() with type='video'
    - Broadcast CallInitiated event
    - Return 201 with call resource
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 6.3 Implement video answer endpoint
    - Validate request (sdp_answer required)
    - Apply CheckCallParticipant middleware
    - Call CallService->answerCall()
    - Broadcast CallAnswered event
    - Return 200 with call resource
    - _Requirements: 7.1, 7.3_
  
  - [x] 6.4 Implement video decline endpoint
    - Apply CheckCallParticipant middleware
    - Call CallService->declineCall()
    - Broadcast CallDeclined event
    - Return 200 with success message
    - _Requirements: 7.2, 7.5_
  
  - [x] 6.5 Implement video end endpoint
    - Apply CheckCallParticipant middleware
    - Call CallService->endCall()
    - Broadcast CallEnded event
    - Return 200 with call resource
    - _Requirements: 3.1, 3.2_
  
  - [x] 6.6 Implement video ice-candidate endpoint
    - Validate request (candidate required)
    - Apply CheckCallParticipant middleware
    - Call CallService->exchangeIceCandidate()
    - Broadcast ICECandidateReceived event
    - Return 200 with success message
    - _Requirements: 4.1, 4.5_
  
  - [x] 6.7 Implement toggle-video endpoint
    - Validate request (enabled boolean required)
    - Apply CheckCallParticipant middleware
    - Validate call is video type and active
    - Call CallService->toggleVideo()
    - Broadcast VideoToggled event
    - Return 200 with success message
    - _Requirements: 8.5_
  
  - [x] 6.8 Implement video history endpoint
    - Call CallService->getCallHistory() with 'video' filter
    - Return paginated video call history
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 6.9 Write property test for video call type
  - **Property 12: Video call type is recorded**
  - **Validates: Requirements 6.1**

- [ ]* 6.10 Write property test for video SDP offers
  - **Property 13: Video SDP offers include video tracks**
  - **Validates: Requirements 6.2**

- [ ]* 6.11 Write property test for video SDP answers
  - **Property 14: Video call answering includes video tracks**
  - **Validates: Requirements 7.1**

- [ ]* 6.12 Write property test for video toggle
  - **Property 15: Video toggle broadcasts state change**
  - **Validates: Requirements 8.5**

- [x] 7. Create API resources for call responses
  - [x] 7.1 Create CallResource
    - Include all call fields (id, type, status, timestamps, duration, end_reason)
    - Include caller and callee user resources
    - Include recording resource when loaded (optional)
    - _Requirements: 5.2_
  
  - [x] 7.2 Create CallHistoryResource
    - Extend CallResource with additional metadata
    - Include participant details
    - Format timestamps for display
    - _Requirements: 5.2_

- [x] 8. Create CheckCallParticipant middleware
  - Validate call exists
  - Validate authenticated user is caller or callee
  - Return 403 if unauthorized
  - _Requirements: 14.1, 14.5_

- [x] 9. Add API routes for call endpoints
  - [x] 9.1 Add audio call routes
    - POST /api/calls/initiate
    - POST /api/calls/{id}/answer
    - POST /api/calls/{id}/decline
    - POST /api/calls/{id}/end
    - POST /api/calls/{id}/ice-candidate
    - GET /api/calls/history
    - GET /api/calls/config
    - Apply auth:sanctum middleware to all routes
    - _Requirements: 1.1, 2.1, 2.2, 3.1, 4.1, 5.1, 9.1_
  
  - [x] 9.2 Add video call routes
    - POST /api/video/initiate
    - POST /api/video/{id}/answer
    - POST /api/video/{id}/decline
    - POST /api/video/{id}/end
    - POST /api/video/{id}/ice-candidate
    - POST /api/video/{id}/toggle-video
    - GET /api/video/history
    - Apply auth:sanctum middleware to all routes
    - _Requirements: 6.1, 7.1, 7.2, 3.1, 4.1, 5.1_

- [x] 10. Add WebSocket channel authorization
  - Update routes/channels.php with user.{userId} channel
  - Verify user can only subscribe to their own channel
  - _Requirements: 10.1, 10.2, 10.3_

- [ ]* 10.1 Write property test for ICE candidate exchange
  - **Property 5: ICE candidate exchange broadcasts to remote peer**
  - **Validates: Requirements 4.1**

- [ ]* 10.2 Write property test for ICE candidate validation
  - **Property 6: ICE candidate validation before processing**
  - **Validates: Requirements 4.5**

- [x] 11. Configure STUN/TURN servers in environment
  - Add STUN_SERVERS to .env.example
  - Add TURN_SERVER_URL to .env.example
  - Add TURN_SERVER_USERNAME to .env.example
  - Add TURN_SERVER_CREDENTIAL to .env.example
  - Document configuration in setup guide
  - _Requirements: 9.1, 9.2, 9.5_

- [ ] 12. Implement call recording (optional feature)
  - [ ] 12.1 Create CallRecording model
    - Define fillable fields and relationships
    - Add getUrl() method for file access
    - _Requirements: 12.3, 12.4_
  
  - [ ] 12.2 Add recording methods to CallService
    - Implement startRecording() method
    - Implement stopRecording() method
    - Broadcast recording notifications
    - _Requirements: 12.2, 12.3_
  
  - [ ] 12.3 Add recording endpoints to controllers
    - POST /api/calls/{id}/recording/start
    - POST /api/calls/{id}/recording/stop
    - GET /api/calls/{id}/recording
    - _Requirements: 12.1, 12.2, 12.3_

- [ ]* 12.4 Write property test for recording association
  - **Property 4 (Recording): Recording associates with call**
  - **Validates: Requirements 12.4**

- [x] 13. Add error handling and validation
  - [x] 13.1 Create custom exceptions
    - UserBlockedException
    - UserBusyException
    - UserOfflineException
    - InvalidCallStateException
    - _Requirements: 1.4, 1.5, 11.5, 14.1_
  
  - [x] 13.2 Add validation rules
    - ValidateSdpOffer rule
    - ValidateSdpAnswer rule
    - ValidateIceCandidate rule
    - _Requirements: 4.5_
  
  - [x] 13.3 Implement exception handler responses
    - Map exceptions to appropriate HTTP status codes
    - Return descriptive error messages
    - _Requirements: 13.4_

- [ ]* 13.4 Write property test for error responses
  - **Property 23: Error responses are descriptive**
  - **Validates: Requirements 13.4**

- [ ]* 13.5 Write property test for connection failure handling
  - **Property 22: Connection failure records reason**
  - **Validates: Requirements 13.3**

- [x] 14. Checkpoint - Ensure all tests pass
  - Run all property tests and unit tests
  - Verify all migrations run successfully
  - Verify all routes are registered
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Create Postman collection for testing
  - Add all call endpoints with example requests
  - Add environment variables for testing
  - Include WebSocket connection examples
  - Document expected responses
  - _Requirements: All_

- [ ] 16. Update API documentation
  - Document all new endpoints
  - Add WebRTC signaling flow diagrams
  - Document STUN/TURN configuration
  - Add example client implementation guide
  - _Requirements: All_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- WebRTC media connections are peer-to-peer; API only handles signaling
- STUN/TURN servers must be configured before testing calls
- Broadcasting must be configured (Pusher/Reverb) for real-time signaling
- Call recording is an optional feature that can be implemented later
