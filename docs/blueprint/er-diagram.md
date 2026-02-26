# 🗂️ Entity-Relationship Diagram – Talkin

## ER Diagram (Text Notation)

```
┌─────────────────┐        ┌──────────────────┐
│      USERS      │        │     PROFILES     │
├─────────────────┤        ├──────────────────┤
│ id (PK)         │◄───────│ user_id (FK, UQ) │
│ uuid            │  1:1   │ display_name     │
│ username        │        │ avatar           │
│ email           │        │ bio              │
│ password        │        │ country_code     │
│ role            │        │ coin_balance     │
│ status          │        │ is_public        │
│ created_at      │        └──────────────────┘
└────────┬────────┘
         │
         │ 1:M (has many)
         │
         ├──────────────────────────────────────────────────┐
         │                                                  │
         ▼                                                  ▼
┌──────────────────────┐                    ┌──────────────────────┐
│   USER_LANGUAGES     │                    │       FOLLOWS        │
├──────────────────────┤                    ├──────────────────────┤
│ id (PK)              │                    │ id (PK)              │
│ user_id (FK)         │                    │ follower_id (FK)     │
│ language_id (FK)     │                    │ following_id (FK)    │
│ type (native/learn)  │                    └──────────────────────┘
│ proficiency          │
└──────────────────────┘

         │                 M:N relationship via user_languages
         ▼
┌─────────────────┐
│    LANGUAGES    │
├─────────────────┤
│ id (PK)         │
│ code            │
│ name            │
│ native_name     │
│ is_active       │
└─────────────────┘


──────────────────────────────────────────────────────────────────
CHAT SYSTEM
──────────────────────────────────────────────────────────────────

┌────────────────────────┐
│     CONVERSATIONS      │
├────────────────────────┤
│ id (PK)                │
│ type (direct/group)    │
│ name                   │
│ created_by (FK→users)  │
└───────────┬────────────┘
            │ 1:M
            │
   ┌────────┴──────────────────────────────────────┐
   │                                               │
   ▼                                               ▼
┌─────────────────────┐           ┌─────────────────────────┐
│ CONVERSATION_MEMBERS│           │       MESSAGES          │
├─────────────────────┤           ├─────────────────────────┤
│ id (PK)             │           │ id (PK)                 │
│ conversation_id(FK) │           │ conversation_id (FK)    │
│ user_id (FK)        │           │ sender_id (FK→users)    │
│ role                │           │ type                    │
│ last_read_at        │           │ body                    │
└─────────────────────┘           │ original_body           │
                                  │ original_lang           │
                                  │ reply_to_id (self FK)   │
                                  └────────────┬────────────┘
                                               │ 1:M
                                               ▼
                                  ┌─────────────────────────┐
                                  │    MESSAGE_STATUS       │
                                  ├─────────────────────────┤
                                  │ id (PK)                 │
                                  │ message_id (FK)         │
                                  │ user_id (FK)            │
                                  │ status (delivered/seen) │
                                  └─────────────────────────┘


──────────────────────────────────────────────────────────────────
CALLS
──────────────────────────────────────────────────────────────────

┌──────────────────┐       ┌──────────────────┐
│      CALLS       │       │   VIDEO_CALLS    │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │
│ caller_id (FK)   │       │ caller_id (FK)   │
│ callee_id (FK)   │       │ callee_id (FK)   │
│ status           │       │ status           │
│ started_at       │       │ recording_url    │
│ ended_at         │       │ started_at       │
│ duration         │       │ ended_at         │
└──────────────────┘       └──────────────────┘


──────────────────────────────────────────────────────────────────
VOICE ROOMS
──────────────────────────────────────────────────────────────────

┌──────────────────────┐
│     VOICE_ROOMS      │
├──────────────────────┤
│ id (PK)              │
│ host_id (FK→users)   │◄─── 1 user hosts 1:M rooms (over time)
│ title                │
│ language_id (FK)     │
│ mode                 │
│ status               │
└──────────┬───────────┘
           │ 1:M
           ▼
┌──────────────────────┐
│  ROOM_PARTICIPANTS   │
├──────────────────────┤
│ id (PK)              │
│ room_id (FK)         │
│ user_id (FK)         │
│ role (host/speaker/..│
│ joined_at            │
│ left_at              │
└──────────────────────┘


──────────────────────────────────────────────────────────────────
SOCIAL FEED
──────────────────────────────────────────────────────────────────

┌──────────────────────┐
│        POSTS         │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ type                 │
│ body                 │
│ like_count           │
│ comment_count        │
└──────────┬───────────┘
           │
   ┌───────┴────────────────────────┐
   │                                │
   ▼                                ▼
┌──────────────────┐    ┌──────────────────────┐
│     COMMENTS     │    │        LIKES         │
├──────────────────┤    ├──────────────────────┤
│ id (PK)          │    │ id (PK)              │
│ post_id (FK)     │    │ user_id (FK)         │
│ user_id (FK)     │    │ likeable_type        │
│ body             │    │ likeable_id          │
│ like_count       │    │ (polymorphic)        │
└──────────────────┘    └──────────────────────┘


──────────────────────────────────────────────────────────────────
GIFTS & ECONOMY
──────────────────────────────────────────────────────────────────

┌──────────────────────┐        ┌──────────────────────────┐
│        GIFTS         │        │    GIFT_TRANSACTIONS     │
├──────────────────────┤        ├──────────────────────────┤
│ id (PK)              │◄───────│ gift_id (FK)             │
│ name                 │  M:1   │ sender_id (FK→users)     │
│ culture              │        │ receiver_id (FK→users)   │
│ coin_price           │        │ coin_amount              │
│ animation            │        │ context                  │
│ is_active            │        │ created_at               │
└──────────────────────┘        └──────────────────────────┘

┌──────────────────────────┐
│    COIN_TRANSACTIONS     │
├──────────────────────────┤
│ id (PK)                  │
│ user_id (FK)             │
│ type (purchase/spend/..  │
│ amount                   │
│ balance_after            │
│ reference                │
└──────────────────────────┘


──────────────────────────────────────────────────────────────────
MATCHING
──────────────────────────────────────────────────────────────────

┌──────────────────────┐
│       MATCHES        │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK→users)   │
│ matched_id (FK→users)│
│ status               │
│ score (0-100)        │
│ score_detail (JSON)  │
│ conversation_id (FK) │
└──────────────────────┘

UNIQUE: (user_id, matched_id)


──────────────────────────────────────────────────────────────────
TRANSLATION CACHE
──────────────────────────────────────────────────────────────────

┌──────────────────────────┐
│       TRANSLATIONS       │
├──────────────────────────┤
│ id (PK)                  │
│ source_type (polymorphic)│
│ source_id                │
│ source_lang              │
│ target_lang              │
│ translated_text          │
│ engine                   │
└──────────────────────────┘

UNIQUE: (source_type, source_id, target_lang)


──────────────────────────────────────────────────────────────────
REPORTS & MODERATION
──────────────────────────────────────────────────────────────────

┌──────────────────────────┐
│         REPORTS          │
├──────────────────────────┤
│ id (PK)                  │
│ reporter_id (FK→users)   │
│ reportable_type          │
│ reportable_id            │
│ reason                   │
│ status                   │
│ resolved_by (FK→users)   │
└──────────────────────────┘
```

---

## Relationship Summary

| Relationship | Type | Notes |
|---|---|---|
| users ↔ profiles | 1:1 | Each user has exactly one profile |
| users ↔ languages | M:N | Via `user_languages` |
| users ↔ conversations | M:N | Via `conversation_members` |
| conversations → messages | 1:M | Each conversation has many messages |
| messages → messages | self-ref | `reply_to_id` for threaded replies |
| users → posts | 1:M | |
| posts → comments | 1:M | |
| users/posts/comments → likes | polymorphic | Via `likeable_type` + `likeable_id` |
| voice_rooms → room_participants | 1:M | |
| users ↔ users (matches) | M:N | Via `matches` table |
| users ↔ users (blocks) | M:N | Via `blocks` table |
| users ↔ users (follows) | M:N | Via `follows` table |
| messages/posts/comments → translations | polymorphic 1:M | Via `source_type` + `source_id` |
