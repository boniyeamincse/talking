# Phase 1: Authentication — Testing Log
**Date:** 2026-02-26
**User:** `qauser` (`qa@example.com`)

## 1.1 Register New User
- **Command:** `POST /api/v1/auth/register`
- **Result:** PASSED (After fixes)
- **Fixes Applied:**
    1.  Updated `AuthController@register` to include `name` field in `User::create`.
    2.  Set `MAIL_MAILER=log` in `.env` to prevent local crashes on email send.
    3.  Ran `php artisan vendor:publish` and `php artisan migrate` for Sanctum's `personal_access_tokens` table.
- **Evidence:** User `qauser` created with correct language relationships.

## 1.4 Login (Valid)
- **Command:** `POST /api/v1/auth/login`
- **Result:** PASSED
- **Evidence:** Returned Bearer token and user profile.

## 1.5 Login (Invalid)
- **Command:** `POST /api/v1/auth/login` (Incorrect email/password)
- **Result:** PASSED
- **Evidence:** Correctly returned 401 Unauthorized with "Invalid credentials" message.

## 1.6 Logout
- **Command:** `POST /api/v1/auth/logout`
- **Result:** PASSED
- **Evidence:** Token invalidated; subsequent requests to `/users/me` returned 401.

## 1.7 Refresh Token
- **Command:** `POST /api/v1/auth/refresh`
- **Result:** PASSED
- **Evidence:** Old token invalidated, new token issued and functional.

---
**Status: ALL PASSED ✅**
