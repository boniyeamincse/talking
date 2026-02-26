# 🚀 Feature Specifications – Talkin

## Feature Index

1. [Communication Module](#1-communication-module)
2. [Instant Translation System](#2-instant-translation-system)
3. [Smart Partner Matching](#3-smart-partner-matching)
4. [Voice Rooms / Voice Parties](#4-voice-rooms--voice-parties)
5. [Global Moments Feed](#5-global-moments-feed)
6. [Gift System](#6-gift-system)
7. [Interactive Reactions](#7-interactive-reactions)
8. [Language Learning Tools](#8-language-learning-tools)
9. [Community Groups](#9-community-groups)
10. [VoIP / Business Communication Features](#10-voip--business-communication-features)
11. [Future AI Features](#11-future-ai-features)

---

## Communication Philosophy

Talkin supports **multi-modal communication** — users are never locked into a single way of talking. Text, voice, and video are all first-class citizens of the platform, working together seamlessly:

| Mode | Use Case |
|---|---|
| 💬 Text Messaging | Asynchronous chat with translation, reactions, media |
| 🎧 Audio Call | Real-time voice when typing isn't enough |
| 🎥 Video Call | Face-to-face connection for deeper relationship building |
| 🎙️ Voice Rooms | Group audio — live discussions, karaoke, language practice |

All modes support real-time translation so language never creates a barrier regardless of which channel the user chooses.

---

## 1. Communication Module

### 1.1 Text Messaging (1-to-1 Chat)

| Feature | Description |
|---|---|
| Direct Messages | Private conversation between two users |
| Group Chat | Multi-user conversation threads |
| Emoji Reactions | React to individual messages with emojis |
| Media Sharing | Send images, videos, audio clips, files |
| Message Status | Sent → Delivered → Seen indicators |
| Message Translation | Auto-translate incoming messages to user's language |
| Message Delete | Delete for self or all participants |
| Message Reply | Reply to a specific message in thread |
| Typing Indicator | Show when the other party is typing |

**Technical Requirements:**
- WebSocket for real-time delivery
- End-to-end encryption for message content
- Message queue for offline delivery
- Media stored in S3 with signed URLs

---

### 1.2 Audio Call

| Feature | Description |
|---|---|
| 1-to-1 Voice Call | Direct audio call between users |
| Noise Suppression | Background noise filtering |
| Call History | Log of past calls with duration |
| Mute / Unmute | Toggle microphone during call |
| Speaker Toggle | Switch between earpiece and speaker |
| Call Decline | Decline incoming calls |
| Missed Call Notification | Alert for missed calls |

**Technical Requirements:**
- WebRTC for peer-to-peer audio
- STUN/TURN servers for NAT traversal
- Call signaling via WebSocket
- Fallback to server relay if P2P fails

---

### 1.3 Video Call

| Feature | Description |
|---|---|
| 1-to-1 Video Call | Peer-to-peer video call |
| Camera Switch | Toggle front/rear camera (mobile) |
| Mute Audio | Mute microphone during video call |
| Video Off | Disable video stream |
| Call Recording | Optional recording (with consent prompt) |
| Screen Share | (Future) Share screen during call |
| Virtual Backgrounds | (Future) Background blur/replace |

**Technical Requirements:**
- WebRTC with SDP negotiation
- ICE candidate exchange via signaling server
- Adaptive bitrate for poor connections
- TURN server for firewall bypass

---

## 2. Instant Translation System

### How It Works

```
Message sent by User A (Japanese)
         ↓
Translation API called
         ↓
Translated text stored alongside original
         ↓
User B receives message in English (their language)
User B can tap to see original Japanese
```

### Specifications

| Attribute | Value |
|---|---|
| Languages Supported | 180+ |
| Translation Engine | AI API / Google Translate API |
| Scope | Text messages, posts, comments, voice subtitles |
| Display | Show translated text by default; original on tap |
| Performance Target | < 500ms translation latency |
| Caching | Cache translations to reduce API calls |

### Translation Modes

- **Auto Translate** — Always translate incoming messages
- **Manual Translate** — User taps to translate individual messages
- **Original First** — Show original; translate on demand

---

## 3. Smart Partner Matching

### Matching Algorithm Inputs

| Factor | Weight | Description |
|---|---|---|
| Language Proficiency | High | Native vs. learner languages |
| Learning Goals | High | What languages they want to learn |
| Interests | Medium | Hobbies, topics, culture |
| Country / Region | Medium | Geographic proximity or cultural interest |
| Activity Level | Medium | Online frequency and response rate |
| Age Range | Low | Optional age-based filtering |
| Gender Preference | Low | Optional gender filter |

### Matching Process

```
1. User completes profile (languages, goals, interests)
2. Matching job runs on schedule or on-demand
3. Algorithm scores potential partners (0–100)
4. Top matches surfaced to user
5. User accepts or skips match
6. Accepted match opens a conversation
```

### Anti-spam Rules
- Maximum 10 match requests per day
- Cooldown period after repeated declines
- Blocked users never appear in matches

---

## 4. Voice Rooms / Voice Parties

### Room Structure

```
┌─────────────────────────────┐
│        VOICE ROOM           │
│  Host: @username            │
│  Topic: "Japanese Practice" │
│  Language: JA / EN          │
│                             │
│  🎙️ Host     🎙️ Co-Host     │
│  🎙️ Speaker  🎙️ Speaker     │
│  ─────────────────────────  │
│  Audience (listeners)       │
│  👤 👤 👤 👤 👤 👤 👤       │
└─────────────────────────────┘
```

### Features

| Feature | Description |
|---|---|
| Room Creation | Any user can create a voice room |
| Host Controls | Mute all, remove speakers, lock room |
| Co-host System | Host can assign co-hosts |
| Raise Hand | Audience requests to speak |
| Audience → Speaker | Host promotes audience to speaker |
| Room Decoration | Custom backgrounds, themes |
| Emoji Reactions | Live floating emoji reactions |
| Karaoke Mode | Background music + lyrics display |
| Discussion Mode | Structured debate/discussion format |
| Room Languages | Specify primary languages of room |
| Max Participants | Configurable (default: 200) |

---

## 5. Global Moments Feed

Social timeline for cultural sharing.

### Post Types

| Type | Description |
|---|---|
| Photo Post | Single or multiple images |
| Short Video | Up to 60-second video clips |
| Text Post | Text-only status update |
| Language Post | Share a phrase/word you learned |

### Feed Interactions

| Action | Description |
|---|---|
| Like | Tap to like a post |
| Comment | Leave a text comment |
| Share | Share post to profile or chat |
| Translate | Auto-translate post content |
| Report | Flag inappropriate content |
| Save | Save post to personal collection |

### Feed Algorithm
- Prioritizes posts from followed users
- Surfaces popular posts from user's language communities
- Mixes in posts from matched partners
- Chronological option available

---

## 6. Gift System

### Virtual Cultural Gifts

| Gift | Culture | Visual |
|---|---|---|
| Sakura | 🇯🇵 Japanese | Cherry blossom animation |
| Heart | 🇰🇷 Korean | Glowing heart burst |
| Coffee | 🇸🇦 Arabic | Steam rising from cup |
| Rose | 🇫🇷 French | Rose petal shower |
| Dragon | 🇨🇳 Chinese | Dragon animation |
| Tulip | 🇳🇱 Dutch | Blooming tulip |

### Gift Flow

```
Sender selects gift → Confirm purchase (coins) → 
Animation plays on receiver's screen → 
Receiver notified → Gift logged in history
```

### Gift Economy

| Feature | Description |
|---|---|
| Virtual Coins | In-app currency used to buy gifts |
| Gift Leaderboard | Top gift senders/receivers ranking |
| Revenue Share | Creators/hosts earn from received gifts |
| Gift History | Full log of sent and received gifts |
| Gift Bundles | Discounted coin packages |

---

## 7. Interactive Reactions

- Floating emoji animations in voice rooms
- Tap-to-react on chat messages
- Live reaction counters on posts
- Sticker support in chat
- Custom animated sticker packs (future)

---

## 8. Language Learning Tools

### Included Tools

| Tool | Description |
|---|---|
| Grammar Lessons | Structured grammar explanations by language |
| Vocabulary Lists | Curated word lists by topic and difficulty |
| Pronunciation Guide | Audio examples with phonetic breakdown |
| Practice Challenges | Daily challenges with streaks |
| Flashcards | Spaced repetition vocabulary practice |
| Language Communities | Groups organized by language |
| Progress Tracking | Track vocabulary learned and time practiced |

### Learning Integration
- Learning tools accessible in-app alongside chat
- Practice challenges linked to community groups
- Partner matches can specify "language exchange" mode

---

## 9. Community Groups

| Feature | Description |
|---|---|
| Language Groups | Groups organized by target language |
| Challenge Groups | Groups running learning competitions |
| Cultural Groups | Groups around countries/cultures |
| Topic Groups | Groups around interests (music, food, travel, etc.) |
| Country-based Discussion Topics | Public discussion threads organized by country — local news, culture, events |
| Group Posts | Members post to group timeline |
| Group Events | Schedule live voice sessions within groups |
| Group Roles | Admin, moderator, member tiers |

---

## 10. VoIP / Business Communication Features

Talkin includes a complete VoIP communication layer for both personal and business use.

| Feature | Description |
|---|---|
| Unlimited Voice Calling | No per-minute charges — call as long as needed |
| Voicemail to Email | Voicemails automatically transcribed and delivered to the user's email |
| Holiday Mode | Auto-route calls to voicemail during configured time periods (vacations, off-hours) |
| Call Forwarding | Forward calls to another registered user or external number |
| Call History & Logs | Full record of all calls with duration, timestamp, and caller info |
| Call Management Controls | Accept, decline, mute, transfer in-call |
| Multi-device Support | Receive calls on any logged-in device |

These features make Talkin viable not only for personal language exchange but also for small business and remote team communication.

---

## 11. Future AI Features

| Feature | Description | Priority |
|---|---|---|
| AI Pronunciation Scoring | Score and grade user pronunciation | High |
| AI Conversation Coach | Real-time suggestions during language exchange | High |
| Speech-to-Text Correction | Improve accuracy of voice transcription | Medium |
| Toxic Speech Detection | Flag harmful content in real-time | High |
| AI Moderation | Automatically review reported content | Medium |
| Smart Captions | Live subtitles during voice/video calls | Medium |
| Cultural Context Tips | AI explains idioms and cultural nuances | Low |
