# Detailed BaniTalk APK Development Plan

This document provides a granular technical roadmap for## Current Status: **Phase 0 Complete** ✅

| Phase | Title | Status |
|---|---|---|
| Phase 0 | Base Architecture & Global UI | ✅ Complete |
| Phase 1 | Authentication & Onboarding UX | ✅ Complete |
| Phase 2 | Profiles & Social Discovery | ✅ Complete |

- [x] **Project Scaffolding**:
  - [x] `flutter create --org app.banitalk --platforms android,ios apk`
  - [x] Setup environment flavors (`dev`, `staging`, `prod`) using `flutter_flavorizr`.
- [x] **Core Design System**:
  - [x] Implemet `BaniTalkTheme` class (Dark/Light modes).
  - [x] Colors: Primary `#7C6AF7`, Surface `#111827`, BG `#080C14`.
  - [x] Typography: `Plus Jakarta Sans` and `Bricolage Grotesque`.
- [x] **Infrastructure**:
  - [x] State Management: `flutter_bloc` for feature-specific state; `Provider` for simple global configs.
  - [x] Networking: `Dio` with `dio_cookie_manager` for Sanctum state.
  - [x] Dependency Injection: `get_it` for service registration.
  - [x] Routing: `go_router` with protected routes (Auth Guard).

## 🔑 Phase 1: Authentication & Onboarding UX
**Goal:** Secure and delightful entry into the community.

- [x] **Auth Screens**:
  - [x] Premium Animated Login/Register screens.
  - [x] Social Auth buttons (Google/Apple) using `google_sign_in` and `sign_in_with_apple`.
- [x] **Onboarding Flow**:
  - [x] Interactive multi-step wizard using `PageView`.
  - [x] Step 1: Identity (Avatar upload via `image_picker` + `image_cropper`).
  - [x] Step 2: Languages (Searchable list of 180+ languages).
  - [x] Step 3: Cultural Interests (Tag cloud selection).
- [x] **Backend Sync**:
  - [x] Map to `/api/v1/auth/*` and `/api/v1/profiles/me`.

## 👥 Phase 2: Profiles & Social Discovery
**Goal:** Connecting users through cultural identity.

- [x] **My Profile**:
  - [x] Stats display (Followers, Following, Gifts).
  - [x] Badge system (VIP, Native Speaker, AI Coach).
- [x] **Social Search**:
  - [x] Elastic-style search bar with "Popular Searches" chips.
  - [x] User cards with online status indicators.
- [x] **Interactions**:
  - [x] Follow/Unfollow with micro-animations.
  - [x] Blocking logic (hides profile details immediatey).
- [x] **Backend Sync**:
  - [x] Map to `/api/v1/users/*` and `/api/v1/profiles/*`.

## 💬 Phase 3: Real-time Messaging System
**Goal:** Lag-free, rich communication.

- **Chat List**:
  - Swipe-to-delete/archive.
  - Unread message counters & last message preview.
- **Chat Window**:
  - Bubble UI with Tailwind-inspired styling.
  - **WebSockets**: `laravel_echo` + `pusher_client` for real-time delivery.
  - **Rich Input**: Emoji picker, voice note recorder, and media attachment.
  - Message reactions (Long press to react).
- **Backend Sync**:
  - Map to `/api/v1/chat/conversations/*` and `/api/v1/chat/messages/*`.

## 📞 Phase 4: WebRTC Voice & Video Calls
**Goal:** High-fidelity 1-to-1 connection.

- **Calling UI**:
  - Full-screen animated calling state (Glassmorphism effect).
  - Floating PiP (Picture-in-Picture) for multi-tasking.
- **RTC Engine**:
  - `flutter_webrtc` for P2P connection.
  - Handling SDP/ICE candidates via WebSocket signaling.
- **Hardware Integration**:
  - Camera/Mic permissions check.
  - Bluetooth/Earpiece switching via `audio_session`.
- **Backend Sync**:
  - Map to `/api/v1/calls/*` and `/api/v1/video/*`.

## 🎙️ Phase 5: Voice Rooms & Community
**Goal:** Collaborative cultural exchange.

- **Room Browser**:
  - Filter by Country, Language, or "Live Now".
- **Studio UI**:
  - Speaker "Stage" vs Audience "Floor".
  - Host toolkit (Mute all, Remove member, Edit topic).
- **Engagement**:
  - Live floating emoji reactions (Particle effects).
  - Text chat sidebar within the room.
- **Backend Sync**:
  - Map to `/api/v1/rooms/*`.

## 🌐 Phase 6: Global Social Feed (Moments)
**Goal:** Visual window into other cultures.

- **Infinite Feed**:
  - `CachedNetworkImage` for high-performance media loading.
  - Video auto-play on scroll using `video_player` + `chewie`.
- **Post Interactions**:
  - Instant Translation Toggle (In-place text replacement).
  - Nested comment threads with @mention support.
- **Content Creation**:
  - Multi-media picker (Up to 5 files).
  - Simple photo filters and text overlays.
- **Backend Sync**:
  - Map to `/api/v1/posts/*` and `/api/v1/comments/*`.

## 🤖 Phase 7: SL (Speech Learning) AI Modules
**Goal:** Gamified language mastery.

- **Pronunciation Coach**:
  - Waveform visualizer for user speech recording.
  - Visual scoring (0-100) with color-coded phoneme feedback.
- **Tongue Twister Levels**:
  - Level-locked progression (Easy -> Master).
  - Leaderboard for "Fastest Clear".
- **Backend Sync**:
  - Bridge to future AI processing endpoints.

## 🎁 Phase 8: Virtual Economy & Cultural Gifts
**Goal:** Rewarding connections.

- **Gift Shop**:
  - 3D-like gift icons (Sakura, Dragon, Coffee).
  - Lottie animations for premium gift delivery.
- **Wallet & Coins**:
  - In-app purchase (IAP) integration via `in_app_purchase` package.
  - Transaction history with status tracking.
- **Backend Sync**:
  - Map to `/api/v1/gifts/*` and `/api/v1/gifts/coins/*`.

## 🔔 Phase 9: Push Notifications & Matching
**Goal:** Retention and smart discovery.

- **Notifications**:
  - `firebase_messaging` for push alerts.
  - Custom notification sounds for calls vs messages.
- **Partner Matching**:
  - Discovery deck (Swipe right to match).
  - Accuracy meter based on interest overlap.
- **Backend Sync**:
  - Map to `/api/v1/notifications/*` and `/api/v1/matching/*`.

## 🚀 Phase 10: Production QA & Launch
**Goal:** Gold-standard stability.

- **Performance**:
  - Sentry/Firebase Crashlytics for error reporting.
  - Flutter DevTools profiling for frame drops.
- **Store Submission**:
  - Automated screenshots via `fastlane`.
  - App Store Optimization (ASO) metadata prep.
