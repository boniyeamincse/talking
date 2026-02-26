# 📞 WebRTC Call Flow – Talkin

## Overview

Talkin uses WebRTC for peer-to-peer audio and video calls. The signaling is handled via the Laravel WebSocket server (Laravel Echo / Socket.io), while the actual media streams (audio/video) travel directly between the two clients.

---

## Components

| Component | Role |
|---|---|
| **Signaling Server** | Exchanges SDP offers/answers and ICE candidates via WebSocket |
| **STUN Server** | Helps clients discover their public IP (e.g., Google STUN) |
| **TURN Server** | Relays media when direct P2P is blocked by NAT/firewall |
| **Client A** | The caller |
| **Client B** | The callee |

---

## Full Call Flow

### Step 1: Call Initiation

```
Client A (Caller)
  │
  ├─ POST /api/v1/calls/initiate
  │   { callee_id: 42 }
  │
  └─ Server creates call record (status: ringing)
      └─ Broadcasts via WebSocket to Client B:
          {
            event: 'call.incoming',
            call_id: 'abc-123',
            caller: { id: 1, name: '@yuki', avatar: '...' },
            type: 'audio'
          }
```

---

### Step 2: Callee Response

**If Accepted:**
```
Client B
  └─ POST /api/v1/calls/abc-123/answer
      └─ Server updates call status: ongoing
          └─ Notifies Client A: 'call.answered'
```

**If Declined:**
```
Client B
  └─ POST /api/v1/calls/abc-123/decline
      └─ Server updates call status: declined
          └─ Notifies Client A: 'call.declined'
```

**If No Answer (timeout ~30s):**
```
Server
  └─ Updates call status: missed
      └─ Sends missed call notification to Client A
      └─ Sends missed call notification to Client B
```

---

### Step 3: WebRTC Signaling (SDP Exchange)

```
Client A                    Signaling Server               Client B
   │                               │                          │
   │  1. createOffer()             │                          │
   │  2. setLocalDescription()     │                          │
   │── 3. Send SDP Offer ─────────►│                          │
   │       { sdp: '...', type:'offer' }                       │
   │                               │── 4. Relay Offer ───────►│
   │                               │                          │
   │                               │      5. setRemoteDescription()
   │                               │      6. createAnswer()
   │                               │      7. setLocalDescription()
   │                               │◄─ 8. Send SDP Answer ────│
   │◄─ 9. Relay Answer ────────────│      { sdp:'...', type:'answer' }
   │                               │                          │
   │  10. setRemoteDescription()   │                          │
```

---

### Step 4: ICE Candidate Exchange

```
Client A                    Signaling Server               Client B
   │                               │                          │
   │── ICE Candidate ─────────────►│                          │
   │   { candidate: '...', sdpMid: '...' }                    │
   │                               │── Relay to Client B ────►│
   │                               │                          │
   │◄──────────────────────────────│◄─ ICE Candidate ─────────│
   │   (Relay from Client B)       │                          │
   │                               │                          │
   │  (Multiple candidates exchanged until best path found)   │
```

---

### Step 5: Direct Media Connection Established

```
Client A ════════════════ P2P Media Stream ════════════════ Client B
           (DTLS-SRTP encrypted audio and/or video)

   If P2P fails (blocked NAT):
Client A ═════ TURN Relay ═════ TURN Server ═════ TURN Relay ═════ Client B
```

---

### Step 6: Call End

```
Client A or B
  └─ POST /api/v1/calls/abc-123/end
      └─ Server updates: status=ended, ended_at, duration
          └─ Notifies other party: 'call.ended'
          └─ Both clients close RTCPeerConnection
```

---

## Video Call Differences

Video calls follow the identical flow with these additions:

- `type: 'video'` in initiation payload
- `getUserMedia({ video: true, audio: true })` instead of audio-only
- Additional signals:
  - `video.toggle` — client notifies peer of video on/off state
  - `audio.toggle` — mute state change

---

## WebSocket Event Reference

| Event | Direction | Description |
|---|---|---|
| `call.incoming` | Server → Client B | Notify callee of incoming call |
| `call.answered` | Server → Client A | Callee accepted |
| `call.declined` | Server → Client A | Callee declined |
| `call.ended` | Server → Both | Call ended |
| `call.missed` | Server → Client A | Callee didn't answer |
| `webrtc.offer` | Client A → Server → Client B | SDP offer |
| `webrtc.answer` | Client B → Server → Client A | SDP answer |
| `webrtc.ice-candidate` | Both → Server → Other | ICE candidate |
| `call.video.toggle` | Either → Server → Other | Video on/off |
| `call.audio.toggle` | Either → Server → Other | Mute/unmute |

---

## STUN / TURN Configuration

```javascript
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:turn.talkin.app:3478',
      username: '<time-limited-credential>',
      credential: '<hmac-secret>'
    }
  ]
};

const peerConnection = new RTCPeerConnection(iceServers);
```

**TURN Credential Rotation:**
- Credentials issued per call session from the API
- Expire after 24 hours or call end
- Stored in Redis with TTL

---

## Error Handling

| Error | Handling |
|---|---|
| Callee offline | Notify caller; trigger missed call push notification |
| ICE connection failed | Try TURN relay; fail gracefully with error message |
| Connection dropped | Auto-reconnect once; show "Call dropped" if failed |
| Permission denied (mic/camera) | Show user-friendly prompt to grant permissions |
| Incompatible browser | Fallback message with supported browser list |

---

## Voice Room WebRTC (Multi-speaker)

Voice rooms use a **Selective Forwarding Unit (SFU)** model for scalability rather than pure P2P, since multiple speakers need to connect simultaneously.

```
Speaker A ─────►│              │◄───── Speaker B
Speaker C ─────►│  SFU Server  │
Audience  ◄─────│              │
```

Recommended SFU: **mediasoup** or **LiveKit** (self-hosted)

For the MVP, voice rooms can use simpler mesh WebRTC (each speaker connected to each other) with a limit of ~8 speakers.
