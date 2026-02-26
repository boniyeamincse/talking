# Phase 4: Calls & Video - Setup Guide

## Overview

Phase 4 implements WebRTC-based audio and video calling capabilities for the Talkin messaging platform. This includes real-time peer-to-peer communication with proper signaling infrastructure, NAT traversal support, and comprehensive call history tracking.

## Features Implemented

### Audio Calls
- ✅ Call initiation with SDP offer
- ✅ Call answering with SDP answer
- ✅ Call declining
- ✅ Call termination with duration tracking
- ✅ ICE candidate exchange for NAT traversal
- ✅ Call history with pagination
- ✅ STUN/TURN server configuration

### Video Calls
- ✅ Video call initiation
- ✅ Video call answering
- ✅ Video call declining
- ✅ Video call termination
- ✅ ICE candidate exchange
- ✅ Camera toggle (on/off)
- ✅ Video call history

### WebRTC Infrastructure
- ✅ WebSocket signaling via Laravel Broadcasting
- ✅ STUN/TURN server configuration
- ✅ Call state management
- ✅ Block relationship integration
- ✅ Authorization and permissions

## Database Schema

### Calls Table
```sql
- id (bigint, primary key)
- caller_id (foreign key to users)
- callee_id (foreign key to users)
- type (enum: 'audio', 'video')
- status (enum: 'initiating', 'ringing', 'active', 'ended', 'declined', 'failed', 'missed')
- initiated_at (timestamp)
- answered_at (timestamp, nullable)
- ended_at (timestamp, nullable)
- duration (integer, seconds, nullable)
- end_reason (enum: 'completed', 'declined', 'missed', 'failed', 'cancelled', nullable)
- created_at, updated_at
```

### Call Recordings Table (Optional)
```sql
- id (bigint, primary key)
- call_id (foreign key to calls)
- file_path (string)
- file_size (integer, bytes)
- duration (integer, seconds)
- created_at, updated_at
```

## API Endpoints

### Audio Call Endpoints
```
POST   /api/v1/calls/initiate          - Initiate audio call
POST   /api/v1/calls/{id}/answer       - Answer incoming call
POST   /api/v1/calls/{id}/decline      - Decline incoming call
POST   /api/v1/calls/{id}/end          - End active call
POST   /api/v1/calls/{id}/ice-candidate - Exchange ICE candidate
GET    /api/v1/calls/history           - Get call history (paginated)
GET    /api/v1/calls/config            - Get STUN/TURN configuration
```

### Video Call Endpoints
```
POST   /api/v1/video/initiate          - Initiate video call
POST   /api/v1/video/{id}/answer       - Answer video call
POST   /api/v1/video/{id}/decline      - Decline video call
POST   /api/v1/video/{id}/end          - End video call
POST   /api/v1/video/{id}/ice-candidate - Exchange ICE candidate
POST   /api/v1/video/{id}/toggle-video - Toggle camera on/off
GET    /api/v1/video/history           - Get video call history
```

## WebSocket Events

### Call Signaling Events
- `call.initiated` - Broadcast to callee when call is initiated
- `call.answered` - Broadcast to caller when call is answered
- `call.declined` - Broadcast to caller when call is declined
- `call.ended` - Broadcast to both participants when call ends
- `call.ice-candidate` - Broadcast ICE candidates to remote peer
- `call.video-toggled` - Broadcast video state changes

### Channel Authorization
```php
// User private channel
Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    return (int) $user->id === (int) $userId;
});
```

## Configuration

### Environment Variables

Add to your `.env` file:

```env
# WebRTC STUN/TURN Server Configuration
STUN_SERVERS="stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302"
TURN_SERVER_URL=
TURN_SERVER_USERNAME=
TURN_SERVER_CREDENTIAL=
```

### Broadcasting Configuration

For production, configure Laravel Broadcasting with Pusher, Soketi, or Laravel Echo Server:

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=mt1
```

## Testing

### Using Postman

1. Import the `Talkin_API_Phase4.postman_collection.json` file
2. Set up environment variables:
   - `base_url`: http://localhost:8000/api/v1
   - `token`: Your authentication token
3. Test the endpoints in order:
   - Get STUN/TURN config
   - Initiate a call
   - Answer/decline the call
   - Exchange ICE candidates
   - End the call
   - View call history

### WebRTC Client Integration

To integrate with a WebRTC client:

1. **Get STUN/TURN Configuration**
   ```javascript
   const response = await fetch('/api/v1/calls/config', {
     headers: { 'Authorization': `Bearer ${token}` }
   });
   const config = await response.json();
   ```

2. **Create RTCPeerConnection**
   ```javascript
   const peerConnection = new RTCPeerConnection(config.data);
   ```

3. **Initiate Call**
   ```javascript
   const offer = await peerConnection.createOffer();
   await peerConnection.setLocalDescription(offer);
   
   const response = await fetch('/api/v1/calls/initiate', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       callee_id: calleeId,
       sdp_offer: {
         type: offer.type,
         sdp: offer.sdp
       }
     })
   });
   ```

4. **Listen for WebSocket Events**
   ```javascript
   Echo.private(`user.${userId}`)
     .listen('.call.initiated', (e) => {
       // Handle incoming call
       const remoteSdp = new RTCSessionDescription(e.sdp_offer);
       await peerConnection.setRemoteDescription(remoteSdp);
     })
     .listen('.call.answered', (e) => {
       // Handle call answered
       const remoteSdp = new RTCSessionDescription(e.sdp_answer);
       await peerConnection.setRemoteDescription(remoteSdp);
     })
     .listen('.call.ice-candidate', (e) => {
       // Handle ICE candidate
       await peerConnection.addIceCandidate(e.candidate);
     });
   ```

5. **Exchange ICE Candidates**
   ```javascript
   peerConnection.onicecandidate = async (event) => {
     if (event.candidate) {
       await fetch(`/api/v1/calls/${callId}/ice-candidate`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           candidate: event.candidate
         })
       });
     }
   };
   ```

## Call Flow

### Successful Call Flow

```
1. Caller initiates call
   POST /api/v1/calls/initiate
   → Creates call record with status 'initiating'
   → Broadcasts CallInitiated event to callee

2. Callee receives call notification
   WebSocket: call.initiated event
   → Displays incoming call UI

3. Callee answers call
   POST /api/v1/calls/{id}/answer
   → Updates call status to 'active'
   → Broadcasts CallAnswered event to caller

4. Both peers exchange ICE candidates
   POST /api/v1/calls/{id}/ice-candidate
   → Broadcasts ICECandidateReceived to remote peer
   → WebRTC connection establishes

5. Media flows peer-to-peer
   → Audio/video streams directly between clients

6. Either participant ends call
   POST /api/v1/calls/{id}/end
   → Calculates duration
   → Updates status to 'ended'
   → Broadcasts CallEnded to both participants
```

### Call States

```
initiating → ringing → active → ended
    ↓            ↓        ↓
cancelled   declined  failed
              missed
```

## Security & Authorization

### Authentication
- All endpoints require `auth:sanctum` middleware
- Bearer token must be included in Authorization header

### Authorization Rules
- Only call participants can control the call
- Blocked users cannot initiate calls
- Users cannot call themselves
- Users already in a call cannot receive new calls

### Middleware
- `CheckCallParticipant` - Validates user is caller or callee

## Error Handling

### Common Errors

**400 Bad Request**
- Invalid SDP offer/answer format
- Missing required fields

**401 Unauthorized**
- Missing or invalid authentication token

**403 Forbidden**
- Blocked user attempting to call
- Non-participant attempting to control call

**404 Not Found**
- Call does not exist
- User does not exist

**422 Unprocessable Entity**
- User already in another call
- Invalid call state transition
- Cannot call yourself

## Performance Considerations

### Database Indexes
- `caller_id` - Fast lookup of calls by caller
- `callee_id` - Fast lookup of calls by callee
- `status` - Filter active calls
- `created_at` - Ordered call history

### Optimization Tips
1. Use pagination for call history (default: 15 per page)
2. Eager load relationships (caller, callee) to avoid N+1 queries
3. Consider archiving old call records after 90 days
4. Monitor TURN server usage (bandwidth costs)

## Troubleshooting

### Calls Not Connecting
1. Check STUN/TURN server configuration
2. Verify WebSocket connection is active
3. Check firewall/NAT settings
4. Ensure both clients have proper ICE candidate exchange

### WebSocket Events Not Received
1. Verify broadcasting is configured (not using 'log' driver)
2. Check channel authorization in routes/channels.php
3. Ensure Laravel Echo is properly configured on client
4. Verify user is authenticated

### Call Duration Not Calculated
- Duration is only calculated for answered calls
- Declined/missed calls have null duration
- Check that `answered_at` timestamp is set

## Next Steps

1. **Implement Call Recording** (Optional)
   - Task 12 in the implementation plan
   - Requires media server integration

2. **Add Call Quality Metrics**
   - Track connection quality
   - Monitor packet loss, jitter, latency

3. **Implement Group Calls**
   - Multi-party conferencing
   - Requires SFU (Selective Forwarding Unit)

4. **Add Push Notifications**
   - Notify users of incoming calls when app is closed
   - Integrate with FCM/APNs

## Resources

- [WebRTC Documentation](https://webrtc.org/)
- [Laravel Broadcasting](https://laravel.com/docs/broadcasting)
- [Laravel Echo](https://laravel.com/docs/broadcasting#client-side-installation)
- [STUN/TURN Servers](https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Test with Postman collection
4. Verify WebSocket connection
