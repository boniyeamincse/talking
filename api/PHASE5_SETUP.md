# Phase 5: Voice Rooms - Setup Guide

## Overview
This guide covers the setup and testing of the Voice Rooms feature for the Talkin API.

## Prerequisites
- Completed Phase 1 (Authentication)
- Completed Phase 2 (Social Features)
- Completed Phase 3 (Chat System)
- Completed Phase 4 (Calls & Video)
- Laravel 11 installed
- Pusher account configured
- SQLite database

## Database Setup

The migrations have already been run. Verify the tables exist:

```bash
php artisan db:show
```

You should see:
- `voice_rooms`
- `voice_room_participants`
- `speaker_requests`

## Configuration

### 1. Broadcasting Configuration

Ensure Pusher is configured in `.env`:

```env
BROADCAST_DRIVER=pusher

PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=your_cluster
```

### 2. Queue Configuration

For real-time broadcasting, ensure queue is running:

```bash
php artisan queue:work
```

Or use sync driver for development:
```env
QUEUE_CONNECTION=sync
```

## Testing the API

### 1. Create a Voice Room

```bash
curl -X POST http://localhost:8000/api/v1/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "English Practice Session",
    "description": "Let'\''s practice English together",
    "is_public": true,
    "capacity": 50
  }'
```

### 2. List Public Rooms

```bash
curl -X GET http://localhost:8000/api/v1/rooms \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Join a Room

```bash
curl -X POST http://localhost:8000/api/v1/rooms/1/join \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Request to Speak

```bash
curl -X POST http://localhost:8000/api/v1/rooms/1/speak \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Promote to Speaker (as host)

```bash
curl -X POST http://localhost:8000/api/v1/rooms/1/speakers/2 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Send Reaction

```bash
curl -X POST http://localhost:8000/api/v1/rooms/1/reactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emoji": "👍"}'
```

### 7. Leave Room

```bash
curl -X POST http://localhost:8000/api/v1/rooms/1/leave \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## WebSocket Testing

### Using Laravel Echo (JavaScript)

```javascript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: process.env.MIX_PUSHER_APP_KEY,
    cluster: process.env.MIX_PUSHER_APP_CLUSTER,
    forceTLS: true,
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }
});

// Subscribe to room events
Echo.private(`voice-room.${roomId}`)
    .listen('.participant.joined', (e) => {
        console.log('Participant joined:', e.participant);
    })
    .listen('.participant.left', (e) => {
        console.log('Participant left:', e.user_id);
    })
    .listen('.role.changed', (e) => {
        console.log('Role changed:', e);
    })
    .listen('.speaker.requested', (e) => {
        console.log('Speaker requested:', e.request);
    })
    .listen('.reaction.sent', (e) => {
        console.log('Reaction:', e.emoji, 'from', e.user_id);
    })
    .listen('.room.updated', (e) => {
        console.log('Room updated:', e.room);
    })
    .listen('.room.closed', (e) => {
        console.log('Room closed');
    })
    .listen('.participant.kicked', (e) => {
        console.log('Participant kicked:', e.user_id);
    });
```

## Common Scenarios

### Scenario 1: Host Creates and Manages Room

1. User A creates a room (becomes host)
2. User B joins as audience
3. User B requests to speak
4. User A promotes User B to speaker
5. User C joins and is added as co-host by User A
6. User A closes the room

### Scenario 2: Host Transfer

1. User A creates a room (host)
2. User B joins and is promoted to co-host
3. User C joins as speaker
4. User A leaves (User B becomes host automatically)
5. User B leaves (User C becomes host automatically)

### Scenario 3: Speaker Management

1. Host creates room with 50 capacity
2. Multiple users join as audience
3. Host promotes users to speaker (max 20 speakers)
4. When limit reached, further promotions are rejected
5. Host demotes a speaker, freeing a slot
6. Another user can now be promoted

## Troubleshooting

### Issue: Events not broadcasting

**Solution:**
1. Check Pusher credentials in `.env`
2. Ensure queue worker is running: `php artisan queue:work`
3. Check Laravel logs: `tail -f storage/logs/laravel.log`
4. Verify channel authorization in `routes/channels.php`

### Issue: Cannot join room

**Possible causes:**
- Room is at capacity
- User is blocked by host
- Room is ended
- User is already in the room

### Issue: Cannot promote to speaker

**Possible causes:**
- Speaker limit reached (20 max)
- User is not in the room
- Requester is not host or co-host
- User is already a speaker

### Issue: Host transfer not working

**Check:**
- Are there other participants in the room?
- Is the queue worker running?
- Check the `transferHost()` method logic

## Performance Considerations

### Database Indexes

All necessary indexes are created in migrations:
- `voice_rooms`: host_id, state, is_public, created_at
- `voice_room_participants`: room_id, user_id, role, unique(room_id, user_id)
- `speaker_requests`: room_id, status, unique(room_id, user_id)

### Broadcasting Optimization

- Use Redis for queue driver in production
- Consider using Laravel Horizon for queue monitoring
- Use Pusher's presence channels for participant tracking (optional enhancement)

### Capacity Planning

- Default capacity: 50 participants
- Maximum capacity: 500 participants
- Speaker limit: 20 simultaneous speakers
- Consider server resources when setting high capacities

## Security Considerations

### Authentication
- All endpoints require Sanctum authentication
- WebSocket channels require authentication
- Channel authorization verifies participant status

### Authorization
- Host-only actions: close room, update settings, add/remove co-hosts
- Manager actions (host/co-host): promote/demote speakers, kick participants
- Role hierarchy enforced: co-hosts cannot affect other co-hosts or host

### Block Integration
- Blocked users cannot join rooms hosted by blocker
- Bidirectional block check (both directions)
- Generic error messages (don't reveal block status)

## Next Steps

1. Test all endpoints with Postman
2. Implement client-side WebRTC audio mesh
3. Add room analytics and metrics
4. Consider adding room recording feature
5. Implement scheduled rooms
6. Add room moderation tools

## API Documentation

See `PHASE5_QUICK_REFERENCE.md` for complete API documentation.

## Support

For issues or questions:
1. Check Laravel logs
2. Verify Pusher dashboard for event delivery
3. Test with Postman collection
4. Review the design document in `.kiro/specs/phase5-voice-rooms/`
