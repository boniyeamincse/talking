# 🧩 API Modules – Talkin (Laravel)

## Module List

| Module | Base Path | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Registration, login, token management |
| User | `/api/v1/users` | User account management |
| Profile | `/api/v1/profiles` | Profile data and settings |
| Chat | `/api/v1/chat` | Messaging and conversations |
| Call | `/api/v1/calls` | Audio call management |
| Video | `/api/v1/video` | Video call management |
| Voice Room | `/api/v1/rooms` | Voice room creation and management |
| Feed / Post | `/api/v1/posts` | Social feed and posts |
| Comment | `/api/v1/comments` | Post comments |
| Like | `/api/v1/likes` | Like/unlike actions |
| Gift | `/api/v1/gifts` | Virtual gift system |
| Translation | `/api/v1/translations` | Message/post translation |
| Matching | `/api/v1/matching` | Partner matching system |
| Notification | `/api/v1/notifications` | In-app notification management |
| Admin | `/api/v1/admin` | Admin-only endpoints |
| Report | `/api/v1/reports` | Content and user reporting |

---

## Auth Module

**Responsibility:** Handle user authentication and token lifecycle.

| Endpoint | Method | Description |
|---|---|---|
| `/auth/register` | POST | Create new account |
| `/auth/login` | POST | Login with credentials |
| `/auth/logout` | POST | Invalidate token |
| `/auth/refresh` | POST | Refresh JWT token |
| `/auth/forgot-password` | POST | Send password reset email |
| `/auth/reset-password` | POST | Reset password with token |
| `/auth/verify-email` | GET | Verify email address |
| `/auth/social/google` | POST | Google OAuth login |
| `/auth/social/apple` | POST | Apple Sign In |

---

## User Module

**Responsibility:** User account data and settings.

| Endpoint | Method | Description |
|---|---|---|
| `/users/me` | GET | Get own user data |
| `/users/me` | PUT | Update account settings |
| `/users/{id}` | GET | Get public user profile |
| `/users/search` | GET | Search users by name/username |
| `/users/{id}/block` | POST | Block a user |
| `/users/{id}/unblock` | POST | Unblock a user |
| `/users/blocked` | GET | List blocked users |
| `/users/{id}/follow` | POST | Follow a user |
| `/users/{id}/unfollow` | POST | Unfollow a user |
| `/users/{id}/followers` | GET | Get follower list |
| `/users/{id}/following` | GET | Get following list |

---

## Profile Module

**Responsibility:** Extended user profile including languages and interests.

| Endpoint | Method | Description |
|---|---|---|
| `/profiles/me` | GET | Get own profile |
| `/profiles/me` | PUT | Update profile |
| `/profiles/me/photo` | POST | Upload profile photo |
| `/profiles/me/languages` | PUT | Update language settings |
| `/profiles/me/interests` | PUT | Update interests |
| `/profiles/{id}` | GET | Get another user's profile |

---

## Chat Module

**Responsibility:** 1-to-1 and group messaging.

| Endpoint | Method | Description |
|---|---|---|
| `/chat/conversations` | GET | List all conversations |
| `/chat/conversations` | POST | Create new conversation |
| `/chat/conversations/{id}` | GET | Get conversation detail |
| `/chat/conversations/{id}/messages` | GET | Get messages (paginated) |
| `/chat/conversations/{id}/messages` | POST | Send a message |
| `/chat/conversations/{id}/messages/{msgId}` | DELETE | Delete a message |
| `/chat/conversations/{id}/read` | POST | Mark conversation as read |
| `/chat/conversations/{id}/media` | POST | Upload media to conversation |
| `/chat/groups` | POST | Create group chat |
| `/chat/groups/{id}/members` | POST | Add member to group |
| `/chat/groups/{id}/members/{userId}` | DELETE | Remove member from group |
| `/chat/groups/{id}/leave` | POST | Leave a group |

---

## Call Module

**Responsibility:** Audio call signaling and history.

| Endpoint | Method | Description |
|---|---|---|
| `/calls/initiate` | POST | Start a call (send offer) |
| `/calls/{id}/answer` | POST | Answer an incoming call |
| `/calls/{id}/decline` | POST | Decline a call |
| `/calls/{id}/end` | POST | End active call |
| `/calls/{id}/ice-candidate` | POST | Exchange ICE candidate |
| `/calls/history` | GET | Get call history |
| `/calls/{id}` | GET | Get single call details |

---

## Video Module

**Responsibility:** Video call signaling (similar to Call module).

| Endpoint | Method | Description |
|---|---|---|
| `/video/initiate` | POST | Start a video call |
| `/video/{id}/answer` | POST | Answer video call |
| `/video/{id}/decline` | POST | Decline video call |
| `/video/{id}/end` | POST | End video call |
| `/video/{id}/ice-candidate` | POST | Exchange ICE candidate |
| `/video/{id}/toggle-video` | POST | Toggle video stream |
| `/video/history` | GET | Get video call history |

---

## Voice Room Module

| Endpoint | Method | Description |
|---|---|---|
| `/rooms` | GET | List public rooms |
| `/rooms` | POST | Create a room |
| `/rooms/{id}` | GET | Get room details |
| `/rooms/{id}` | PUT | Update room settings |
| `/rooms/{id}` | DELETE | Close/delete room |
| `/rooms/{id}/join` | POST | Join room as audience |
| `/rooms/{id}/leave` | POST | Leave room |
| `/rooms/{id}/speak` | POST | Request to speak |
| `/rooms/{id}/speakers/{userId}` | POST | Promote user to speaker |
| `/rooms/{id}/speakers/{userId}` | DELETE | Demote speaker to audience |
| `/rooms/{id}/cohosts/{userId}` | POST | Assign co-host |
| `/rooms/{id}/cohosts/{userId}` | DELETE | Remove co-host |
| `/rooms/{id}/kick/{userId}` | POST | Kick user from room |
| `/rooms/{id}/reactions` | POST | Send emoji reaction |

---

## Feed / Post Module

| Endpoint | Method | Description |
|---|---|---|
| `/posts` | GET | Get feed (paginated) |
| `/posts` | POST | Create a post |
| `/posts/{id}` | GET | Get single post |
| `/posts/{id}` | PUT | Edit own post |
| `/posts/{id}` | DELETE | Delete own post |
| `/posts/{id}/media` | POST | Upload post media |
| `/posts/{id}/share` | POST | Share a post |
| `/posts/{id}/save` | POST | Save a post |
| `/posts/saved` | GET | Get saved posts |

---

## Comment Module

| Endpoint | Method | Description |
|---|---|---|
| `/posts/{postId}/comments` | GET | Get post comments |
| `/posts/{postId}/comments` | POST | Add comment |
| `/comments/{id}` | PUT | Edit comment |
| `/comments/{id}` | DELETE | Delete comment |
| `/comments/{id}/like` | POST | Like a comment |

---

## Like Module

| Endpoint | Method | Description |
|---|---|---|
| `/posts/{id}/like` | POST | Like a post |
| `/posts/{id}/unlike` | DELETE | Unlike a post |
| `/posts/{id}/likes` | GET | Get post likers |

---

## Gift Module

| Endpoint | Method | Description |
|---|---|---|
| `/gifts` | GET | List available gifts |
| `/gifts/send` | POST | Send a gift |
| `/gifts/history` | GET | Get gift history |
| `/gifts/leaderboard` | GET | Get gift leaderboard |
| `/gifts/coins/balance` | GET | Get coin balance |
| `/gifts/coins/topup` | POST | Purchase coins |

---

## Translation Module

| Endpoint | Method | Description |
|---|---|---|
| `/translations/message/{id}` | GET | Translate a message |
| `/translations/post/{id}` | GET | Translate a post |
| `/translations/text` | POST | Translate arbitrary text |
| `/translations/languages` | GET | List supported languages |

---

## Matching Module

| Endpoint | Method | Description |
|---|---|---|
| `/matching/preferences` | GET | Get matching preferences |
| `/matching/preferences` | PUT | Update preferences |
| `/matching/suggestions` | GET | Get match suggestions |
| `/matching/accept/{userId}` | POST | Accept a match |
| `/matching/decline/{userId}` | POST | Decline a match |
| `/matching/matches` | GET | Get active matches |

---

## Notification Module

| Endpoint | Method | Description |
|---|---|---|
| `/notifications` | GET | Get all notifications |
| `/notifications/{id}/read` | POST | Mark as read |
| `/notifications/read-all` | POST | Mark all as read |
| `/notifications/settings` | GET | Get notification settings |
| `/notifications/settings` | PUT | Update notification settings |

---

## Report Module

| Endpoint | Method | Description |
|---|---|---|
| `/reports` | POST | Submit a report |
| `/reports/my` | GET | Get own submitted reports |

---

## Admin Module

Admin endpoints are split by role access level.

### Super Admin Only

| Endpoint | Method | Description |
|---|---|---|
| `/admin/users` | GET | List all users |
| `/admin/users/{id}` | GET | View user detail |
| `/admin/users/{id}/ban` | POST | Permanently ban a user |
| `/admin/users/{id}/suspend` | POST | Suspend a user |
| `/admin/users/{id}/restore` | POST | Restore banned/suspended user |
| `/admin/admins` | GET | List all Admin accounts |
| `/admin/admins` | POST | Create a new Admin account |
| `/admin/admins/{id}` | PUT | Update Admin permissions |
| `/admin/admins/{id}` | DELETE | Remove Admin account |
| `/admin/gifts` | GET | List gifts |
| `/admin/gifts` | POST | Create a gift |
| `/admin/gifts/{id}` | PUT | Update gift |
| `/admin/gifts/{id}` | DELETE | Remove gift |
| `/admin/analytics/overview` | GET | Platform overview stats |
| `/admin/analytics/calls` | GET | Call analytics |
| `/admin/analytics/revenue` | GET | Revenue analytics |
| `/admin/settings` | GET | Platform settings |
| `/admin/settings` | PUT | Update platform settings |

### Admin + Super Admin

| Endpoint | Method | Description |
|---|---|---|
| `/admin/reports` | GET | List all reports |
| `/admin/reports/{id}` | GET | View report detail |
| `/admin/reports/{id}/resolve` | POST | Resolve a report |
| `/admin/rooms` | GET | List all active rooms |
| `/admin/rooms/{id}/close` | POST | Force close a room |
| `/admin/users/{id}/warn` | POST | Issue a warning to a user |
| `/admin/analytics/users` | GET | User volume and activity stats |
