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

## Current Status: **Phase 7 In Progress** 🔄

| Phase | Title | Status |
|---|---|---|
| Phase 0 | Base Architecture & Global UI | ✅ Complete |
| Phase 1 | Authentication & Onboarding UX | ✅ Complete |
| Phase 2 | Profiles & Social Discovery | ✅ Complete |
| Phase 3 | Real-time Messaging System | ✅ Complete |
| Phase 4 | WebRTC Voice & Video Calls | ✅ Complete |
| Phase 5 | Voice Rooms & Community | ✅ Complete |
| Phase 6 | Global Social Feed (Moments) | ✅ Complete |

---

## 🎙️ Phase 5: Voice Rooms & Community
**Goal:** Lag-free, rich communication.

- [x] **Chat List**:
  - [x] Swipe-to-delete/archive.
  - [x] Unread message counters & last message preview.
- [x] **Chat Window**:
  - [x] Bubble UI with Tailwind-inspired styling.
  - [x] **WebSockets**: `laravel_echo` + `pusher_client` for real-time delivery.
  - [x] **Rich Input**: Emoji picker, voice note recorder, and media attachment.
  - [x] Message reactions (Long press to react).
- [x] **Backend Sync**:
  - [x] Map to `/api/v1/chat/conversations/*` and `/api/v1/chat/messages/*`.

## 📞 Phase 4: WebRTC Voice & Video Calls
**Goal:** High-fidelity 1-to-1 connection.

- [x] **Calling UI**:
  - [x] Full-screen animated calling state (Glassmorphism effect).
  - [x] Floating PiP (Picture-in-Picture) for multi-tasking.
- [x] **RTC Engine**:
  - [x] `flutter_webrtc` for P2P connection.
  - [x] Handling SDP/ICE candidates via WebSocket signaling.
- [x] **Hardware Integration**:
  - [x] Camera/Mic permissions check.
  - [x] Bluetooth/Earpiece switching via `audio_session`.
- [x] **Backend Sync**:
  - [x] Map to `/api/v1/calls/*` and `/api/v1/video/*`.

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

- [x] **Infinite Feed**:
  - [x] `CachedNetworkImage` for high-performance media loading.
  - [x] Video auto-play on scroll using `video_player` + `chewie`.
  - [x] Pull-to-refresh and pagination support.
- [x] **Post Interactions**:
  - [x] Instant Translation Toggle (In-place text replacement).
  - [x] Like/unlike with animation feedback.
  - [x] Share functionality.
- [x] **Content Creation**:
  - [x] Multi-media picker (Up to 5 files).
  - [x] Photo/video capture from camera.
  - [x] Gallery selection with preview.
- [x] **Nested Comments**:
  - [x] Comment threading with @mention support.
  - [x] Real-time comment updates.
  - [x] Like/unlike comments.
  - [x] Translation toggle for comments.
- [x] **Backend Sync**:
  - [x] Map to `/api/v1/posts/*` and `/api/v1/comments/*`.
  - [x] Real-time WebSocket integration.
  - [x] Error handling and offline support.

---

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
