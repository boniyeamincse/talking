# 📋 task_api.md — Talkin API Development Tasks

> **Project:** Talkin – Global Multilingual Communication Platform
> **Layer:** Laravel REST API (`/api/v1/`)
> **Stack:** PHP 8.2 · Laravel 11 · MySQL · Redis · S3 · WebSocket · WebRTC Signaling
> **Repo:** `talkin/backend`
> **Updated:** 2026-02-26

---

## Status Key

| Badge | Meaning |
|---|---|
| `🔲 Pending` | Not started |
| `🔄 In Progress` | Currently being developed |
| `🧪 Testing` | Dev complete — in QA |
| `✅ Done` | Complete and verified |
| `⛔ Blocked` | Waiting on dependency |
| `🚀 Deployed` | Live on staging/production |

## Size Key

| Badge | Effort |
|---|---|
| `S` | Small — under 4 hours |
| `M` | Medium — ~1 day |
| `L` | Large — 2–3 days |
| `XL` | Extra Large — 4+ days |

## Priority Key

| Badge | Level |
|---|---|
| `🔴 Critical` | Blocks other work — do first |
| `🟡 High` | Core feature — do this sprint |
| `🟢 Medium` | Important — next sprint |
| `🔵 Low` | Nice to have — backlog |

---

## Table of Contents

1. [Phase 0 — Foundation & Setup](#phase-0--foundation--setup)
2. [Module 01 — Auth](#module-01--auth)
3. [Module 02 — User](#module-02--user)
4. [Module 03 — Profile](#module-03--profile)
5. [Module 04 — Chat](#module-04--chat)
6. [Module 05 — Audio Call](#module-05--audio-call)
7. [Module 06 — Video Call](#module-06--video-call)
8. [Module 07 — Voice Rooms](#module-07--voice-rooms)
9. [Module 08 — Feed & Posts](#module-08--feed--posts)
10. [Module 09 — Comments](#module-09--comments)
11. [Module 10 — Likes](#module-10--likes)
12. [Module 11 — Gifts](#module-11--gifts)
13. [Module 12 — Translation](#module-12--translation)
14. [Module 13 — Matching](#module-13--matching)
15. [Module 14 — Notifications](#module-14--notifications)
16. [Module 15 — Reports](#module-15--reports)
17. [Module 16 — Admin](#module-16--admin)
18. [Module 17 — WebSocket & Real-time](#module-17--websocket--real-time)
19. [Module 18 — Media & Storage](#module-18--media--storage)
20. [Phase Z — Testing & QA](#phase-z--testing--qa)

---

---

## Phase 0 — Foundation & Setup

> One-time project scaffolding. Must be complete before any module work begins.

---

### TASK-001 — Laravel Project Initialization

| Field | Value |
|---|---|
| **ID** | TASK-001 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `✅ Done` |
| **Test Status** | `✅ Done` |
| **Git** | `✅ Done` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Description**
Initialize the Laravel 11 project with Sanctum for token-based authentication. Configure `.env` with all required keys.

**Sub-tasks**
- [x] `composer create-project laravel/laravel talkin-api`
- [x] Install Laravel Sanctum: `composer require laravel/sanctum`
- [x] Install JWT package: `composer require tymon/jwt-auth`
- [x] Publish Sanctum config
- [x] Set up `.env.example` with all required variables
- [x] Push initial commit to `main` branch

**Files**
- `config/sanctum.php`
- `config/auth.php`
- `.env.example`

---

### TASK-002 — Database Configuration

| Field | Value |
|---|---|
| **ID** | TASK-002 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `✅ Done` |
| **Test Status** | `✅ Done` |
| **Git** | `✅ Done` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Description**
Configure MySQL and Redis connections. Run all base migrations.

**Sub-tasks**
- [x] Configure `DB_*` vars in `.env`
- [x] Configure `REDIS_*` vars
- [x] Run `php artisan migrate` — verify connection
- [x] Confirm Redis ping via `php artisan tinker`

---

### TASK-003 — S3 / MinIO Storage Configuration

| Field | Value |
|---|---|
| **ID** | TASK-003 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `✅ Done` |
| **Test Status** | `✅ Done` |
| **Git** | `✅ Done` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Description**
Configure S3-compatible object storage for all media uploads (avatars, post media, audio/video messages).

**Sub-tasks**
- [x] Set `FILESYSTEM_DISK=s3` in `.env`
- [x] Configure `AWS_*` variables
- [x] Test file upload and pre-signed URL generation
- [x] Create `MediaService` stub

---

### TASK-004 — Base API Response Structure

| Field | Value |
|---|---|
| **ID** | TASK-004 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `✅ Done` |
| **Test Status** | `✅ Done` |
| **Git** | `✅ Done` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Description**
Create a consistent JSON response wrapper used by all API endpoints.

**Response Format**
```json
// Success
{ "success": true, "data": {}, "message": "OK" }

// Error
{ "success": false, "message": "Validation failed", "errors": {} }

// Paginated
{ "success": true, "data": [], "meta": { "current_page": 1, "per_page": 20, "total": 150 } }
```

**Sub-tasks**
- [x] Create `BaseController` with `successResponse()` and `errorResponse()` helpers
- [x] Create `ForceJsonResponse` middleware — set `Accept: application/json` on all requests
- [x] Register middleware in `bootstrap/app.php`
- [x] Create `ApiException` handler for clean error responses

**Files**
- `app/Http/Controllers/Api/BaseController.php`
- `app/Http/Middleware/ForceJsonResponse.php`
- `app/Exceptions/Handler.php`

---

### TASK-005 — Rate Limiting Middleware

| Field | Value |
|---|---|
| **ID** | TASK-005 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `✅ Done` |
| **Test Status** | `✅ Done` |
| **Git** | `✅ Done` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Description**
Configure layered rate limiting using Laravel's built-in rate limiter backed by Redis.

**Rate Limit Rules**
| Route Group | Limit | Window |
|---|---|---|
| Auth (login/register) | 10 req | 1 min per IP |
| Message sending | 60 req | 1 min per user |
| Media uploads | 10 req | 1 min per user |
| Translation | 100 req | 1 min per user |
| General API | 300 req | 1 min per user |
| Gift sending | 20 req | 1 min per user |

**Sub-tasks**
- [x] Define rate limiters in `RouteServiceProvider` or `AppServiceProvider`
- [x] Apply `throttle:auth` to auth routes
- [x] Apply `throttle:api` to all `/api/v1/` routes
- [x] Return `429 Too Many Requests` with `Retry-After` header

---

### TASK-006 — RBAC Middleware (Role-Based Access Control)

| Field | Value |
|---|---|
| **ID** | TASK-006 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Description**
Implement role-checking middleware for three roles: `user`, `admin`, `super_admin`.

**Sub-tasks**
- [ ] Create `CheckRole` middleware — accepts role param: `role:admin`, `role:super_admin`
- [ ] Create `CheckSuperAdmin` middleware — shortcut for super_admin-only routes
- [ ] Register both in `bootstrap/app.php`
- [ ] Add `role` field to `users` table migration: `ENUM('user','admin','super_admin')`
- [ ] Write unit test for role rejection

**Files**
- `app/Http/Middleware/CheckRole.php`
- `app/Http/Middleware/CheckSuperAdmin.php`

---

### TASK-007 — Database Migrations (All Tables)

| Field | Value |
|---|---|
| **ID** | TASK-007 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔄 In Progress` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Description**
Create all database migration files for the full schema. Run in dependency order.

**Migration Order & Status**
- [x] `create_users_table`
- [x] `create_profiles_table`
- [x] `create_languages_table`
- [ ] `create_user_languages_table`
- [ ] `create_admin_permissions_table`
- [ ] `create_conversations_table`
- [ ] `create_conversation_members_table`
- [ ] `create_messages_table`
- [ ] `create_message_status_table`
- [ ] `create_calls_table`
- [ ] `create_video_calls_table`
- [ ] `create_voice_rooms_table`
- [ ] `create_room_participants_table`
- [ ] `create_posts_table`
- [ ] `create_post_media_table`
- [ ] `create_comments_table`
- [ ] `create_likes_table`
- [ ] `create_gifts_table`
- [ ] `create_gift_transactions_table`
- [ ] `create_coin_transactions_table`
- [ ] `create_matches_table`
- [ ] `create_notifications_table`
- [ ] `create_device_tokens_table`
- [ ] `create_reports_table`
- [ ] `create_translations_table`
- [ ] `create_blocks_table`
- [ ] `create_follows_table`
- [ ] `create_groups_table`
- [ ] `create_group_members_table`

**Notes**
- Add all indexes defined in `docs/database.md`
- Use `uuid` column on all public-facing tables

---

### TASK-008 — Database Seeders

| Field | Value |
|---|---|
| **ID** | TASK-008 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔄 In Progress` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [x] `LanguageSeeder` — seed 180+ languages from ISO 639-1 list with flag emojis
- [ ] `GiftSeeder` — seed initial 10 cultural gifts (Sakura, Heart, Coffee, Rose, Dragon, Tulip…)
- [ ] `SuperAdminSeeder` — seed default super_admin account (from `.env`)
- [ ] `DatabaseSeeder` — call all seeders in order

---

### TASK-009 — CI/CD Pipeline (GitHub Actions)

| Field | Value |
|---|---|
| **ID** | TASK-009 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | DevOps |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] `.github/workflows/ci.yml` — run `php artisan test` on every PR
- [ ] `.github/workflows/deploy-staging.yml` — auto-deploy `develop` branch to staging
- [ ] Add `composer audit` step — fail on critical vulnerabilities
- [ ] Add code style check (`pint`)
- [ ] Slack/email notification on failed build

---

---

## Module 01 — Auth

> **Base path:** `/api/v1/auth`
> **Controller:** `AuthController`
> **Middleware:** `throttle:auth` (all), `auth:sanctum` (logout, refresh)

---

### TASK-010 — POST /auth/register

| Field | Value |
|---|---|
| **ID** | TASK-010 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔄 In Progress` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Description**
Register a new user account with email and password. Trigger email verification.

**Request**
```json
{
  "username": "yuki_tanaka",
  "email": "yuki@example.com",
  "password": "SecurePass123",
  "password_confirmation": "SecurePass123",
  "country_code": "JP",
  "native_language": "ja",
  "learning_language": "en"
}
```

**Response** `201`
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "uuid": "...", "username": "yuki_tanaka", "email": "yuki@example.com" },
    "token": "eyJ..."
  },
  "message": "Account created. Please verify your email."
}
```

**Sub-tasks**
- [ ] Create `RegisterRequest` — validate username uniqueness, email uniqueness, password min 8 chars
- [ ] Hash password with bcrypt (cost 12)
- [ ] Create `users` record + `profiles` record (transaction)
- [ ] Create `user_languages` entries (native + learning)
- [ ] Issue Sanctum token
- [ ] Dispatch `SendEmailVerification` job
- [ ] Return `201` with user + token

**Validation Rules**
```php
'username'  => 'required|string|min:3|max:50|unique:users|alpha_dash',
'email'     => 'required|email|unique:users',
'password'  => 'required|string|min:8|confirmed',
'country_code' => 'nullable|string|size:2',
'native_language' => 'required|exists:languages,code',
'learning_language' => 'nullable|exists:languages,code',
```

---

### TASK-011 — POST /auth/login

| Field | Value |
|---|---|
| **ID** | TASK-011 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔄 In Progress` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Request**
```json
{ "email": "yuki@example.com", "password": "SecurePass123" }
```

**Response** `200`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJ...",
    "expires_at": "2026-03-28T10:00:00Z"
  }
}
```

**Sub-tasks**
- [ ] Create `LoginRequest` — validate email + password
- [ ] Check user exists and is not banned/suspended
- [ ] Verify password with `Hash::check()`
- [ ] Track failed login attempts in Redis — lock after 5 failures (15 min)
- [ ] Issue Sanctum token with 60-day expiry
- [ ] Update `last_seen_at`
- [ ] Return user + token

---

### TASK-012 — POST /auth/logout

| Field | Value |
|---|---|
| **ID** | TASK-012 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Revoke current token: `$request->user()->currentAccessToken()->delete()`
- [ ] Return `204 No Content`

---

### TASK-013 — POST /auth/refresh

| Field | Value |
|---|---|
| **ID** | TASK-013 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Delete current access token
- [ ] Issue new token with fresh expiry
- [ ] Return new token

---

### TASK-014 — POST /auth/forgot-password

| Field | Value |
|---|---|
| **ID** | TASK-014 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Validate email exists in `users`
- [ ] Generate cryptographically random reset token (60 chars)
- [ ] Store in `password_reset_tokens` table with 60-min expiry
- [ ] Dispatch `SendPasswordResetEmail` mail job
- [ ] Always return `200` (don't leak email existence)

---

### TASK-015 — POST /auth/reset-password

| Field | Value |
|---|---|
| **ID** | TASK-015 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Request**
```json
{ "token": "abc123...", "email": "yuki@example.com", "password": "NewPass456", "password_confirmation": "NewPass456" }
```

**Sub-tasks**
- [ ] Validate token + email match in `password_reset_tokens`
- [ ] Check token has not expired (60 min)
- [ ] Hash and update password
- [ ] Delete token (single-use)
- [ ] Revoke all existing Sanctum tokens for user
- [ ] Return `200`

---

### TASK-016 — GET /auth/verify-email/{token}

| Field | Value |
|---|---|
| **ID** | TASK-016 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Validate token from URL
- [ ] Set `email_verified_at` timestamp
- [ ] Delete token
- [ ] Return `200` with redirect URL for frontend

---

### TASK-017 — POST /auth/social/google

| Field | Value |
|---|---|
| **ID** | TASK-017 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Request**
```json
{ "id_token": "<google_id_token>" }
```

**Sub-tasks**
- [ ] Install `laravel/socialite`
- [ ] Verify Google ID token with Google's tokeninfo endpoint
- [ ] Find or create user by `email` from Google payload
- [ ] Set `provider = 'google'`, `provider_id = google_sub`
- [ ] Skip email verification for OAuth users
- [ ] Issue Sanctum token
- [ ] Return user + token

---

### TASK-018 — POST /auth/social/apple

| Field | Value |
|---|---|
| **ID** | TASK-018 |
| **Size** | `M` |
| **Priority** | `🟢 Medium` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] Verify Apple identity token (JWT verification with Apple public keys)
- [ ] Handle first-sign-in name (Apple only sends name once)
- [ ] Find or create user
- [ ] Return token

---

---

## Module 02 — User

> **Base path:** `/api/v1/users`
> **Controller:** `UserController`
> **Middleware:** `auth:sanctum`

---

### TASK-019 — GET /users/me

| Field | Value |
|---|---|
| **ID** | TASK-019 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Response** `200`
```json
{
  "success": true,
  "data": {
    "id": 1, "uuid": "...", "username": "yuki_tanaka",
    "email": "yuki@example.com", "role": "user",
    "status": "active", "last_seen_at": "...",
    "profile": { "display_name": "Yuki T.", "avatar": "https://...", "bio": "...", "country_code": "JP", "coin_balance": 500 },
    "languages": [ { "code": "ja", "type": "native" }, { "code": "en", "type": "learning" } ]
  }
}
```

**Sub-tasks**
- [ ] Create `UserResource` — load profile + languages eagerly
- [ ] Update `last_seen_at` on each authenticated request (middleware)

---

### TASK-020 — PUT /users/me

| Field | Value |
|---|---|
| **ID** | TASK-020 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Allow update of: `username`, `email` (re-verify on change)
- [ ] Validate `username` uniqueness (exclude own ID)
- [ ] Return updated user resource

---

### TASK-021 — GET /users/{id}

| Field | Value |
|---|---|
| **ID** | TASK-021 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Return public profile only (no email, no sensitive fields)
- [ ] Check if requesting user has blocked or is blocked by target — return `403` if so
- [ ] Return `is_following`, `is_blocked` flags in response

---

### TASK-022 — GET /users/search

| Field | Value |
|---|---|
| **ID** | TASK-022 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Query Params:** `?q=yuki&page=1&per_page=20`

**Sub-tasks**
- [ ] Search `username` and `display_name` (LIKE or full-text)
- [ ] Exclude blocked users from results
- [ ] Exclude own account
- [ ] Return paginated `UserResource` collection

---

### TASK-023 — POST /users/{id}/block & DELETE /users/{id}/block

| Field | Value |
|---|---|
| **ID** | TASK-023 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] `POST` — insert into `blocks` table; prevent duplicate entry
- [ ] `DELETE` — remove from `blocks` table
- [ ] Cannot block self — return `422`
- [ ] After block: hide user from chat, feed, matching

---

### TASK-024 — POST /users/{id}/follow & DELETE /users/{id}/follow

| Field | Value |
|---|---|
| **ID** | TASK-024 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] `POST` — insert into `follows` table; dispatch `follow.new` notification
- [ ] `DELETE` — remove follow
- [ ] Cannot follow self
- [ ] Return updated `follower_count` and `following_count`

---

### TASK-025 — GET /users/{id}/followers & /following

| Field | Value |
|---|---|
| **ID** | TASK-025 |
| **Size** | `S` |
| **Priority** | `🟢 Medium` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Return paginated list of users
- [ ] Each item: `id`, `uuid`, `username`, `display_name`, `avatar`, `is_following`

---

---

## Module 03 — Profile

> **Base path:** `/api/v1/profiles`
> **Controller:** `ProfileController`
> **Middleware:** `auth:sanctum`

---

### TASK-026 — GET /profiles/me

| Field | Value |
|---|---|
| **ID** | TASK-026 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Response includes:** `display_name`, `avatar`, `bio`, `country_code`, `date_of_birth`, `gender`, `is_public`, `coin_balance`, `cultural_interests`, `learning_goal`, `languages[]`

---

### TASK-027 — PUT /profiles/me

| Field | Value |
|---|---|
| **ID** | TASK-027 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Updatable fields:** `display_name`, `bio`, `country_code`, `date_of_birth`, `gender`, `is_public`, `cultural_interests` (JSON array of country codes), `learning_goal`

**Sub-tasks**
- [ ] Create `UpdateProfileRequest` with validation
- [ ] Validate `country_code` is valid ISO 3166-1 alpha-2
- [ ] Validate `cultural_interests` is array of valid country codes
- [ ] Validate `learning_goal` in: `casual`, `study`, `cultural_exchange`, `friendship`
- [ ] Return updated `ProfileResource`

---

### TASK-028 — POST /profiles/me/photo

| Field | Value |
|---|---|
| **ID** | TASK-028 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] Accept `multipart/form-data` with `photo` field
- [ ] Validate: MIME type `image/jpeg|image/png|image/webp`, max 5MB
- [ ] Delete old avatar from S3 if exists
- [ ] Upload to S3 at path: `avatars/{user_uuid}/{timestamp}.jpg`
- [ ] Store S3 URL in `profiles.avatar`
- [ ] Return new avatar URL

---

### TASK-029 — PUT /profiles/me/languages

| Field | Value |
|---|---|
| **ID** | TASK-029 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Request**
```json
{
  "native": [{ "code": "ja", "proficiency": "native" }],
  "learning": [{ "code": "en", "proficiency": "intermediate" }, { "code": "fr", "proficiency": "beginner" }]
}
```

**Sub-tasks**
- [ ] Validate each `code` exists in `languages` table
- [ ] Validate `proficiency` in allowed enum
- [ ] Delete and re-insert `user_languages` entries (replace strategy)
- [ ] Trigger `RunMatchingAlgorithm` job (profile changed)

---

### TASK-030 — PUT /profiles/me/interests

| Field | Value |
|---|---|
| **ID** | TASK-030 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Request:** `{ "interests": ["music", "travel", "anime", "food"] }`

**Sub-tasks**
- [ ] Validate max 20 interests
- [ ] Store as JSON in `profiles.interests` (or separate `user_interests` table)
- [ ] Trigger re-matching job

---

### TASK-031 — GET /profiles/{id}

| Field | Value |
|---|---|
| **ID** | TASK-031 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Return public profile if `is_public = true`
- [ ] Return `403` if blocked
- [ ] Return `is_following`, `is_matched`, `is_blocked` flags

---

---

## Module 04 — Chat

> **Base path:** `/api/v1/chat`
> **Controller:** `ChatController`
> **Middleware:** `auth:sanctum`

---

### TASK-032 — GET /chat/conversations

| Field | Value |
|---|---|
| **ID** | TASK-032 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] Return conversations where auth user is a member
- [ ] Each item: `id`, `uuid`, `type`, `name`, `avatar`, `last_message`, `unread_count`, `updated_at`
- [ ] Sort by `updated_at` DESC (most recent first)
- [ ] Paginate (cursor-based preferred for real-time lists)
- [ ] Eager load: `lastMessage`, `members` (limited to 3 for avatars)

---

### TASK-033 — POST /chat/conversations

| Field | Value |
|---|---|
| **ID** | TASK-033 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Request (direct)**
```json
{ "type": "direct", "user_id": 42 }
```

**Request (group)**
```json
{ "type": "group", "name": "Tokyo Friends", "user_ids": [42, 55, 88] }
```

**Sub-tasks**
- [ ] For `direct`: check if conversation already exists between two users — return existing
- [ ] Check neither user has blocked the other
- [ ] Create `conversations` + `conversation_members` (transaction)
- [ ] Return `ConversationResource`

---

### TASK-034 — GET /chat/conversations/{id}/messages

| Field | Value |
|---|---|
| **ID** | TASK-034 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Query Params:** `?before={message_uuid}&limit=50` (cursor pagination)

**Sub-tasks**
- [ ] Verify auth user is member of conversation
- [ ] Return messages in DESC order (newest first, client reverses)
- [ ] Each message: `id`, `uuid`, `sender`, `type`, `body`, `original_body`, `original_lang`, `media_url`, `status`, `reply_to`, `reactions`, `sent_at`
- [ ] Implement cursor-based pagination with `before` UUID

---

### TASK-035 — POST /chat/conversations/{id}/messages

| Field | Value |
|---|---|
| **ID** | TASK-035 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Request**
```json
{ "type": "text", "body": "Hello! How is your study?", "reply_to_id": null }
```

**Sub-tasks**
- [ ] Create `SendMessageRequest` — validate type, body, reply_to_id
- [ ] Verify sender is member of conversation
- [ ] Store message in `messages` table
- [ ] Broadcast `MessageSent` event on `private-chat.{conversationId}` channel
- [ ] Dispatch `TranslateMessage` job (async)
- [ ] Update `conversation.updated_at`
- [ ] Dispatch `SendPushNotification` job to other participants
- [ ] Return `MessageResource` — `201`

**Broadcast Payload**
```json
{
  "event": "message.new",
  "data": { "message": { ... }, "conversation_id": "..." }
}
```

---

### TASK-036 — DELETE /chat/messages/{id}

| Field | Value |
|---|---|
| **ID** | TASK-036 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Verify auth user is the sender
- [ ] Set `is_deleted = true` (soft delete — preserve thread)
- [ ] Broadcast `message.deleted` event
- [ ] Return `204`

---

### TASK-037 — POST /chat/conversations/{id}/read

| Field | Value |
|---|---|
| **ID** | TASK-037 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Update `conversation_members.last_read_at = now()`
- [ ] Update `message_status` to `seen` for all unread messages in conversation
- [ ] Broadcast `message.seen` event to sender

---

### TASK-038 — POST /chat/conversations/{id}/media

| Field | Value |
|---|---|
| **ID** | TASK-038 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] Accept `multipart/form-data` — `file` field
- [ ] Validate MIME types: `image/*`, `video/mp4`, `audio/mpeg`, `audio/ogg`, max 100MB
- [ ] Upload to S3 at `messages/{conversation_uuid}/{uuid}.ext`
- [ ] Dispatch `ProcessMediaUpload` job (generate thumbnail for video)
- [ ] Return pre-signed URL (expires 24h)

---

### TASK-039 — Group Chat Management

| Field | Value |
|---|---|
| **ID** | TASK-039 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints covered:** `POST /chat/groups`, `POST /chat/groups/{id}/members`, `DELETE /chat/groups/{id}/members/{userId}`, `POST /chat/groups/{id}/leave`

**Sub-tasks**
- [ ] Create group: require name, min 2 other members
- [ ] Add member: check requester is admin of group
- [ ] Remove member: check requester is admin
- [ ] Leave: remove self from `conversation_members`; if last admin leaves, promote next member
- [ ] Broadcast membership change events

---

---

## Module 05 — Audio Call

> **Base path:** `/api/v1/calls`
> **Controller:** `CallController`
> **Middleware:** `auth:sanctum`

---

### TASK-040 — POST /calls/initiate

| Field | Value |
|---|---|
| **ID** | TASK-040 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Request:** `{ "callee_id": 42 }`

**Response** `201`
```json
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

**Sub-tasks**
- [ ] Check callee exists and is not blocked
- [ ] Check callee is not already in an active call
- [ ] Create `calls` record (status: `ringing`)
- [ ] Issue time-limited TURN credentials (HMAC-SHA1, 24h TTL) — store in Redis
- [ ] Broadcast `call.incoming` event to callee via WebSocket
- [ ] Start 30-second timeout job — auto-mark as `missed` if no answer
- [ ] Return call_id + ICE servers

---

### TASK-041 — POST /calls/{id}/answer

| Field | Value |
|---|---|
| **ID** | TASK-041 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] Verify auth user is the callee
- [ ] Update call status to `ongoing`, set `started_at`
- [ ] Cancel the timeout job
- [ ] Broadcast `call.answered` to caller
- [ ] Return TURN credentials

---

### TASK-042 — POST /calls/{id}/decline

| Field | Value |
|---|---|
| **ID** | TASK-042 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Update status to `declined`
- [ ] Broadcast `call.declined` to caller
- [ ] Send missed call notification

---

### TASK-043 — POST /calls/{id}/end

| Field | Value |
|---|---|
| **ID** | TASK-043 |
| **Size** | `S` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Update status to `ended`, set `ended_at`
- [ ] Compute `duration = ended_at - started_at` (seconds)
- [ ] Broadcast `call.ended` to both parties
- [ ] Revoke TURN credentials from Redis

---

### TASK-044 — POST /calls/{id}/ice-candidate

| Field | Value |
|---|---|
| **ID** | TASK-044 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Request:** `{ "candidate": "...", "sdpMid": "...", "sdpMLineIndex": 0 }`

**Sub-tasks**
- [ ] Validate auth user is caller or callee
- [ ] Broadcast `webrtc.ice-candidate` event to the other party
- [ ] Do NOT persist ICE candidates — relay only

---

### TASK-045 — SDP Offer/Answer Relay

| Field | Value |
|---|---|
| **ID** | TASK-045 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints:** `POST /calls/{id}/offer` · `POST /calls/{id}/answer-sdp`

**Sub-tasks**
- [ ] `POST /calls/{id}/offer` — relay SDP offer to callee via WebSocket
- [ ] `POST /calls/{id}/answer-sdp` — relay SDP answer to caller via WebSocket
- [ ] Broadcast on `private-user.{userId}` channel

---

### TASK-046 — GET /calls/history

| Field | Value |
|---|---|
| **ID** | TASK-046 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Return calls where user is caller or callee
- [ ] Sort by `created_at` DESC
- [ ] Include: other party's name/avatar, status, duration, `created_at`

---

---

## Module 06 — Video Call

> **Base path:** `/api/v1/video`
> **Controller:** `VideoCallController`
> **Middleware:** `auth:sanctum`

> Same pattern as Audio Call module. All endpoints mirror TASK-040 through TASK-046 with video-specific additions.

---

### TASK-047 — Video Call Full Implementation

| Field | Value |
|---|---|
| **ID** | TASK-047 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Endpoints**
- `POST /video/initiate` — same as call initiate, type=`video`
- `POST /video/{id}/answer`
- `POST /video/{id}/decline`
- `POST /video/{id}/end`
- `POST /video/{id}/ice-candidate`
- `POST /video/{id}/offer`
- `POST /video/{id}/answer-sdp`
- `POST /video/{id}/toggle-video` — broadcast video on/off state to peer
- `GET  /video/history`

**Sub-tasks**
- [ ] Implement all above endpoints — same logic as Audio Call
- [ ] `POST /video/{id}/toggle-video` — broadcast `video.toggled` event: `{ "user_id": X, "video_on": false }`
- [ ] Optional: `recording_url` field — if recording requested, process async and store to S3

---

---

## Module 07 — Voice Rooms

> **Base path:** `/api/v1/rooms`
> **Controller:** `VoiceRoomController`
> **Middleware:** `auth:sanctum`

---

### TASK-048 — GET /rooms (List Public Rooms)

| Field | Value |
|---|---|
| **ID** | TASK-048 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Query Params:** `?language_id=1&mode=discussion&page=1`

**Sub-tasks**
- [ ] Return only `status = active` rooms
- [ ] Filter by `language_id`, `mode`
- [ ] Each item: `id`, `uuid`, `title`, `host`, `language`, `mode`, `speaker_count`, `audience_count`, `max_speakers`
- [ ] Sort by audience count DESC (trending first)

---

### TASK-049 — POST /rooms (Create Room)

| Field | Value |
|---|---|
| **ID** | TASK-049 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Request**
```json
{
  "title": "Japanese Practice Room 🌸",
  "description": "Let's practice Japanese together!",
  "language_id": 1,
  "mode": "discussion",
  "is_public": true,
  "max_speakers": 8
}
```

**Sub-tasks**
- [ ] Create `voice_rooms` record
- [ ] Auto-add creator as `host` in `room_participants`
- [ ] Broadcast `room.created` event on public feed channel
- [ ] Return `VoiceRoomResource`

---

### TASK-050 — Room Participant Management

| Field | Value |
|---|---|
| **ID** | TASK-050 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Endpoints covered:**
- `POST /rooms/{id}/join`
- `POST /rooms/{id}/leave`
- `POST /rooms/{id}/speak` (raise hand)
- `POST /rooms/{id}/speakers/{userId}` (promote)
- `DELETE /rooms/{id}/speakers/{userId}` (demote)
- `POST /rooms/{id}/cohosts/{userId}`
- `DELETE /rooms/{id}/cohosts/{userId}`
- `POST /rooms/{id}/kick/{userId}`

**Sub-tasks**
- [ ] `join` — insert into `room_participants` as `audience`; check max capacity; broadcast join event
- [ ] `leave` — set `left_at`; if host leaves, transfer host to co-host or close room; broadcast leave event
- [ ] `speak` — broadcast `hand.raised` event to hosts
- [ ] `promote` — require requester is `host` or `cohost`; update role to `speaker`; broadcast
- [ ] `demote` — update role to `audience`; broadcast
- [ ] `cohosts` — require host; update role; broadcast
- [ ] `kick` — require host/cohost; set `left_at`; broadcast `user.kicked` event; prevent re-join for 10 min
- [ ] All participant changes broadcast on `presence-room.{roomId}`

---

### TASK-051 — POST /rooms/{id}/reactions

| Field | Value |
|---|---|
| **ID** | TASK-051 |
| **Size** | `S` |
| **Priority** | `🟢 Medium` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Request:** `{ "emoji": "🌸" }`

**Sub-tasks**
- [ ] Validate emoji is in approved list
- [ ] Rate limit: max 5 reactions per second per user
- [ ] Broadcast `room.reaction` event to all room participants
- [ ] Do NOT persist reactions

---

---

## Module 08 — Feed & Posts

> **Base path:** `/api/v1/posts`
> **Controller:** `PostController`
> **Middleware:** `auth:sanctum`

---

### TASK-052 — GET /posts (Feed)

| Field | Value |
|---|---|
| **ID** | TASK-052 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 3 days |

**Query Params:** `?type=feed|country|discover&country_code=JP&page=1`

**Feed Algorithm**
1. Posts from followed users (last 7 days) — weight: 1.5x
2. Posts from matched partners — weight: 1.2x
3. Popular posts in user's language communities — weight: 1.0x
4. Country-based posts (if `country_code` param set) — filtered

**Sub-tasks**
- [ ] Implement feed query with union of sources
- [ ] Exclude posts from blocked users
- [ ] Cache feed per user in Redis (TTL: 5 min)
- [ ] Bust cache on new post from followed user
- [ ] Include `is_liked`, `is_saved` flags per post
- [ ] Paginate (cursor-based)
- [ ] Country topics: filter by `posts.country_code` when `type=country`

---

### TASK-053 — POST /posts (Create Post)

| Field | Value |
|---|---|
| **ID** | TASK-053 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Request** (`multipart/form-data`)
```
type: photo
body: "Cherry blossoms today 🌸 #sakura"
visibility: public
language_id: 1
media[]: <file1.jpg>
media[]: <file2.jpg>
```

**Sub-tasks**
- [ ] Validate type in `text|photo|video|language`
- [ ] Upload media files to S3 (`posts/{user_uuid}/{post_uuid}/`)
- [ ] Dispatch `ProcessMediaUpload` job (thumbnails for video)
- [ ] Dispatch `TranslateMessage` job for post body
- [ ] Bust user's followers' feed cache
- [ ] Return `PostResource` — `201`

---

### TASK-054 — POST, PUT, DELETE Post Endpoints

| Field | Value |
|---|---|
| **ID** | TASK-054 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints:** `GET /posts/{id}` · `PUT /posts/{id}` · `DELETE /posts/{id}` · `POST /posts/{id}/save` · `GET /posts/saved`

**Sub-tasks**
- [ ] `GET` — return single post with media, like/save status, comment count
- [ ] `PUT` — allow editing `body` and `visibility` only; other fields immutable
- [ ] `DELETE` — soft delete; delete S3 media async via job
- [ ] `save` — insert/remove from `saved_posts` table; return updated `is_saved`
- [ ] `saved` — return paginated saved posts

---

---

## Module 09 — Comments

> **Controller:** `CommentController`

---

### TASK-055 — Comment CRUD

| Field | Value |
|---|---|
| **ID** | TASK-055 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints:** `GET /posts/{postId}/comments` · `POST /posts/{postId}/comments` · `PUT /comments/{id}` · `DELETE /comments/{id}` · `POST /comments/{id}/like`

**Sub-tasks**
- [ ] `GET` — paginated, cursor-based; eager load `user` (id, username, avatar)
- [ ] `POST` — validate body max 1000 chars; increment `posts.comment_count`; dispatch notification job
- [ ] `PUT` — own comment only; track `edited_at`
- [ ] `DELETE` — own comment or post owner; decrement `comment_count`
- [ ] `like` — polymorphic like on `comments`; increment `comments.like_count`

---

---

## Module 10 — Likes

> **Controller:** `LikeController`

---

### TASK-056 — Like System

| Field | Value |
|---|---|
| **ID** | TASK-056 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Endpoints:** `POST /posts/{id}/like` · `DELETE /posts/{id}/like` · `GET /posts/{id}/likes`

**Sub-tasks**
- [ ] Polymorphic `likes` table: `likeable_type = 'post'`
- [ ] Prevent duplicate likes (unique constraint)
- [ ] `POST` — insert like; increment `posts.like_count`; dispatch `post.like` notification
- [ ] `DELETE` — remove like; decrement count
- [ ] `GET` — paginated list of users who liked the post

---

---

## Module 11 — Gifts

> **Base path:** `/api/v1/gifts`
> **Controller:** `GiftController`
> **Middleware:** `auth:sanctum`

---

### TASK-057 — GET /gifts (Catalog)

| Field | Value |
|---|---|
| **ID** | TASK-057 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Sub-tasks**
- [ ] Return only `is_active = true` gifts
- [ ] Group by `culture` in response
- [ ] Cache catalog in Redis (TTL: 1 hour, bust on admin gift change)

---

### TASK-058 — POST /gifts/send

| Field | Value |
|---|---|
| **ID** | TASK-058 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Request**
```json
{ "gift_id": 3, "receiver_id": 42, "context": "chat", "context_id": 789 }
```

**Sub-tasks**
- [ ] Validate sender has sufficient coin balance
- [ ] Use DB transaction: deduct coins + create `gift_transactions` + create `coin_transactions` (spend)
- [ ] Update receiver's `coin_balance` (`earn` transaction)
- [ ] Broadcast `gift.sent` event to receiver (triggers animation)
- [ ] Dispatch `gift.received` push notification
- [ ] Return: `{ transaction_id, coin_balance_after }`

---

### TASK-059 — Coin Management

| Field | Value |
|---|---|
| **ID** | TASK-059 |
| **Size** | `L` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 3 days |

**Endpoints:** `GET /gifts/coins/balance` · `POST /gifts/coins/topup` · `GET /gifts/history` · `GET /gifts/leaderboard`

**Sub-tasks**
- [ ] `balance` — return `{ balance: 500 }` from `profiles.coin_balance`
- [ ] `topup` — integrate Stripe payment intent; verify webhook; add coins on success; record `coin_transactions` (purchase)
- [ ] `history` — paginated gift transactions (sent + received)
- [ ] `leaderboard` — top 100 gift senders (by total coins spent) and receivers (by total coins earned) — cached 1h

---

---

## Module 12 — Translation

> **Base path:** `/api/v1/translations`
> **Controller:** `TranslationController`
> **Service:** `TranslationService`

---

### TASK-060 — Translation Service Integration

| Field | Value |
|---|---|
| **ID** | TASK-060 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Sub-tasks**
- [ ] Create `TranslationService` class
- [ ] Implement Google Translate API v2 client
- [ ] Language detection (auto-detect source language)
- [ ] Cache translations in `translations` table (unique: source_type + source_id + target_lang)
- [ ] On cache hit: return cached; on miss: call API + cache result
- [ ] Handle API errors gracefully (return original text if translation fails)
- [ ] Config: `TRANSLATION_PROVIDER=google` (swap to DeepL/OpenAI without code change)

---

### TASK-061 — Translation Endpoints

| Field | Value |
|---|---|
| **ID** | TASK-061 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints:** `GET /translations/message/{id}?lang=en` · `GET /translations/post/{id}?lang=en` · `POST /translations/text` · `GET /translations/languages`

**Sub-tasks**
- [ ] `message/{id}` — check cache → call API if miss → return `{ original, translated, source_lang, target_lang }`
- [ ] `post/{id}` — same for post body
- [ ] `text` — translate arbitrary text (no caching); rate limited
- [ ] `languages` — return full list from `languages` table (public endpoint, no auth)

---

### TASK-062 — TranslateMessage Background Job

| Field | Value |
|---|---|
| **ID** | TASK-062 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Description**
Translate messages asynchronously after send. Do not block the send response.

**Sub-tasks**
- [ ] `TranslateMessage` job — takes `message_id`
- [ ] Determine target language from conversation recipient's native language
- [ ] Call `TranslationService::translate()`
- [ ] Update `messages.body` with translated text; store `original_body`
- [ ] Broadcast `message.translated` event with translated content
- [ ] Add to `high` queue (fast processing)

---

---

## Module 13 — Matching

> **Base path:** `/api/v1/matching`
> **Controller:** `MatchingController`
> **Service:** `MatchingService`

---

### TASK-063 — Matching Preferences

| Field | Value |
|---|---|
| **ID** | TASK-063 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Endpoints:** `GET /matching/preferences` · `PUT /matching/preferences`

**Preferences fields:** `learning_goal`, `preferred_age_min`, `preferred_age_max`, `preferred_gender`, `preferred_region`, `daily_match_limit`

---

### TASK-064 — MatchingService — Scoring Algorithm

| Field | Value |
|---|---|
| **ID** | TASK-064 |
| **Size** | `XL` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 4 days |

**Description**
Implement the 7-factor matching algorithm defined in `blueprint/matching-algorithm.md`.

**Scoring Factors**
| Factor | Weight |
|---|---|
| Language Compatibility | 35% |
| Mutual Exchange Fit | 20% |
| Shared Interests | 15% |
| Cultural Preferences | 10% |
| Activity Level | 10% |
| Learning Goals | 5% |
| Country / Region | 5% |

**Sub-tasks**
- [ ] Create `MatchingService` class with `computeScore(User $a, User $b): int` method
- [ ] Implement `languageScore()` — check native/learning language alignment
- [ ] Implement `exchangeScore()` — mutual exchange detection
- [ ] Implement `interestScore()` — Jaccard similarity
- [ ] Implement `cultureScore()` — cultural_interests alignment
- [ ] Implement `activityScore()` — recency + message frequency
- [ ] Implement `goalScore()` — learning goal match table
- [ ] Implement `regionScore()` — country/region preference
- [ ] Implement candidate filtering (block list, already matched, inactive 30d)
- [ ] Return top 20 candidates with score >= 50
- [ ] Write comprehensive unit tests for each factor

---

### TASK-065 — RunMatchingAlgorithm Job

| Field | Value |
|---|---|
| **ID** | TASK-065 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] `RunMatchingAlgorithm` job — takes `user_id`
- [ ] Call `MatchingService` to compute scores
- [ ] Upsert results into `matches` table (status: `pending`)
- [ ] Dispatch `match.new` notification for each new match
- [ ] Schedule daily run via `php artisan schedule:run`

---

### TASK-066 — Match Accept/Decline

| Field | Value |
|---|---|
| **ID** | TASK-066 |
| **Size** | `S` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 0.5 day |

**Endpoints:** `POST /matching/accept/{userId}` · `POST /matching/decline/{userId}` · `GET /matching/suggestions` · `GET /matching/matches`

**Sub-tasks**
- [ ] `accept` — update `matches.status = accepted`; create `conversations` entry; broadcast `match.accepted`
- [ ] `decline` — update status; set 30-day cooldown in Redis
- [ ] `suggestions` — return top pending matches, paginated
- [ ] `matches` — return accepted matches with conversation link

---

---

## Module 14 — Notifications

> **Base path:** `/api/v1/notifications`
> **Controller:** `NotificationController`

---

### TASK-067 — Notification Endpoints

| Field | Value |
|---|---|
| **ID** | TASK-067 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints:** `GET /notifications` · `POST /notifications/{id}/read` · `POST /notifications/read-all` · `GET /notifications/settings` · `PUT /notifications/settings` · `POST /notifications/device-token`

**Sub-tasks**
- [ ] `GET` — paginated, `is_read` filter param; include unread count in response header
- [ ] `read` — set `is_read = true`; return updated notification
- [ ] `read-all` — bulk update `is_read = true` for auth user
- [ ] `settings` — CRUD for notification preferences JSON (stored in `profiles`)
- [ ] `device-token` — upsert FCM token in `device_tokens` table; `DELETE` to remove on logout

---

### TASK-068 — Firebase FCM Integration

| Field | Value |
|---|---|
| **ID** | TASK-068 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Sub-tasks**
- [ ] Install `kreait/laravel-firebase`
- [ ] Configure Firebase service account JSON in config
- [ ] Create `SendPushNotification` job
- [ ] Handle multi-device (one user, multiple FCM tokens)
- [ ] Remove stale tokens on `messaging/registration-token-not-registered` error
- [ ] Implement notification grouping (batch messages same conversation)
- [ ] Respect `quiet_hours` setting — skip push if within user's quiet window
- [ ] Test on Android emulator + iOS simulator

---

---

## Module 15 — Reports

> **Base path:** `/api/v1/reports`
> **Controller:** `ReportController`

---

### TASK-069 — Report System

| Field | Value |
|---|---|
| **ID** | TASK-069 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints:** `POST /reports` · `GET /reports/my`

**Request**
```json
{
  "reportable_type": "post",
  "reportable_id": 234,
  "reason": "hate_speech",
  "description": "This post contains offensive content."
}
```

**Sub-tasks**
- [ ] Validate `reportable_type` in `user|post|comment|message|room`
- [ ] Validate `reason` in `spam|harassment|hate_speech|sexual_content|violence|other`
- [ ] Prevent duplicate reports (same reporter + target)
- [ ] Notify admin via Slack webhook if high-severity reason
- [ ] `GET /reports/my` — paginated list of own submitted reports

---

---

## Module 16 — Admin

> **Base path:** `/api/v1/admin`
> **Controllers:** `AdminUserController`, `AdminReportController`, `AdminRoomController`, `SuperAdmin/AdminGiftController`, `SuperAdmin/AdminAnalyticsController`, `SuperAdmin/AdminAccountController`
> **Middleware:** `auth:sanctum` + `role:admin` or `role:super_admin`

---

### TASK-070 — Admin User Management

| Field | Value |
|---|---|
| **ID** | TASK-070 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints (Admin + Super Admin):**
- `GET /admin/users` — search, filter by status/role/country; paginated
- `GET /admin/users/{id}` — full user detail including activity log
- `POST /admin/users/{id}/suspend` — requires `duration_days` + `reason`
- `POST /admin/users/{id}/warn` — send in-app warning message
- `POST /admin/users/{id}/restore` — lift suspension

**Endpoints (Super Admin only):**
- `POST /admin/users/{id}/ban` — permanent ban + revoke all tokens
- `POST /admin/users/{id}/restore` — lift ban

**Sub-tasks**
- [ ] Implement all endpoints with role gates
- [ ] Log all actions to audit table
- [ ] On ban: revoke all tokens, broadcast `account.banned` to user

---

### TASK-071 — Admin Report Queue

| Field | Value |
|---|---|
| **ID** | TASK-071 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints:**
- `GET /admin/reports?status=pending&reason=hate_speech`
- `GET /admin/reports/{id}`
- `POST /admin/reports/{id}/resolve` — `{ "action": "warn|remove_content|suspend|ban|dismiss", "note": "..." }`

**Sub-tasks**
- [ ] Filter by `status`, `reason`, `reportable_type`
- [ ] `resolve` — execute action based on `action` param; update report status; log to audit

---

### TASK-072 — Admin Analytics

| Field | Value |
|---|---|
| **ID** | TASK-072 |
| **Size** | `L` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Endpoints (Super Admin):**
- `GET /admin/analytics/overview` — DAU, MAU, active rooms, revenue today, messages today
- `GET /admin/analytics/calls` — calls per day, avg duration, audio vs video split
- `GET /admin/analytics/revenue` — daily/monthly revenue, coin purchases, gift volume

**Endpoints (Admin + Super Admin):**
- `GET /admin/analytics/users` — registration trend, churn, country distribution

**Sub-tasks**
- [ ] Aggregate queries with `DATE_TRUNC` / MySQL `DATE()` grouping
- [ ] Cache analytics responses in Redis (TTL: 5 min)
- [ ] Support `?from=2026-01-01&to=2026-02-28` date range filter

---

### TASK-073 — Super Admin: Admin Account Management

| Field | Value |
|---|---|
| **ID** | TASK-073 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints:** `GET /admin/admins` · `POST /admin/admins` · `PUT /admin/admins/{id}` · `DELETE /admin/admins/{id}`

**Sub-tasks**
- [ ] Create admin: set `role = admin` + create `admin_permissions` record
- [ ] Edit permissions: update boolean fields in `admin_permissions`
- [ ] Delete: revert role to `user` + delete permissions
- [ ] Cannot delete own super_admin account

---

### TASK-074 — Super Admin: Gift Management

| Field | Value |
|---|---|
| **ID** | TASK-074 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Endpoints:** `GET /admin/gifts` · `POST /admin/gifts` · `PUT /admin/gifts/{id}` · `DELETE /admin/gifts/{id}`

**Sub-tasks**
- [ ] Create gift: upload animation file to S3
- [ ] Delete: soft delete (`is_active = false`) — preserve transaction history
- [ ] Bust gift catalog cache on any change

---

---

## Module 17 — WebSocket & Real-time

> **Driver:** Laravel Echo Server / Pusher / Soketi
> **Channels:** Private, Presence, Public

---

### TASK-075 — WebSocket Server Setup

| Field | Value |
|---|---|
| **ID** | TASK-075 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] Configure `BROADCAST_DRIVER=pusher` (or self-hosted Soketi)
- [ ] Define channels in `routes/channels.php`
- [ ] Private channel auth: `private-chat.{id}` — verify user is conversation member
- [ ] Presence channel auth: `presence-room.{id}` — verify user is room participant
- [ ] Private user channel: `private-user.{id}` — verify own user only

---

### TASK-076 — Broadcast Events Implementation

| Field | Value |
|---|---|
| **ID** | TASK-076 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Events to implement:**

| Event Class | Channel | Trigger |
|---|---|---|
| `MessageSent` | `private-chat.{id}` | Message created |
| `MessageTranslated` | `private-chat.{id}` | Translation complete |
| `MessageDeleted` | `private-chat.{id}` | Message soft deleted |
| `MessageSeen` | `private-chat.{id}` | Read receipt |
| `CallIncoming` | `private-user.{id}` | Call initiated |
| `CallAnswered` | `private-user.{id}` | Call answered |
| `CallEnded` | `private-user.{id}` | Call ended |
| `WebRtcOffer` | `private-user.{id}` | SDP offer |
| `WebRtcAnswer` | `private-user.{id}` | SDP answer |
| `WebRtcIceCandidate` | `private-user.{id}` | ICE candidate |
| `GiftSent` | `private-user.{id}` | Gift received |
| `RoomReaction` | `presence-room.{id}` | Emoji reaction |
| `RoomParticipantJoined` | `presence-room.{id}` | User joined |
| `RoomParticipantLeft` | `presence-room.{id}` | User left |
| `Notification` | `private-user.{id}` | Any notification |

**Sub-tasks**
- [ ] Create each `Event` class in `app/Events/`
- [ ] Implement `ShouldBroadcast` interface
- [ ] Use `broadcastOn()` to define channel
- [ ] Use `broadcastAs()` for clean event names

---

---

## Module 18 — Media & Storage

---

### TASK-077 — MediaService

| Field | Value |
|---|---|
| **ID** | TASK-077 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] `MediaService::upload(file, path): string` — upload to S3, return path
- [ ] `MediaService::signedUrl(path, ttl): string` — generate pre-signed URL
- [ ] `MediaService::delete(path): void` — delete from S3
- [ ] `MediaService::thumbnail(videoPath): string` — generate video thumbnail (FFmpeg)
- [ ] Use pre-signed URLs everywhere — never expose bucket directly

---

### TASK-078 — ProcessMediaUpload Job

| Field | Value |
|---|---|
| **ID** | TASK-078 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 1 day |

**Sub-tasks**
- [ ] For images: generate responsive sizes (400px, 800px, 1600px)
- [ ] For video: generate thumbnail at 1s mark using FFmpeg
- [ ] For audio: generate waveform data JSON
- [ ] Store processed results to S3
- [ ] Update `post_media` / `message_media` records with processed URLs

---

---

## Phase Z — Testing & QA

---

### TASK-079 — Feature Tests: Auth Module

| Field | Value |
|---|---|
| **ID** | TASK-079 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | QA / Backend Dev |
| **Est.** | 1 day |

**Test Cases**
- [ ] Register: success, duplicate email, weak password, missing fields
- [ ] Login: success, wrong password, banned user, suspended user
- [ ] Logout: success, unauthenticated
- [ ] Forgot/reset password: full flow
- [ ] Rate limit: 11th login attempt returns 429

---

### TASK-080 — Feature Tests: Chat Module

| Field | Value |
|---|---|
| **ID** | TASK-080 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | QA / Backend Dev |
| **Est.** | 1 day |

**Test Cases**
- [ ] Send message: text, image, group
- [ ] Non-member cannot access conversation — returns 403
- [ ] Blocked user cannot send message
- [ ] Translation job dispatched on message send
- [ ] Read receipt updates correctly

---

### TASK-081 — Feature Tests: Call Modules

| Field | Value |
|---|---|
| **ID** | TASK-081 |
| **Size** | `M` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | QA / Backend Dev |
| **Est.** | 1 day |

**Test Cases**
- [ ] Initiate call: TURN credentials returned
- [ ] Answer/decline updates status correctly
- [ ] Duration computed correctly on end
- [ ] Timeout job marks call as missed after 30s
- [ ] Blocked user cannot initiate call

---

### TASK-082 — Unit Tests: MatchingService

| Field | Value |
|---|---|
| **ID** | TASK-082 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | QA / Backend Dev |
| **Est.** | 1 day |

**Test Cases**
- [ ] Perfect exchange pair scores 100
- [ ] No language match returns score 0 (excluded)
- [ ] Blocked users excluded from results
- [ ] Inactive 31+ days scores 0 on activity factor
- [ ] Each scoring factor tested in isolation

---

### TASK-083 — Unit Tests: TranslationService

| Field | Value |
|---|---|
| **ID** | TASK-083 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | QA / Backend Dev |
| **Est.** | 1 day |

**Test Cases**
- [ ] Cache hit returns without calling API
- [ ] Cache miss calls API and stores result
- [ ] API failure returns original text (no exception bubble)
- [ ] Duplicate translation not stored

---

### TASK-084 — Security Testing

| Field | Value |
|---|---|
| **ID** | TASK-084 |
| **Size** | `L` |
| **Priority** | `🔴 Critical` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Security Engineer |
| **Est.** | 3 days |

**Test Areas**
- [ ] SQL injection: test all input fields with `' OR 1=1--` patterns
- [ ] JWT tampering: modified payload token rejected
- [ ] IDOR: user B cannot access user A's private conversations
- [ ] Rate limit bypass attempts
- [ ] Admin endpoint accessible only to admin/super_admin roles
- [ ] Media path traversal: `../../etc/passwd` in upload filenames
- [ ] Brute force protection: account locks after 5 failed logins

---

### TASK-085 — Load Testing

| Field | Value |
|---|---|
| **ID** | TASK-085 |
| **Size** | `L` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | QA |
| **Est.** | 2 days |

**Targets**
- [ ] 1,000 concurrent WebSocket connections — < 200ms latency
- [ ] 500 req/s on `GET /posts` feed endpoint — < 300ms p95
- [ ] 200 concurrent active calls — signaling relay stable
- [ ] Translation job queue: 10,000 messages/min processed within 2s

**Tools:** k6 or Locust

---

### TASK-086 — API Documentation

| Field | Value |
|---|---|
| **ID** | TASK-086 |
| **Size** | `M` |
| **Priority** | `🟡 High` |
| **Dev Status** | `🔲 Pending` |
| **Test Status** | `🔲 Pending` |
| **Git** | `🔲 Pending` |
| **Assigned** | Backend Dev |
| **Est.** | 2 days |

**Sub-tasks**
- [ ] Install `darkaonline/l5-swagger`
- [ ] Add `@OA\` annotations to all controllers
- [ ] Generate Swagger UI at `/api/documentation`
- [ ] Export Postman collection JSON
- [ ] Commit both to repo under `docs/api/`

---

---

## Task Summary

| Module | Total Tasks | Done | In Progress | Pending |
|---|---|---|---|---|
| Phase 0 — Foundation | 9 | 5 | 2 | 2 |
| Module 01 — Auth | 9 | 0 | 2 | 7 |
| Module 02 — User | 7 | 0 | 0 | 7 |
| Module 03 — Profile | 6 | 0 | 0 | 6 |
| Module 04 — Chat | 8 | 0 | 0 | 8 |
| Module 05 — Audio Call | 7 | 0 | 0 | 7 |
| Module 06 — Video Call | 1 | 0 | 0 | 1 |
| Module 07 — Voice Rooms | 4 | 0 | 0 | 4 |
| Module 08 — Feed & Posts | 3 | 0 | 0 | 3 |
| Module 09 — Comments | 1 | 0 | 0 | 1 |
| Module 10 — Likes | 1 | 0 | 0 | 1 |
| Module 11 — Gifts | 3 | 0 | 0 | 3 |
| Module 12 — Translation | 3 | 0 | 0 | 3 |
| Module 13 — Matching | 4 | 0 | 0 | 4 |
| Module 14 — Notifications | 2 | 0 | 0 | 2 |
| Module 15 — Reports | 1 | 0 | 0 | 1 |
| Module 16 — Admin | 5 | 0 | 0 | 5 |
| Module 17 — WebSocket | 2 | 0 | 0 | 2 |
| Module 18 — Media | 2 | 0 | 0 | 2 |
| Phase Z — Testing & QA | 8 | 0 | 0 | 8 |
| **TOTAL** | **86** | **5** | **4** | **77** |

---

> **How to update this file:**
> When a task status changes, update the `Dev Status`, `Test Status`, and `Git` fields in the task table.
> Check off sub-tasks as they are completed.
> Update the summary table at the bottom after each sprint.
