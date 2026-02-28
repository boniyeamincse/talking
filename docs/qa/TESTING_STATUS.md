# 🧪 Talkin API — QA Testing Status

> **Base URL:** `http://localhost:8000/api/v1`
> **Last Updated:** 2026-02-26
> **Super Admin:** `admin@talkin.app` / `TalkinAdmin@2026!`

### Legend
| Symbol | Meaning |
|--------|---------|
| ⬜ | Not tested |
| ✅ | Passed |
| ❌ | Failed |
| ⚠️ | Partial / Has issues |

---

## Phase 0: Foundation & Setup

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 0.1 | Server starts | — | `php artisan serve` | ✅ | |
| 0.2 | Migrations run | — | `php artisan migrate` | ✅ | |
| 0.3 | Seeders run | — | `php artisan db:seed` | ✅ | |
| 0.4 | Health check | `GET` | `/up` | ✅ | |

---

## Phase 1: Authentication

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 1.1 | Register new user | `POST` | `/auth/register` | ✅ | Fixed: Added 'name' to create and Sanctum migrations |
| 1.2 | Register duplicate email | `POST` | `/auth/register` | ✅ | Returns 422 |
| 1.3 | Register duplicate username | `POST` | `/auth/register` | ✅ | Returns 422 |
| 1.4 | Login with email/password | `POST` | `/auth/login` | ✅ | |
| 1.5 | Login wrong password | `POST` | `/auth/login` | ✅ | |
| 1.6 | Logout | `POST` | `/auth/logout` | ✅ | |
| 1.7 | Refresh token | `POST` | `/auth/refresh` | ✅ | |
| 1.8 | Forgot password | `POST` | `/auth/forgot-password` | ⬜ | Body: `{email}` |
| 1.9 | Reset password | `POST` | `/auth/reset-password` | ⬜ | Body: `{token, email, password, password_confirmation}` |
| 1.10 | Resend verification email | `POST` | `/auth/resend-verification` | ⬜ | |
| 1.11 | Verify email | `GET` | `/auth/verify-email/{id}/{hash}` | ⬜ | Signed URL |

---

## Phase 2: User & Profile Management

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 2.1 | Get my user info | `GET` | `/users/me` | ✅ | |
| 2.2 | Update my user info | `PUT` | `/users/me` | ✅ | |
| 2.3 | View other user | `GET` | `/users/{id}` | ✅ | |
| 2.4 | Search users | `GET` | `/users/search` | ✅ | Fixed: Redis missing error in SearchCacheService |
| 2.5 | Popular searches | `GET` | `/users/popular-searches` | ✅ | |
| 2.6 | Get my profile | `GET` | `/profiles/me` | ✅ | |
| 2.7 | Update my profile | `PUT` | `/profiles/me` | ✅ | Fixed: cultural_interests validation |
| 2.8 | Upload profile photo | `POST` | `/profiles/me/photo` | ✅ | Requires multipart/form-data |
| 2.9 | Update my languages | `PUT` | `/profiles/me/languages` | ✅ | |
| 2.10 | View other profile | `GET` | `/profiles/{id}` | ✅ | |

---

## Phase 3: Social Features (Follow/Block)

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 3.1 | Follow user | `POST` | `/users/{id}/follow` | ✅ | |
| 3.2 | Unfollow user | `DELETE` | `/users/{id}/follow` | ✅ | |
| 3.3 | Get followers | `GET` | `/users/{id}/followers` | ✅ | Fixed: SQL updated_at error |
| 3.4 | Get following | `GET` | `/users/{id}/following` | ✅ | |
| 3.5 | Block user | `POST` | `/users/{id}/block` | ✅ | Removes follow records |
| 3.6 | Unblock user | `DELETE` | `/users/{id}/block` | ✅ | |
| 3.7 | List blocked users | `GET` | `/users/blocked` | ✅ | |
| 3.8 | Follow/Block self | `POST` | `/users/{self_id}/follow` | ✅ | Correctly returns 422 |
| 3.9 | Verify block safety | `GET` | `/profiles/{id}` | ✅ | Fixed: Added block check to ProfileController |

---

### Phase 4: Chat System
| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 4.1 | List conversations | `GET` | `/chat/conversations` | ✅ | Correctly returns latest message & info |
| 4.2 | Create DM conversation | `POST` | `/chat/conversations` | ✅ | Idempotent & returns metadata |
| 4.3 | View conversation detail | `GET` | `/chat/conversations/{id}` | ✅ | Full participant data return verified |
| 4.4 | Send typing indicator | `POST` | `/chat/conversations/{id}/typing` | ✅ | Event broadcasting verified (logical) |
| 4.5 | List messages in conversation | `GET` | `/chat/conversations/{id}/messages` | ✅ | Cursor pagination verified |
| 4.6 | Send text message | `POST` | `/chat/conversations/{id}/messages` | ✅ | Verified content & status 'sent' |
| 4.7 | Delete message | `DELETE` | `/chat/messages/{id}` | ✅ | Verified soft delete for sender |
| 4.8 | Mark conversation as read | `POST` | `/chat/conversations/{id}/read` | ✅ | Verified unread count reset |
| 4.9 | Send media message | `POST` | `/chat/conversations/{id}/media` | ✅ | Verified with real PNG uploads |
| 4.10 | Add message reaction | `POST` | `/chat/messages/{id}/reactions` | ✅ | Emojis supported & persisted |
| 4.11 | Remove message reaction | `DELETE` | `/chat/messages/{id}/reactions/{emoji}` | ✅ | Correctly handled |

**Fixes Applied:** Fixed method undefined errors in `ChatController`, `MessageController`, `ReactionController`, `GroupChatController`, `MediaMessageController`, `CallController`, and `VideoController` (renamed `sendResponse`/`sendError` to `successResponse`/`errorResponse`).

---

## Phase 5: Group Chat

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 5.1 | Create group | `POST` | `/chat/groups` | ✅ | Min 3 participants verified |
| 5.2 | Add member | `POST` | `/chat/groups/{id}/members` | ✅ | Dynamic growth verified |
| 5.3 | Remove member | `DELETE` | `/chat/groups/{id}/members/{userId}` | ✅ | Membership logic verified |
| 5.4 | Send group message | `POST` | `/chat/conversations/{id}/messages` | ✅ | Messaging in groups confirmed |
| 5.5 | View group messages | `GET` | `/chat/conversations/{id}/messages` | ✅ | History retrieval confirmed |
| 5.6 | Unauth access check | `GET` | `/chat/conversations/{id}/messages` | ✅ | Verified 403 for non-participants |

---

## Phase 6: Audio Calls

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 6.1 | Get STUN/TURN config | `GET` | `/calls/config` | ✅ | Returns iceServers |
| 6.2 | Initiate call | `POST` | `/calls/initiate` | ✅ | Fixed: Removed deprecated middleware call |
| 6.3 | Answer call | `POST` | `/calls/{id}/answer` | ✅ | |
| 6.4 | Decline call | `POST` | `/calls/{id}/decline` | ✅ | |
| 6.5 | End call | `POST` | `/calls/{id}/end` | ✅ | |
| 6.6 | Send ICE candidate | `POST` | `/calls/{id}/ice-candidate` | ✅ | |
| 6.7 | Call history | `GET` | `/calls/history` | ✅ | |

---

## Phase 7: Video Calls

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 7.1 | Initiate video call | `POST` | `/video/initiate` | ✅ | |
| 7.2 | Answer video call | `POST` | `/video/{id}/answer` | ✅ | |
| 7.3 | Decline video call | `POST` | `/video/{id}/decline` | ✅ | |
| 7.4 | End video call | `POST` | `/video/{id}/end` | ✅ | |
| 7.5 | ICE candidate | `POST` | `/video/{id}/ice-candidate` | ✅ | |
| 7.6 | Toggle video on/off | `POST` | `/video/{id}/toggle-video` | ✅ | |
| 7.7 | Video call history | `GET` | `/video/history` | ✅ | |

---

## Phase 8: Voice Rooms

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 8.1 | List public rooms | `GET` | `/rooms` | ✅ | |
| 8.2 | Create room | `POST` | `/rooms` | ✅ | |
| 8.3 | View room | `GET` | `/rooms/{id}` | ✅ | |
| 8.4 | Update room | `PUT` | `/rooms/{id}`| ✅ | |
| 8.5 | Delete room | `DELETE` | `/rooms/{id}` | ✅ | |
| 8.6 | Room history | `GET` | `/rooms/history` | ✅ | |
| 8.7 | Join room | `POST` | `/rooms/{id}/join` | ✅ | |
| 8.8 | Leave room | `POST` | `/rooms/{id}/leave` | ✅ | |
| 8.9 | Request to speak | `POST` | `/rooms/{id}/speak` | ✅ | |
| 8.10 | Promote to speaker | `POST` | `/rooms/{id}/speakers/{userId}` | ✅ | |
| 8.11 | Demote speaker | `DELETE` | `/rooms/{id}/speakers/{userId}` | ✅ | |
| 8.12 | Kick participant | `POST` | `/rooms/{id}/kick/{userId}` | ✅ | |
| 8.13 | Add co-host | `POST` | `/rooms/{id}/cohosts/{userId}` | ✅ | |
| 8.14 | Remove co-host | `DELETE` | `/rooms/{id}/cohosts/{userId}` | ✅ | |
| 8.15 | Send room reaction | `POST` | `/rooms/{id}/reactions` | ✅ | |

---

## Phase 9: Social Feed (Posts)

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 9.1 | List posts (feed) | `GET` | `/posts` | ✅ | |
| 9.2 | Create post | `POST` | `/posts` | ✅ | Body: `{content, visibility}` |
| 9.3 | View single post | `GET` | `/posts/{id}` | ✅ | |
| 9.4 | Upload post media | `POST` | `/posts/{id}/media` | ✅ | Multipart: `media` file |
| 9.5 | Like post | `POST` | `/posts/{id}/like` | ✅ | |
| 9.6 | Unlike post | `DELETE` | `/posts/{id}/like` | ✅ | |
| 9.7 | List post likes | `GET` | `/posts/{id}/likes` | ✅ | |
| 9.8 | Add comment | `POST` | `/posts/{id}/comments` | ✅ | Body: `{body}` |
| 9.9 | List comments | `GET` | `/posts/{id}/comments` | ✅ | |
| 9.10 | Delete comment | `DELETE` | `/comments/{id}` | ✅ | |
| 9.11 | Save post | `POST` | `/posts/{id}/save` | ✅ | |
| 9.12 | Unsave post | `DELETE` | `/posts/{id}/save` | ✅ | |
| 9.13 | List saved posts | `GET` | `/posts/saved` | ✅ | |

---

## Phase 10: Translation System

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 10.1 | List supported languages | `GET` | `/translations/languages` | ✅ | |
| 10.2 | Detect language | `GET` | `/translations/detect` | ✅ | Query: `?text=hello` |
| 10.3 | Translate text | `POST` | `/translations/text` | ✅ | Body: `{text, source, target}` |
| 10.4 | Translate message | `GET` | `/translations/message/{id}` | ✅ | |
| 10.5 | Translate post | `GET` | `/translations/post/{id}` | ✅ | |
| 10.6 | Score translation | `POST` | `/translations/{id}/score` | ✅ | Body: `{score}` |

---

## Phase 11: Gift & Coin Economy

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 11.1 | List gifts | `GET` | `/gifts` | ✅ | |
| 11.2 | Gift categories | `GET` | `/gifts/categories` | ✅ | |
| 11.3 | Send gift | `POST` | `/gifts/send` | ✅ | Body: `{gift_id, receiver_id}` |
| 11.4 | Gift history | `GET` | `/gifts/history` | ✅ | |
| 11.5 | Leaderboard | `GET` | `/gifts/leaderboard` | ✅ | |
| 11.6 | Coin balance | `GET` | `/gifts/coins/balance` | ✅ | |
| 11.7 | Top-up coins | `POST` | `/gifts/coins/topup` | ✅ | Behaves as expected (unconfigured) |
| 11.8 | Confirm top-up | `POST` | `/gifts/coins/confirm` | ✅ | Body: `{transaction_id}` |
| 11.9 | Coin transactions | `GET` | `/gifts/coins/transactions` | ✅ | |

---

## Phase 12: Matching Algorithm

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 12.1 | Get preferences | `GET` | `/matching/preferences` | ⬜ | |
| 12.2 | Update preferences | `PUT` | `/matching/preferences` | ⬜ | Body: `{preferred_languages, preferred_age_min...}` |
| 12.3 | Get suggestions | `GET` | `/matching/suggestions` | ⬜ | |
| 12.4 | Accept match | `POST` | `/matching/accept/{userId}` | ⬜ | |
| 12.5 | Decline match | `POST` | `/matching/decline/{userId}` | ⬜ | |
| 12.6 | List my matches | `GET` | `/matching/matches` | ⬜ | |

---

## Phase 13: Notifications

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 13.1 | List notifications | `GET` | `/notifications` | ⬜ | |
| 13.2 | Mark one as read | `POST` | `/notifications/{id}/read` | ⬜ | |
| 13.3 | Mark all as read | `POST` | `/notifications/read-all` | ⬜ | |
| 13.4 | Get notification settings | `GET` | `/notifications/settings` | ⬜ | |
| 13.5 | Update notification settings | `PUT` | `/notifications/settings` | ⬜ | |
| 13.6 | Register device token | `POST` | `/notifications/device-token` | ⬜ | Body: `{token, platform}` |
| 13.7 | Remove device token | `DELETE` | `/notifications/device-token` | ⬜ | Body: `{token}` |

---

## Phase 14: Reports & Moderation

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 14.1 | Submit report | `POST` | `/reports` | ⬜ | Body: `{reportable_type, reportable_id, type, reason}` |
| 14.2 | List my reports | `GET` | `/reports/my` | ⬜ | |

---

## Phase 15: Admin Dashboard

> ⚠️ All admin routes require `Authorization: Bearer {admin_token}`

### Admin-Level Routes

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 15.1 | List users | `GET` | `/admin/users` | ⬜ | Query: `?search=&status=&role=` |
| 15.2 | User detail | `GET` | `/admin/users/{id}` | ⬜ | |
| 15.3 | Suspend user | `POST` | `/admin/users/{id}/suspend` | ⬜ | Body: `{reason, days?}` |
| 15.4 | Restore user | `POST` | `/admin/users/{id}/restore` | ⬜ | |
| 15.5 | Warn user | `POST` | `/admin/users/{id}/warn` | ⬜ | Body: `{reason, details?}` |
| 15.6 | List reports | `GET` | `/admin/reports` | ⬜ | Query: `?status=&type=` |
| 15.7 | Report detail | `GET` | `/admin/reports/{id}` | ⬜ | |
| 15.8 | Resolve report | `POST` | `/admin/reports/{id}/resolve` | ⬜ | Body: `{status, admin_notes?}` |
| 15.9 | User analytics | `GET` | `/admin/analytics/users` | ⬜ | Query: `?period=week` |
| 15.10 | Call analytics | `GET` | `/admin/analytics/calls` | ⬜ | Query: `?period=week` |

### Super Admin Only Routes

| # | Test | Method | Endpoint | Status | Notes |
|---|------|--------|----------|--------|-------|
| 15.11 | Ban user | `POST` | `/admin/users/{id}/ban` | ⬜ | Body: `{reason}` |
| 15.12 | List admins | `GET` | `/admin/admins` | ⬜ | |
| 15.13 | Create admin | `POST` | `/admin/admins` | ⬜ | Body: `{name, username, email, password, role}` |
| 15.14 | Update admin | `PUT` | `/admin/admins/{id}` | ⬜ | Body: `{name?, email?, role?}` |
| 15.15 | Remove admin | `DELETE` | `/admin/admins/{id}` | ⬜ | |
| 15.16 | Platform overview | `GET` | `/admin/analytics/overview` | ⬜ | |
| 15.17 | Revenue analytics | `GET` | `/admin/analytics/revenue` | ⬜ | Query: `?period=month` |
| 15.18 | Get settings | `GET` | `/admin/settings` | ⬜ | |
| 15.19 | Update settings | `PUT` | `/admin/settings` | ⬜ | Body: `{settings: {...}}` |
| 15.20 | List gifts (admin) | `GET` | `/admin/gifts` | ⬜ | |
| 15.21 | Create gift | `POST` | `/admin/gifts` | ⬜ | Body: `{category_id, name, price_coins, rarity}` |
| 15.22 | Update gift | `PUT` | `/admin/gifts/{id}` | ⬜ | |
| 15.23 | Delete gift | `DELETE` | `/admin/gifts/{id}` | ⬜ | |

---

## Edge Cases & Error Handling

| # | Test | Status | Notes |
|---|------|--------|-------|
| E.1 | Unauthorized request (no token) | ⬜ | Should return 401 |
| E.2 | Access admin route as regular user | ⬜ | Should return 403 |
| E.3 | Access super_admin route as admin | ⬜ | Should return 403 |
| E.4 | Invalid JSON body | ⬜ | Should return 422 |
| E.5 | Request non-existent resource | ⬜ | Should return 404 |
| E.6 | Rate limiting triggers | ⬜ | Should return 429 |
| E.7 | Validation errors have correct format | ⬜ | `{success, message, data}` |

---

## Summary

| Phase | Tests | Passed | Failed | Pending |
|-------|-------|--------|--------|---------|
| 0 — Foundation | 4 | 4 | 0 | 0 |
| 1 — Auth | 11 | 7 | 0 | 4 |
| 2 — User/Profile | 10 | 10 | 0 | 0 |
| 3 — Social | 9 | 9 | 0 | 0 |
| 4 — Chat | 11 | 11 | 0 | 0 |
| 5 — Group Chat | 6 | 6 | 0 | 0 |
| 6 — Audio Calls | 7 | 7 | 0 | 0 |
| 7 — Video Calls | 7 | 7 | 0 | 0 |
| 8 — Voice Rooms | 15 | 15 | 0 | 0 |
| 9 — Social Feed | 13 | 13 | 0 | 0 |
| 10 — Translation | 6 | 6 | 0 | 0 |
| 11 — Gifts/Coins | 9 | 9 | 0 | 0 |
| 12 — Matching | 6 | 0 | 0 | 6 |
| 13 — Notifications | 7 | 0 | 0 | 7 |
| 14 — Reports | 2 | 0 | 0 | 2 |
| 15 — Admin | 23 | 0 | 0 | 23 |
| Edge Cases | 7 | 0 | 0 | 7 |
| **TOTAL** | **153** | **104** | **0** | **49** |
