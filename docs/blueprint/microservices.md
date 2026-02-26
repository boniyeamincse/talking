# 🧩 Microservice Design – Talkin

## Overview

While Talkin's **MVP is built as a monolith** (single Laravel app), this document outlines how the system can be decomposed into microservices as traffic and team size grow.

The transition path is: **Monolith → Modular Monolith → Microservices**

---

## MVP: Modular Monolith (Recommended Start)

```
┌─────────────────────────────────────────────────┐
│              Laravel API (Monolith)              │
│                                                  │
│  [Auth]  [User]  [Chat]  [Call]  [Feed]          │
│  [Room]  [Gift]  [Match] [Notify] [Admin]        │
│                                                  │
│  Single database · Single deployment             │
└─────────────────────────────────────────────────┘
```

**Why start here:**
- Simpler deployment and debugging
- Faster iteration
- No distributed systems complexity
- Can extract services later as bottlenecks emerge

---

## Future: Microservice Architecture

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    │ (Rate limit,    │
                    │  Auth, Routing) │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │  Auth       │   │  User       │   │  Chat       │
   │  Service    │   │  Service    │   │  Service    │
   └─────────────┘   └─────────────┘   └─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │  Call       │   │  Feed       │   │  Gift       │
   │  Service    │   │  Service    │   │  Service    │
   └─────────────┘   └─────────────┘   └─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │ Translation │   │  Matching   │   │  Notify     │
   │  Service    │   │  Service    │   │  Service    │
   └─────────────┘   └─────────────┘   └─────────────┘
                             │
                    ┌────────┴────────┐
                    │  Message Bus    │
                    │  (RabbitMQ /   │
                    │   Kafka)        │
                    └─────────────────┘
```

---

## Service Definitions

### 1. Auth Service

**Responsibility:** User authentication and token management.

| Attribute | Value |
|---|---|
| Tech | Laravel (or lightweight Node.js) |
| DB | MySQL (users, sessions) |
| Exposes | JWT token issuance and validation |
| Consumes | — |
| Produces | `user.registered`, `user.logged_in` events |

---

### 2. User Service

**Responsibility:** User profiles, follows, blocks, language settings.

| Attribute | Value |
|---|---|
| Tech | Laravel |
| DB | MySQL (users, profiles, follows, blocks, languages) |
| Exposes | User data API for other services |
| Consumes | `user.registered` (from Auth) |
| Produces | `user.updated`, `user.deleted` events |

---

### 3. Chat Service

**Responsibility:** Direct messages and group chat.

| Attribute | Value |
|---|---|
| Tech | Node.js (high throughput) |
| DB | MongoDB or PostgreSQL (messages) |
| Cache | Redis (online status, unread counts) |
| Real-time | Socket.io |
| Exposes | Chat API + WebSocket |
| Consumes | `user.blocked` (to filter messages) |
| Produces | `message.sent` events |

---

### 4. Call Service

**Responsibility:** WebRTC call signaling and call records.

| Attribute | Value |
|---|---|
| Tech | Node.js |
| DB | MySQL (calls, video_calls) |
| Real-time | WebSocket (signaling) |
| Exposes | Call initiation / signaling API |
| Consumes | `user.status` (online/offline) |
| Produces | `call.started`, `call.ended` events |

---

### 5. Voice Room Service

**Responsibility:** Live voice rooms and SFU management.

| Attribute | Value |
|---|---|
| Tech | Node.js + mediasoup (SFU) |
| DB | Redis (room state) + MySQL (room history) |
| Real-time | WebSocket + WebRTC |
| Exposes | Room management API |
| Produces | `room.created`, `room.closed` events |

---

### 6. Feed Service

**Responsibility:** Posts, comments, likes, and feed generation.

| Attribute | Value |
|---|---|
| Tech | Laravel |
| DB | MySQL (posts, comments, likes) |
| Cache | Redis (feed cache per user) |
| Exposes | Feed API |
| Consumes | `user.followed`, `user.deleted` |
| Produces | `post.created`, `post.liked` events |

---

### 7. Gift Service

**Responsibility:** Virtual gift catalog, transactions, and coin economy.

| Attribute | Value |
|---|---|
| Tech | Laravel |
| DB | MySQL (gifts, gift_transactions, coin_transactions) |
| Exposes | Gift API |
| Consumes | `user.deleted` |
| Produces | `gift.sent` events |

---

### 8. Translation Service

**Responsibility:** Translate messages, posts, and arbitrary text.

| Attribute | Value |
|---|---|
| Tech | Laravel or Python (FastAPI) |
| DB | MySQL/Redis (translation cache) |
| External | Google Translate / DeepL / OpenAI |
| Exposes | Translation API |
| Consumes | `message.sent`, `post.created` (for pre-translation) |
| Produces | `translation.completed` events |

---

### 9. Matching Service

**Responsibility:** Partner match computation and suggestions.

| Attribute | Value |
|---|---|
| Tech | Python (ML-ready) or Laravel |
| DB | MySQL (matches) |
| Queue | Redis / RabbitMQ (for batch processing) |
| Exposes | Matching API |
| Consumes | `user.updated` (re-run matching on profile change) |
| Produces | `match.found` events |

---

### 10. Notification Service

**Responsibility:** Deliver in-app and push notifications.

| Attribute | Value |
|---|---|
| Tech | Node.js or Laravel |
| DB | MySQL (notifications, device_tokens) |
| External | Firebase Cloud Messaging |
| Exposes | Notification API |
| Consumes | ALL events from other services |
| Produces | Push notifications to devices |

---

## API Gateway

All client requests pass through the API Gateway:

| Feature | Implementation |
|---|---|
| Authentication validation | Validate JWT, reject invalid tokens |
| Rate limiting | Per user and per IP |
| Request routing | Route to appropriate microservice |
| Response aggregation | Combine responses from multiple services |
| Logging | Centralized request logging |
| SSL termination | Handle HTTPS at edge |

**Recommended:** Kong, Traefik, or Nginx + custom middleware

---

## Event Bus (Message Broker)

Services communicate asynchronously via events:

```
Producer Service
    │
    └─ Publish Event ──► Message Bus ──► Consumer Services
                         (Kafka/RabbitMQ)
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
              Notification  Matching  Feed Service
              Service       Service   (updates feed)
```

### Key Events

| Event | Producer | Consumers |
|---|---|---|
| `user.registered` | Auth | User, Notification |
| `user.updated` | User | Matching |
| `message.sent` | Chat | Translation, Notification |
| `call.started` | Call | Notification |
| `call.ended` | Call | Notification |
| `gift.sent` | Gift | Notification, Leaderboard |
| `post.created` | Feed | Translation, Notification |
| `match.found` | Matching | Notification |
| `room.created` | Voice Room | Notification |

---

## Deployment Topology

```
┌──────────────────────────────────────────────┐
│               Kubernetes Cluster              │
│                                              │
│  auth-service      (2 replicas)              │
│  user-service      (2 replicas)              │
│  chat-service      (4 replicas)              │
│  call-service      (3 replicas)              │
│  feed-service      (3 replicas)              │
│  translation-svc   (2 replicas)              │
│  notification-svc  (2 replicas)              │
│  matching-service  (1 replica + cron)        │
│                                              │
│  kafka / rabbitmq  (message bus)             │
│  redis cluster     (shared cache)            │
│  api-gateway       (3 replicas)              │
└──────────────────────────────────────────────┘
```

---

## Migration Path (Monolith → Microservices)

| Phase | Action |
|---|---|
| 1 (Now) | Build modular monolith with clean module boundaries |
| 2 | Extract Translation Service (external API dependency anyway) |
| 3 | Extract Notification Service (decouples FCM integration) |
| 4 | Extract Chat Service (highest throughput, benefits most from isolation) |
| 5 | Extract Matching Service (Python ML model) |
| 6 | Extract remaining services as needed |

**Strangler Fig pattern:** New services run alongside the monolith, with traffic gradually shifted until the monolith module is retired.
