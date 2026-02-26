# Phase 4: Calls & Video - Quick Reference

## Audio Call Endpoints

### Initiate Audio Call
```http
POST /api/v1/calls/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "callee_id": 2,
  "sdp_offer": {
    "type": "offer",
    "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

### Answer Call
```http
POST /api/v1/calls/{id}/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "sdp_answer": {
    "type": "answer",
    "sdp": "v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

### Decline Call
```http
POST /api/v1/calls/{id}/decline
Authorization: Bearer {token}
```

### End Call
```http
POST /api/v1/calls/{id}/end
Authorization: Bearer {token}
```

### Exchange ICE Candidate
```http
POST /api/v1/calls/{id}/ice-candidate
Authorization: Bearer {token}
Content-Type: application/json

{
  "candidate": {
    "candidate": "candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

### Get Call History
```http
GET /api/v1/calls/history?per_page=15
Authorization: Bearer {token}
```

### Get STUN/TURN Config
```http
GET /api/v1/calls/config
Authorization: Bearer {token}
```

## Video Call Endpoints

### Initiate Video Call
```http
POST /api/v1/video/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "callee_id": 2,
  "sdp_offer": {
    "type": "offer",
    "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

### Answer Video Call
```http
POST /api/v1/video/{id}/answer
Authorization: Bearer {token}
Content-Type: application/json

{
  "sdp_answer": {
    "type": "answer",
    "sdp": "v=0\r\no=- 987654321 2 IN IP4 127.0.0.1\r\n..."
  }
}
```

### Decline Video Call
```http
POST /api/v1/video/{id}/decline
Authorization: Bearer {token}
```

### End Video Call
```http
POST /api/v1/video/{id}/end
Authorization: Bearer {token}
```

### Exchange ICE Candidate (Video)
```http
POST /api/v1/video/{id}/ice-candidate
Authorization: Bearer {token}
Content-Type: application/json

{
  "candidate": {
    "candidate": "candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  }
}
```

### Toggle Video
```http
POST /api/v1/video/{id}/toggle-video
Authorization: Bearer {token}
Content-Type: application/json

{
  "enabled": false
}
```

### Get Video Call History
```http
GET /api/v1/video/history?per_page=15
Authorization: Bearer {token}
```

## WebSocket Events

### Subscribe to User Channel
```javascript
Echo.private(`user.${userId}`)
```

### Listen for Call Events
```javascript
// Incoming call
.listen('.call.initiated', (event) => {
  console.log('Incoming call:', event.call);
  console.log('SDP Offer:', event.sdp_offer);
})

// Call answered
.listen('.call.answered', (event) => {
  console.log('Call answered:', event.call_id);
  console.log('SDP Answer:', event.sdp_answer);
})

// Call declined
.listen('.call.declined', (event) => {
  console.log('Call declined:', event.call_id);
})

// Call ended
.listen('.call.ended', (event) => {
  console.log('Call ended:', event.call_id);
  console.log('Duration:', event.duration, 'seconds');
  console.log('Reason:', event.end_reason);
})

// ICE candidate received
.listen('.call.ice-candidate', (event) => {
  console.log('ICE candidate from user:', event.from_user_id);
  console.log('Candidate:', event.candidate);
})

// Video toggled
.listen('.call.video-toggled', (event) => {
  console.log('User', event.user_id, 'video:', event.video_enabled);
})
```

## Response Formats

### Call Resource
```json
{
  "success": true,
  "message": "Call initiated successfully",
  "data": {
    "id": 1,
    "type": "audio",
    "status": "ringing",
    "initiated_at": "2024-01-04T10:30:00.000000Z",
    "answered_at": null,
    "ended_at": null,
    "duration": null,
    "end_reason": null,
    "caller": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    },
    "callee": {
      "id": 2,
      "username": "jane_smith",
      "email": "jane@example.com"
    },
    "created_at": "2024-01-04T10:30:00.000000Z",
    "updated_at": "2024-01-04T10:30:00.000000Z"
  }
}
```

### Call History Response
```json
{
  "success": true,
  "message": "Call history retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "type": "audio",
        "status": "ended",
        "initiated_at": "2024-01-04T10:30:00.000000Z",
        "answered_at": "2024-01-04T10:30:05.000000Z",
        "ended_at": "2024-01-04T10:35:00.000000Z",
        "duration": 295,
        "end_reason": "completed",
        "caller": { ... },
        "callee": { ... }
      }
    ],
    "links": { ... },
    "meta": {
      "current_page": 1,
      "per_page": 15,
      "total": 42
    }
  }
}
```

### STUN/TURN Config Response
```json
{
  "success": true,
  "message": "Configuration retrieved successfully",
  "data": {
    "iceServers": [
      {
        "urls": "stun:stun.l.google.com:19302"
      },
      {
        "urls": "stun:stun1.l.google.com:19302"
      },
      {
        "urls": "turn:turnserver.example.com:3478",
        "username": "username",
        "credential": "password"
      }
    ]
  }
}
```

## Call States

- `initiating` - Call is being set up
- `ringing` - Call is ringing at callee
- `active` - Call is in progress
- `ended` - Call completed successfully
- `declined` - Callee declined the call
- `failed` - Call failed to connect
- `missed` - Callee didn't answer
- `cancelled` - Caller cancelled before answer

## Error Codes

- `400` - Validation error (invalid SDP, missing fields)
- `401` - Unauthenticated (missing/invalid token)
- `403` - Unauthorized (blocked user, not participant)
- `404` - Not found (call or user doesn't exist)
- `422` - Unprocessable (user busy, invalid state, self-call)

## Common Error Messages

- "Cannot call yourself"
- "Cannot call this user" (blocked)
- "User is currently in another call"
- "Only the callee can answer this call"
- "Call cannot be answered in current state"
- "Only call participants can end this call"
- "Cannot toggle video on audio-only call"

## Environment Variables

```env
STUN_SERVERS="stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302"
TURN_SERVER_URL=turn:turnserver.example.com:3478
TURN_SERVER_USERNAME=username
TURN_SERVER_CREDENTIAL=password
```

## Testing Tips

1. **Test with two authenticated users**
   - User A initiates call to User B
   - User B receives WebSocket event
   - User B answers or declines

2. **Test ICE candidate exchange**
   - Both users should exchange candidates
   - Monitor WebSocket events

3. **Test call duration**
   - Answer a call
   - Wait a few seconds
   - End the call
   - Check duration in response

4. **Test blocked users**
   - Block a user
   - Try to call them
   - Should receive 403 error

5. **Test busy state**
   - User A calls User B
   - User C tries to call User B
   - Should receive "user busy" error
