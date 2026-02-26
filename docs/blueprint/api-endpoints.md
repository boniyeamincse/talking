# 🔌 REST API Endpoint Reference – Talkin

## Base URL
```
https://api.talkin.app/api/v1
```

## Auth Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

---

## Standard Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "meta": {
    "current_page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

---

## Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register new account |
| POST | `/auth/login` | ❌ | Login with email+password |
| POST | `/auth/logout` | ✅ | Logout (invalidate token) |
| POST | `/auth/refresh` | ✅ | Refresh access token |
| POST | `/auth/forgot-password` | ❌ | Send password reset email |
| POST | `/auth/reset-password` | ❌ | Reset with token |
| GET | `/auth/verify-email/{token}` | ❌ | Verify email address |
| POST | `/auth/social/google` | ❌ | Google OAuth |
| POST | `/auth/social/apple` | ❌ | Apple Sign In |

### POST `/auth/register`
```json
// Request
{
  "username": "yuki_tanaka",
  "email": "yuki@example.com",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123",
  "country_code": "JP",
  "native_language": "ja",
  "learning_language": "en"
}

// Response 201
{
  "success": true,
  "data": {
    "user": { "id": 1, "username": "yuki_tanaka", ... },
    "token": "eyJ..."
  }
}
```

### POST `/auth/login`
```json
// Request
{
  "email": "yuki@example.com",
  "password": "SecurePass123"
}

// Response 200
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJ...",
    "expires_at": "2026-03-01T10:00:00Z"
  }
}
```

---

## Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | ✅ | Get own user |
| PUT | `/users/me` | ✅ | Update own user |
| GET | `/users/{id}` | ✅ | Get user by ID |
| GET | `/users/search?q=` | ✅ | Search users |
| POST | `/users/{id}/block` | ✅ | Block user |
| DELETE | `/users/{id}/block` | ✅ | Unblock user |
| POST | `/users/{id}/follow` | ✅ | Follow user |
| DELETE | `/users/{id}/follow` | ✅ | Unfollow user |
| GET | `/users/{id}/followers` | ✅ | Get followers |
| GET | `/users/{id}/following` | ✅ | Get following |

---

## Profiles

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/profiles/me` | ✅ | Get own profile |
| PUT | `/profiles/me` | ✅ | Update profile |
| POST | `/profiles/me/photo` | ✅ | Upload avatar |
| PUT | `/profiles/me/languages` | ✅ | Update languages |
| PUT | `/profiles/me/interests` | ✅ | Update interests |
| GET | `/profiles/{id}` | ✅ | Get public profile |

### PUT `/profiles/me`
```json
// Request
{
  "display_name": "Yuki T.",
  "bio": "Japanese native, learning English and French 🌸",
  "country_code": "JP",
  "date_of_birth": "1998-05-12",
  "gender": "female",
  "is_public": true
}
```

---

## Chat

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/chat/conversations` | ✅ | List conversations |
| POST | `/chat/conversations` | ✅ | Create conversation |
| GET | `/chat/conversations/{id}` | ✅ | Get conversation |
| GET | `/chat/conversations/{id}/messages` | ✅ | Get messages |
| POST | `/chat/conversations/{id}/messages` | ✅ | Send message |
| DELETE | `/chat/messages/{id}` | ✅ | Delete message |
| POST | `/chat/conversations/{id}/read` | ✅ | Mark as read |
| POST | `/chat/groups` | ✅ | Create group chat |

### POST `/chat/conversations/{id}/messages`
```json
// Request
{
  "type": "text",
  "body": "Hello! How's your Japanese study going? 🌸",
  "reply_to_id": null
}

// With media:
{
  "type": "image",
  "media": "<file upload>",
  "body": null
}
```

---

## Calls

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/calls/initiate` | ✅ | Start audio call |
| POST | `/calls/{id}/answer` | ✅ | Answer call |
| POST | `/calls/{id}/decline` | ✅ | Decline call |
| POST | `/calls/{id}/end` | ✅ | End call |
| POST | `/calls/{id}/ice-candidate` | ✅ | Send ICE candidate |
| GET | `/calls/history` | ✅ | Call history |

### POST `/calls/initiate`
```json
// Request
{
  "callee_id": 42
}

// Response 201
{
  "success": true,
  "data": {
    "call_id": "abc-123",
    "ice_servers": [
      { "urls": "stun:stun.l.google.com:19302" },
      { "urls": "turn:turn.talkin.app:3478", "username": "...", "credential": "..." }
    ]
  }
}
```

---

## Video Calls

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/video/initiate` | ✅ | Start video call |
| POST | `/video/{id}/answer` | ✅ | Answer video call |
| POST | `/video/{id}/decline` | ✅ | Decline video call |
| POST | `/video/{id}/end` | ✅ | End video call |
| POST | `/video/{id}/ice-candidate` | ✅ | Send ICE candidate |
| POST | `/video/{id}/toggle-video` | ✅ | Toggle video on/off |
| GET | `/video/history` | ✅ | Video call history |

---

## Voice Rooms

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/rooms` | ✅ | List public rooms |
| POST | `/rooms` | ✅ | Create room |
| GET | `/rooms/{id}` | ✅ | Get room detail |
| PUT | `/rooms/{id}` | ✅ | Update room (host only) |
| DELETE | `/rooms/{id}` | ✅ | Close room (host only) |
| POST | `/rooms/{id}/join` | ✅ | Join room |
| POST | `/rooms/{id}/leave` | ✅ | Leave room |
| POST | `/rooms/{id}/speak` | ✅ | Request to speak |
| POST | `/rooms/{id}/speakers/{userId}` | ✅ | Promote to speaker |
| DELETE | `/rooms/{id}/speakers/{userId}` | ✅ | Demote speaker |
| POST | `/rooms/{id}/cohosts/{userId}` | ✅ | Add co-host |
| DELETE | `/rooms/{id}/cohosts/{userId}` | ✅ | Remove co-host |
| POST | `/rooms/{id}/kick/{userId}` | ✅ | Kick user |
| POST | `/rooms/{id}/reactions` | ✅ | Send reaction |

---

## Posts / Feed

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/posts` | ✅ | Get feed |
| POST | `/posts` | ✅ | Create post |
| GET | `/posts/{id}` | ✅ | Get post |
| PUT | `/posts/{id}` | ✅ | Edit post |
| DELETE | `/posts/{id}` | ✅ | Delete post |
| POST | `/posts/{id}/like` | ✅ | Like post |
| DELETE | `/posts/{id}/like` | ✅ | Unlike post |
| POST | `/posts/{id}/save` | ✅ | Save post |
| GET | `/posts/saved` | ✅ | Get saved posts |
| GET | `/posts/{id}/comments` | ✅ | Get comments |
| POST | `/posts/{id}/comments` | ✅ | Add comment |
| DELETE | `/comments/{id}` | ✅ | Delete comment |

### POST `/posts`
```json
// Request (multipart/form-data for media)
{
  "type": "photo",
  "body": "Cherry blossoms today in Tokyo 🌸 #sakura",
  "visibility": "public",
  "language_id": 1,
  "media": ["<file1>", "<file2>"]
}
```

---

## Gifts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/gifts` | ✅ | List gift catalog |
| POST | `/gifts/send` | ✅ | Send a gift |
| GET | `/gifts/history` | ✅ | Gift history |
| GET | `/gifts/leaderboard` | ✅ | Gift leaderboard |
| GET | `/gifts/coins/balance` | ✅ | Coin balance |
| POST | `/gifts/coins/topup` | ✅ | Purchase coins |

### POST `/gifts/send`
```json
// Request
{
  "gift_id": 3,
  "receiver_id": 42,
  "context": "chat",
  "context_id": 789
}

// Response
{
  "success": true,
  "data": {
    "transaction_id": 101,
    "coin_balance_after": 340
  }
}
```

---

## Translations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/translations/message/{id}?lang=en` | ✅ | Translate message |
| GET | `/translations/post/{id}?lang=en` | ✅ | Translate post |
| POST | `/translations/text` | ✅ | Translate arbitrary text |
| GET | `/translations/languages` | ❌ | List supported languages |

### POST `/translations/text`
```json
// Request
{
  "text": "おはようございます",
  "target_lang": "en",
  "source_lang": "ja"
}

// Response
{
  "success": true,
  "data": {
    "original": "おはようございます",
    "translated": "Good morning",
    "source_lang": "ja",
    "target_lang": "en",
    "engine": "google"
  }
}
```

---

## Matching

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/matching/preferences` | ✅ | Get preferences |
| PUT | `/matching/preferences` | ✅ | Update preferences |
| GET | `/matching/suggestions` | ✅ | Get match suggestions |
| POST | `/matching/accept/{userId}` | ✅ | Accept match |
| POST | `/matching/decline/{userId}` | ✅ | Decline match |
| GET | `/matching/matches` | ✅ | List active matches |

---

## Notifications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | ✅ | Get notifications |
| POST | `/notifications/{id}/read` | ✅ | Mark as read |
| POST | `/notifications/read-all` | ✅ | Mark all read |
| GET | `/notifications/settings` | ✅ | Get settings |
| PUT | `/notifications/settings` | ✅ | Update settings |
| POST | `/notifications/device-token` | ✅ | Register FCM token |
| DELETE | `/notifications/device-token` | ✅ | Remove FCM token |

---

## Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/reports` | ✅ | Submit report |
| GET | `/reports/my` | ✅ | Own submitted reports |

### POST `/reports`
```json
{
  "reportable_type": "post",
  "reportable_id": 234,
  "reason": "hate_speech",
  "description": "This post contains offensive content targeting a specific group."
}
```

---

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No Content (delete success) |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limit Exceeded |
| 500 | Server Error |
