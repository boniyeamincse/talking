# 🗺️ Development Roadmap – Talkin

## Overview

Talkin development is organized into phases, each delivering a working, testable product. The approach prioritizes core communication features first, then social and monetization layers.

---

## Phase 0 – Foundation (Weeks 1–2)

**Goal:** Project setup, CI/CD, and development environment.

### Tasks
- [ ] Initialize monorepo (backend / web / mobile)
- [ ] Set up Laravel project with Sanctum + API scaffolding
- [ ] Configure MySQL, Redis, S3 (local MinIO)
- [ ] Set up React + TypeScript + Vite project
- [ ] Initialize Flutter project
- [ ] Configure CI/CD pipeline (GitHub Actions)
- [ ] Set up staging and production environments
- [ ] Configure Nginx, SSL, domain
- [ ] Database migrations for core tables
- [ ] Seed `languages` table (180+ languages)
- [ ] Seed `gifts` table (initial gift set)

**Deliverable:** Deployable skeleton with working auth endpoint.

---

## Phase 1 – Authentication & Profiles (Weeks 3–4)

**Goal:** Users can register, login, and set up their profile.

### Backend
- [ ] Auth module (register, login, logout, refresh, email verify)
- [ ] Social auth (Google, Apple)
- [ ] User module (CRUD, search)
- [ ] Profile module (bio, avatar, country, gender)
- [ ] Language settings (native + learning)
- [ ] Cultural interests selection
- [ ] Interest tags
- [ ] Role system: `user`, `admin`, `super_admin`
- [ ] `admin_permissions` table and seeding

### Web
- [ ] Login / Register pages
- [ ] Profile setup flow (onboarding — includes cultural interests step)
- [ ] Profile view + edit
- [ ] Avatar upload

### Mobile
- [ ] Login / Register screens
- [ ] Onboarding flow (language + cultural interest selection)
- [ ] Profile screen

**Deliverable:** Full auth and profile system on web and mobile, with Admin role support.

---

## Phase 2 – Chat (Weeks 5–7)

**Goal:** Users can send and receive messages in real-time.

### Backend
- [ ] Conversation creation (direct + group)
- [ ] Message sending with WebSocket broadcast
- [ ] Message status (sent / delivered / seen)
- [ ] Message media upload
- [ ] Message reactions
- [ ] Block/unblock users

### Web
- [ ] Conversation list
- [ ] Chat window with real-time updates
- [ ] Message status indicators
- [ ] Emoji reactions
- [ ] Media sending

### Mobile
- [ ] Chat list screen
- [ ] Chat detail screen (real-time)
- [ ] Media sharing

**Deliverable:** Full real-time 1-to-1 and group chat.

---

## Phase 3 – Calls (Weeks 8–10)

**Goal:** Users can make audio and video calls.

### Backend
- [ ] Call initiation and signaling endpoints
- [ ] ICE candidate exchange
- [ ] Call record storage
- [ ] TURN server setup and credential issuance

### Web
- [ ] Audio call UI + WebRTC implementation
- [ ] Video call UI + WebRTC implementation
- [ ] In-call controls (mute, camera, end)
- [ ] Call history view

### Mobile
- [ ] Audio call screen
- [ ] Video call screen
- [ ] Incoming call notification

**Deliverable:** Working audio and video calls on web and mobile.

---

## Phase 4 – Instant Translation (Weeks 11–12)

**Goal:** Messages are automatically translated for both parties.

### Backend
- [ ] Translation service integration (Google Translate API)
- [ ] Translation caching (MySQL + Redis)
- [ ] Auto-translate on message receive
- [ ] Language detection
- [ ] Supported languages list endpoint

### Web + Mobile
- [ ] Show translated message by default
- [ ] "Show original" toggle
- [ ] Manual translate button for individual messages
- [ ] Translation language indicator

**Deliverable:** Seamless real-time translation in chat.

---

## Phase 5 – Voice Rooms (Weeks 13–15)

**Goal:** Users can create and join live voice discussion rooms.

### Backend
- [ ] Voice room CRUD
- [ ] Participant management (join/leave)
- [ ] Role management (host/cohost/speaker/audience)
- [ ] Raise hand + promotion flow
- [ ] Room reactions (emoji broadcast)
- [ ] Room history logging

### Web + Mobile
- [ ] Room list / browse
- [ ] Room UI with speaker grid
- [ ] Audience controls
- [ ] Host controls
- [ ] Live emoji reactions

**Deliverable:** Functional voice rooms (MVP mode — mesh WebRTC up to 8 speakers).

---

## Phase 6 – Social Feed (Weeks 16–17)

**Goal:** Users can post and browse a global social feed with country-based discussion areas.

### Backend
- [ ] Post CRUD (text, photo, video)
- [ ] Feed endpoint with algorithm
- [ ] Country-based discussion topic threads
- [ ] Comments and likes
- [ ] Follow/unfollow

### Web + Mobile
- [ ] Feed screen (infinite scroll)
- [ ] Create post with media
- [ ] Post detail with comments
- [ ] Like and comment interactions
- [ ] Country topics section (browse discussions by country)

**Deliverable:** Working social feed with follow system and country-based discussion topics.

---

## Phase 7 – Gift System (Weeks 18–19)

**Goal:** Users can send virtual gifts and purchase coins.

### Backend
- [ ] Gift catalog
- [ ] Coin balance management
- [ ] Gift send transaction
- [ ] Gift history
- [ ] Gift leaderboard
- [ ] Coin purchase (payment gateway integration)

### Web + Mobile
- [ ] Gift picker UI
- [ ] Gift animations
- [ ] Coin shop
- [ ] Gift history view
- [ ] Leaderboard

**Deliverable:** Full virtual gift and coin economy.

---

## Phase 8 – Partner Matching (Weeks 20–21)

**Goal:** Users are suggested language partners based on matching algorithm.

### Backend
- [ ] Matching algorithm implementation
- [ ] Scheduled matching jobs
- [ ] Match accept/decline flow
- [ ] Conversation auto-creation on match accept

### Web + Mobile
- [ ] Match suggestion cards
- [ ] Accept / Decline UI
- [ ] Matches list

**Deliverable:** Working partner matching system.

---

## Phase 9 – Notifications (Weeks 22–23)

**Goal:** Users receive real-time in-app and push notifications.

### Backend
- [ ] Notification database storage
- [ ] WebSocket notification broadcast
- [ ] FCM integration (Android + iOS + Web)
- [ ] Device token management
- [ ] Notification settings

### Web + Mobile
- [ ] Notification center UI
- [ ] Push notification permission flow
- [ ] Notification settings screen
- [ ] Call notification (foreground + background)

**Deliverable:** Full notification system.

---

## Phase 10 – Admin Dashboard (Weeks 24–25)

**Goal:** Super Admins can manage the platform; Admins can moderate content and users.

### Backend
- [ ] Super Admin scoped endpoints (ban, gifts, settings, revenue)
- [ ] Admin scoped endpoints (suspend, reports, rooms)
- [ ] Admin account creation and permission management
- [ ] Analytics data endpoints (split by role access)
- [ ] Voice room monitoring

### Web (Admin Panel)
- [ ] Overview dashboard (role-aware — revenue hidden from Admin)
- [ ] User management (ban for Super Admin, suspend for Admin)
- [ ] Admin management section (Super Admin only)
- [ ] Report queue and resolution UI
- [ ] Analytics charts (role-filtered)
- [ ] Gift management (Super Admin only)
- [ ] Access matrix enforcement in UI

**Deliverable:** Functional two-tier admin panel (Super Admin + Admin).

---

## Phase 11 – Beta Launch Preparation (Weeks 26–28)

- [ ] Full QA across all features
- [ ] Security audit and penetration testing
- [ ] Performance load testing
- [ ] App Store + Google Play submission
- [ ] Legal: Terms of Service, Privacy Policy
- [ ] Onboarding email sequences
- [ ] Beta invite system

**Deliverable:** Beta-ready product.

---

## Phase 12 – Public Launch & AI Features (Month 7+)

- [ ] AI pronunciation scoring
- [ ] AI conversation coach
- [ ] Toxic speech detection
- [ ] Smart captions (live subtitles in calls)
- [ ] SFU upgrade for voice rooms (mediasoup / LiveKit)
- [ ] Language learning tools (grammar, flashcards, challenges)
- [ ] Community groups

---

## Milestone Summary

| Milestone | Target Week | Key Feature |
|---|---|---|
| M1 – Auth Complete | Week 4 | Register, Login, Profile |
| M2 – Chat Complete | Week 7 | Real-time messaging |
| M3 – Calls Complete | Week 10 | Audio + video calls |
| M4 – Translation Live | Week 12 | Auto-translate in chat |
| M5 – Voice Rooms | Week 15 | Live voice rooms |
| M6 – Feed + Gifts | Week 19 | Social feed, gift economy |
| M7 – Matching | Week 21 | Partner matching |
| M8 – Notifications | Week 23 | Push + in-app alerts |
| M9 – Admin Panel | Week 25 | Moderation dashboard |
| **Beta Launch** | **Week 28** | **Full feature set** |
| **Public Launch** | **Month 8** | **AI features + scaling** |
