# Phase 5: Voice Rooms - Quick Reference

## Overview
Live group audio rooms with host controls, speaker management, and real-time reactions.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer {your_token}
```

---

## Room Management Endpoints

### List Public Rooms
```http
GET /rooms
```

**Query Parameters:**
- `per_page` (optional): Number of results per page (default: 15)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "host": { "id": 1, "username": "john_doe", ... },
      "title": "Language Learning Session",
      "description": "Practice English conversation",
      "is_public": true,
      "capacity": 50,
      "state": "active",
      "participant_count": 12,
      "speaker_count": 3,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 73
  }
}
```

### Create Room
```http
POST /rooms
```

**Request Body:**
```json
{
  "title": "Language Learning Session",
  "description": "Practice English conversation",
  "is_public": true,
  "capacity": 50
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Voice room created successfully",
  "data": {
    "id": 1,
    "host": { ... },
    "title": "Language Learning Session",
    "state": "active",
    ...
  }
}
```

### Get Room Details
```http
GET /rooms/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "host": { ... },
    "title": "Language Learning Session",
    "participants": [ ... ],
    ...
  }
}
```

### Update Room Settings (Host Only)
```http
PUT /rooms/{id}
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "is_public": false,
  "capacity": 100
}
```

### Close Room (Host Only)
```http
DELETE /rooms/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Room closed successfully"
}
```

### Get Room History
```http
GET /rooms/history
```

**Query Parameters:**
- `per_page` (optional): Number of results per page (default: 15)

---

## Participant Management Endpoints

### Join Room
```http
POST /rooms/{id}/join
```

**Response:**
```json
{
  "success": true,
  "message": "Joined room successfully",
  "data": {
    "room": { ... },
    "participant": {
      "id": 1,
      "user": { ... },
      "role": "audience",
      "joined_at": "2024-01-15T10:30:00Z",
      "can_speak": false
    }
  }
}
```

### Leave Room
```http
POST /rooms/{id}/leave
```

### Request to Speak
```http
POST /rooms/{id}/speak
```

**Response:**
```json
{
  "success": true,
  "message": "Speaker request sent successfully",
  "data": {
    "id": 1,
    "user": { ... },
    "status": "pending",
    "created_at": "2024-01-15T10:35:00Z"
  }
}
```

### Promote to Speaker (Host/Co-Host Only)
```http
POST /rooms/{id}/speakers/{userId}
```

### Demote Speaker (Host/Co-Host Only)
```http
DELETE /rooms/{id}/speakers/{userId}
```

### Kick Participant (Host/Co-Host Only)
```http
POST /rooms/{id}/kick/{userId}
```

---

## Co-Host Management Endpoints

### Add Co-Host (Host Only)
```http
POST /rooms/{id}/cohosts/{userId}
```

### Remove Co-Host (Host Only)
```http
DELETE /rooms/{id}/cohosts/{userId}
```

---

## Reaction Endpoints

### Send Reaction
```http
POST /rooms/{id}/reactions
```

**Request Body:**
```json
{
  "emoji": "👍"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reaction sent successfully"
}
```

---

## WebSocket Events

### Channel Authorization
Subscribe to room events:
```javascript
Echo.private(`voice-room.${roomId}`)
```

### Events

#### participant.joined
```json
{
  "participant": {
    "id": 1,
    "user": { ... },
    "role": "audience",
    "joined_at": "2024-01-15T10:30:00Z"
  },
  "participant_count": 13
}
```

#### participant.left
```json
{
  "user_id": 5
}
```

#### role.changed
```json
{
  "user_id": 5,
  "new_role": "speaker",
  "old_role": "audience"
}
```

#### speaker.requested
```json
{
  "request": {
    "id": 1,
    "user": { ... },
    "status": "pending",
    "created_at": "2024-01-15T10:35:00Z"
  }
}
```

#### reaction.sent
```json
{
  "user_id": 5,
  "emoji": "👍",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

#### room.updated
```json
{
  "room": {
    "id": 1,
    "title": "Updated Title",
    ...
  }
}
```

#### room.closed
```json
{}
```

#### participant.kicked
```json
{
  "user_id": 5
}
```

---

## Role Hierarchy

1. **Host** (highest privilege)
   - Create and close room
   - Update room settings
   - Add/remove co-hosts
   - Promote/demote speakers
   - Kick any participant
   - Can speak

2. **Co-Host**
   - Promote/demote speakers
   - Kick participants (except host and other co-hosts)
   - Can speak

3. **Speaker**
   - Can speak

4. **Audience** (lowest privilege)
   - Can listen only
   - Can request to speak

---

## Constraints

- **Room Capacity**: 2-500 participants (default: 50)
- **Speaker Limit**: Maximum 20 simultaneous speakers (includes host, co-hosts, and speakers)
- **Reactions**: Not persisted, broadcast only
- **Host Transfer**: Automatic when host leaves (priority: co-host → speaker → audience)

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "This room is at capacity"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Only the host can perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Room not found"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "capacity": ["Room capacity must be at least 2 participants"]
  }
}
```

---

## Testing with Postman

1. Import the Postman collection (if available)
2. Set environment variable `base_url` to `http://localhost:8000/api/v1`
3. Set `token` variable after login
4. Test room creation, joining, and real-time events

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- WebRTC audio connections are handled client-side (P2P mesh)
- Blocked users cannot join rooms hosted by the blocker
- Kicked users can rejoin the same room
- Empty rooms auto-close after 5 minutes
