# 🏗️ System Architecture – Talkin

## Architecture Overview

Talkin follows a **three-tier client-server architecture** with separate backend, web, and mobile layers, unified through a central REST API. Real-time features are handled via WebSocket, and peer-to-peer media (calls) uses WebRTC.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│  ┌──────────────────┐       ┌──────────────────────────┐   │
│  │  React Web App   │       │    Flutter Mobile App    │   │
│  │  (TypeScript)    │       │   (Android + iOS)        │   │
│  └────────┬─────────┘       └────────────┬─────────────┘   │
└───────────│──────────────────────────────│─────────────────┘
            │ HTTPS / WSS                  │ HTTPS / WSS
┌───────────▼──────────────────────────────▼─────────────────┐
│                    BACKEND SERVICES                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Laravel REST API                        │  │
│  │  Auth · Users · Chat · Calls · Rooms · Feed · Gifts  │  │
│  └───────────┬──────────────────────┬───────────────────┘  │
│              │                      │                       │
│  ┌───────────▼────┐    ┌────────────▼──────────────────┐   │
│  │ WebSocket      │    │  External Services             │   │
│  │ (Laravel Echo) │    │  - AI Translation API          │   │
│  │                │    │  - Firebase FCM                │   │
│  └───────────┬────┘    │  - AWS S3 / MinIO              │   │
│              │         │  - WebRTC Signaling            │   │
└──────────────│─────────└───────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────────────────┐
│                      DATA LAYER                              │
│   MySQL/PostgreSQL     Redis Cache     S3 Media Storage      │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend – Laravel API

| Component | Technology | Purpose |
|---|---|---|
| Framework | Laravel (PHP 8.x) | Core REST API |
| Authentication | JWT / Laravel Sanctum | Stateless auth tokens |
| Real-time | Laravel Echo + Socket Server | WebSocket broadcast |
| Database | MySQL / PostgreSQL | Primary data store |
| Cache | Redis | Sessions, queues, caching |
| Media Storage | AWS S3 / MinIO | Images, videos, audio |
| Translation | AI API / Google Translate | Message translation |
| Queue | Laravel Horizon (Redis) | Background jobs |
| Search | (Optional) Meilisearch / Algolia | User/post search |

### API Design Principles
- RESTful resource naming
- Versioned endpoints (`/api/v1/`)
- JSON:API response format
- Rate limiting per user/IP
- Consistent error response schema

---

## Web Frontend – React + TypeScript

| Component | Technology | Purpose |
|---|---|---|
| Framework | React 18 | UI rendering |
| Language | TypeScript | Type safety |
| State Management | Zustand / Redux Toolkit | Global state |
| Real-time | Socket.io Client | WebSocket connection |
| Voice & Video | WebRTC | P2P media calls |
| HTTP Client | Axios | API requests |
| Routing | React Router v6 | Page navigation |
| Styling | Tailwind CSS | UI styling |
| Build | Vite | Fast dev/build tooling |

---

## Mobile App – Flutter

| Component | Technology | Purpose |
|---|---|---|
| Framework | Flutter (Dart) | Cross-platform UI |
| Platforms | Android + iOS | Target platforms |
| State Management | Riverpod / Bloc | App state |
| Voice & Video | flutter_webrtc | WebRTC calls |
| Notifications | Firebase Messaging | Push alerts |
| HTTP Client | Dio | API requests |
| Local Storage | Hive / SharedPreferences | Offline data |
| Navigation | GoRouter | Routing |

---

## Real-time Architecture

```
Client A                   Server                    Client B
   │                         │                          │
   │── Connect WebSocket ──► │                          │
   │                         │ ◄── Connect WebSocket ───│
   │                         │                          │
   │── Send Message ────────►│                          │
   │                         │── Broadcast to Room ────►│
   │                         │                          │
   │                         │── Translate Message      │
   │                         │── Push Notification ────►│
```

### Channels
- `private-chat.{conversationId}` — 1-to-1 messages
- `presence-room.{roomId}` — voice room participants
- `private-user.{userId}` — personal notifications
- `presence-feed` — live feed updates

---

## WebRTC Call Flow (Summary)

```
Caller ──── Offer SDP ────► Signaling Server ──► Callee
Callee ◄─── Answer SDP ─── Signaling Server ◄── Callee
Both ─────── ICE Candidates ► Signaling Server
           ◄─── ICE Candidates ─────────────────
Both ═══════ Peer-to-Peer Media (Audio/Video) ═══════
```

See [`blueprint/webrtc-call-flow.md`](../blueprint/webrtc-call-flow.md) for full detail.

---

## Infrastructure & Deployment

```
┌────────────────────────────────────────────────┐
│                  Cloud Provider                 │
│                                                 │
│   ┌──────────┐   ┌──────────┐   ┌───────────┐  │
│   │  Web     │   │  API     │   │  Socket   │  │
│   │  Server  │   │  Server  │   │  Server   │  │
│   │ (Nginx)  │   │ (PHP-FPM)│   │ (Node.js) │  │
│   └──────────┘   └──────────┘   └───────────┘  │
│                                                 │
│   ┌──────────┐   ┌──────────┐   ┌───────────┐  │
│   │  MySQL/  │   │  Redis   │   │  S3 /     │  │
│   │ Postgres │   │  Cache   │   │  MinIO    │  │
│   └──────────┘   └──────────┘   └───────────┘  │
└────────────────────────────────────────────────┘
```

### Recommended Hosting
- **API + Web**: DigitalOcean / AWS EC2 / Railway
- **Database**: Managed MySQL (PlanetScale) or PostgreSQL (Supabase)
- **Redis**: Upstash or managed Redis
- **Media Storage**: AWS S3 or self-hosted MinIO
- **CDN**: Cloudflare

---

## Scalability Considerations

- Horizontal scaling of API servers behind a load balancer
- Redis pub/sub for WebSocket multi-server broadcasting
- Queue workers for translation, notifications, and media processing
- CDN for static assets and media delivery
- Database read replicas for high-traffic reads
