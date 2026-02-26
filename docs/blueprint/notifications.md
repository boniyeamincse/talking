# 🔔 Notification System – Talkin

## Overview

Talkin uses a dual-channel notification system:
- **In-App Notifications** — stored in the database, delivered via WebSocket
- **Push Notifications** — delivered via Firebase Cloud Messaging (FCM) to mobile and web

---

## Notification Types

| Type | Trigger | In-App | Push |
|---|---|---|---|
| `message.new` | New chat message received | ✅ | ✅ |
| `call.incoming` | Incoming audio call | ✅ | ✅ |
| `call.missed` | Missed audio call | ✅ | ✅ |
| `video.incoming` | Incoming video call | ✅ | ✅ |
| `gift.received` | User received a gift | ✅ | ✅ |
| `match.new` | New partner match found | ✅ | ✅ |
| `match.accepted` | Match accepted by other user | ✅ | ✅ |
| `post.like` | Someone liked your post | ✅ | ❌ |
| `post.comment` | Someone commented on your post | ✅ | ✅ |
| `follow.new` | New follower | ✅ | ❌ |
| `room.invite` | Invited to a voice room | ✅ | ✅ |
| `system.announcement` | Platform-wide announcement | ✅ | ✅ |
| `coins.topup` | Coin purchase confirmed | ✅ | ✅ |

---

## Delivery Architecture

```
Event Occurs (e.g., new message)
         │
         ▼
  Laravel Job dispatched
         │
    ┌────┴────┐
    │         │
    ▼         ▼
In-App     Push Notification
(DB +      (FCM via Laravel
WebSocket)  Notification)
    │         │
    ▼         ▼
Stored in  Delivered to
notifications device via FCM
table
```

---

## Firebase Cloud Messaging (FCM) Integration

### Setup
- Each device registers with FCM on first launch
- FCM token stored in `device_tokens` table linked to `user_id`
- Multiple tokens per user (multiple devices)
- Tokens refreshed automatically; stale tokens pruned

### FCM Payload Structure

```json
{
  "to": "<fcm_token>",
  "notification": {
    "title": "New Message from @yuki",
    "body": "Hey! How's your Japanese practice going? 🌸",
    "icon": "notification_icon",
    "sound": "default"
  },
  "data": {
    "type": "message.new",
    "conversation_id": "123",
    "sender_id": "456",
    "click_action": "OPEN_CONVERSATION"
  }
}
```

### Platform Differences

| Platform | Method | Notes |
|---|---|---|
| Android | FCM Data + Notification | Background + foreground |
| iOS | FCM via APNs | Requires APNs certificate |
| Web (PWA) | FCM Web Push | Requires service worker |

---

## In-App Notification (WebSocket)

Real-time delivery via WebSocket when user is online:

```javascript
// Client subscribes to private channel
Echo.private(`user.${userId}`)
  .listen('.notification', (data) => {
    showNotificationToast(data);
    updateNotificationBadge();
  });
```

### WebSocket Event Payload

```json
{
  "event": ".notification",
  "data": {
    "id": 789,
    "type": "gift.received",
    "title": "Gift Received! 🌸",
    "body": "@hana sent you a Sakura gift",
    "data": {
      "gift_id": 3,
      "sender_id": 99,
      "animation": "sakura"
    },
    "is_read": false,
    "created_at": "2026-02-26T10:30:00Z"
  }
}
```

---

## Notification Settings

Users can control which notifications they receive:

```json
{
  "messages": true,
  "calls": true,
  "gifts": true,
  "matches": true,
  "likes": false,
  "comments": true,
  "follows": false,
  "system": true,
  "push_enabled": true,
  "quiet_hours": {
    "enabled": true,
    "start": "23:00",
    "end": "08:00",
    "timezone": "Asia/Tokyo"
  }
}
```

---

## `device_tokens` Table

```sql
CREATE TABLE device_tokens (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  token       VARCHAR(500) NOT NULL,
  platform    ENUM('android','ios','web') NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, token)
);
```

---

## Notification Aggregation

To prevent notification spam, similar notifications are grouped:

- Multiple likes on the same post → single "3 people liked your post"
- Multiple messages in the same conversation → single notification
- Group notifications batched every 60 seconds for inactive users

---

## Notification Retention

- In-app notifications kept for 90 days
- Read notifications cleaned up after 30 days
- Unread notifications kept until manually cleared or expiry
