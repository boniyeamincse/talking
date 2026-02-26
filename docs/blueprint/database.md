# 🗄️ Database Schema – Talkin

## Tables Overview

| Table | Description |
|---|---|
| `users` | Core user accounts |
| `profiles` | Extended user profile data |
| `languages` | Supported language list |
| `user_languages` | User ↔ language relationships |
| `conversations` | Chat conversation threads |
| `conversation_members` | Users in a conversation |
| `messages` | Individual chat messages |
| `message_media` | Media attachments for messages |
| `calls` | Audio call records |
| `video_calls` | Video call records |
| `voice_rooms` | Voice room definitions |
| `room_participants` | Users in a voice room |
| `posts` | Social feed posts |
| `post_media` | Media attached to posts |
| `comments` | Post comments |
| `likes` | Post and comment likes |
| `gifts` | Gift catalog |
| `gift_transactions` | Gift send/receive events |
| `coin_transactions` | Virtual coin purchases and usage |
| `matches` | Partner match records |
| `notifications` | User notifications |
| `reports` | User-submitted reports |
| `translations` | Cached translations |
| `blocks` | User block relationships |
| `follows` | User follow relationships |
| `groups` | Community groups |
| `group_members` | Group membership |

---

## Table Definitions

### `users`
```sql
CREATE TABLE users (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid          VARCHAR(36) UNIQUE NOT NULL,
  username      VARCHAR(50) UNIQUE NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password      VARCHAR(255),
  provider      ENUM('email','google','apple') DEFAULT 'email',
  provider_id   VARCHAR(255),
  role          ENUM('user','admin','super_admin') DEFAULT 'user',
  status        ENUM('active','suspended','banned') DEFAULT 'active',
  email_verified_at TIMESTAMP NULL,
  last_seen_at  TIMESTAMP NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `admin_permissions`
Stores fine-grained permission overrides for Admin role users (Super Admins have all permissions by default).

```sql
CREATE TABLE admin_permissions (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  can_ban_users   BOOLEAN DEFAULT FALSE,
  can_edit_gifts  BOOLEAN DEFAULT FALSE,
  can_view_revenue BOOLEAN DEFAULT FALSE,
  can_manage_rooms BOOLEAN DEFAULT TRUE,
  can_resolve_reports BOOLEAN DEFAULT TRUE,
  granted_by      BIGINT UNSIGNED NOT NULL,   -- super_admin user_id
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id)
);
```

### `profiles`
```sql
CREATE TABLE profiles (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED UNIQUE NOT NULL,
  display_name    VARCHAR(100),
  avatar          VARCHAR(500),  -- S3 URL
  bio             TEXT,
  country_code    VARCHAR(5),    -- ISO 3166-1 alpha-2
  date_of_birth   DATE,
  gender          ENUM('male','female','other','prefer_not_to_say'),
  is_public       BOOLEAN DEFAULT TRUE,
  coin_balance    INT UNSIGNED DEFAULT 0,
  cultural_interests JSON,       -- array of country codes e.g. ["JP","KR","FR"]
  learning_goal   ENUM('casual','study','cultural_exchange','friendship') DEFAULT 'casual',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `languages`
```sql
CREATE TABLE languages (
  id          SMALLINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code        VARCHAR(10) UNIQUE NOT NULL,  -- e.g. 'ja', 'en', 'zh-CN'
  name        VARCHAR(100) NOT NULL,
  native_name VARCHAR(100),
  flag_emoji  VARCHAR(10),
  is_active   BOOLEAN DEFAULT TRUE
);
```

### `user_languages`
```sql
CREATE TABLE user_languages (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  language_id SMALLINT UNSIGNED NOT NULL,
  type        ENUM('native','learning') NOT NULL,
  proficiency ENUM('beginner','elementary','intermediate','advanced','fluent','native'),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(id),
  UNIQUE (user_id, language_id, type)
);
```

### `conversations`
```sql
CREATE TABLE conversations (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid        VARCHAR(36) UNIQUE NOT NULL,
  type        ENUM('direct','group') DEFAULT 'direct',
  name        VARCHAR(100),       -- for group chats
  avatar      VARCHAR(500),       -- group avatar
  created_by  BIGINT UNSIGNED,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### `conversation_members`
```sql
CREATE TABLE conversation_members (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT UNSIGNED NOT NULL,
  user_id         BIGINT UNSIGNED NOT NULL,
  role            ENUM('admin','member') DEFAULT 'member',
  joined_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_read_at    TIMESTAMP NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (conversation_id, user_id)
);
```

### `messages`
```sql
CREATE TABLE messages (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid            VARCHAR(36) UNIQUE NOT NULL,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id       BIGINT UNSIGNED,
  type            ENUM('text','image','video','audio','file','gift','system') DEFAULT 'text',
  body            TEXT,
  original_body   TEXT,           -- original before translation
  original_lang   VARCHAR(10),    -- language code of original
  reply_to_id     BIGINT UNSIGNED NULL,
  is_deleted      BOOLEAN DEFAULT FALSE,
  sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
);
```

### `message_status`
```sql
CREATE TABLE message_status (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  message_id  BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  status      ENUM('delivered','seen') NOT NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (message_id, user_id)
);
```

### `calls`
```sql
CREATE TABLE calls (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid        VARCHAR(36) UNIQUE NOT NULL,
  caller_id   BIGINT UNSIGNED NOT NULL,
  callee_id   BIGINT UNSIGNED NOT NULL,
  status      ENUM('ringing','ongoing','ended','declined','missed','failed') DEFAULT 'ringing',
  started_at  TIMESTAMP NULL,
  ended_at    TIMESTAMP NULL,
  duration    INT UNSIGNED DEFAULT 0,  -- seconds
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caller_id) REFERENCES users(id),
  FOREIGN KEY (callee_id) REFERENCES users(id)
);
```

### `video_calls`
```sql
CREATE TABLE video_calls (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid            VARCHAR(36) UNIQUE NOT NULL,
  caller_id       BIGINT UNSIGNED NOT NULL,
  callee_id       BIGINT UNSIGNED NOT NULL,
  status          ENUM('ringing','ongoing','ended','declined','missed','failed') DEFAULT 'ringing',
  recording_url   VARCHAR(500) NULL,
  started_at      TIMESTAMP NULL,
  ended_at        TIMESTAMP NULL,
  duration        INT UNSIGNED DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caller_id) REFERENCES users(id),
  FOREIGN KEY (callee_id) REFERENCES users(id)
);
```

### `voice_rooms`
```sql
CREATE TABLE voice_rooms (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid            VARCHAR(36) UNIQUE NOT NULL,
  host_id         BIGINT UNSIGNED NOT NULL,
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  language_id     SMALLINT UNSIGNED,
  mode            ENUM('discussion','karaoke','open') DEFAULT 'discussion',
  is_public       BOOLEAN DEFAULT TRUE,
  max_speakers    INT DEFAULT 8,
  max_audience    INT DEFAULT 200,
  status          ENUM('active','closed') DEFAULT 'active',
  started_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at        TIMESTAMP NULL,
  FOREIGN KEY (host_id) REFERENCES users(id),
  FOREIGN KEY (language_id) REFERENCES languages(id)
);
```

### `room_participants`
```sql
CREATE TABLE room_participants (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  room_id     BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  role        ENUM('host','cohost','speaker','audience') DEFAULT 'audience',
  joined_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at     TIMESTAMP NULL,
  FOREIGN KEY (room_id) REFERENCES voice_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `posts`
```sql
CREATE TABLE posts (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  uuid        VARCHAR(36) UNIQUE NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        ENUM('text','photo','video','language') DEFAULT 'text',
  body        TEXT,
  language_id SMALLINT UNSIGNED,
  visibility  ENUM('public','followers','private') DEFAULT 'public',
  like_count  INT UNSIGNED DEFAULT 0,
  comment_count INT UNSIGNED DEFAULT 0,
  share_count INT UNSIGNED DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(id)
);
```

### `comments`
```sql
CREATE TABLE comments (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  post_id     BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED,
  body        TEXT NOT NULL,
  like_count  INT UNSIGNED DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### `likes`
```sql
CREATE TABLE likes (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  likeable_type   ENUM('post','comment') NOT NULL,
  likeable_id     BIGINT UNSIGNED NOT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, likeable_type, likeable_id)
);
```

### `gifts`
```sql
CREATE TABLE gifts (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  culture     VARCHAR(50),    -- e.g. 'Japanese'
  emoji       VARCHAR(20),
  animation   VARCHAR(500),   -- S3 URL to animation file
  coin_price  INT UNSIGNED NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### `gift_transactions`
```sql
CREATE TABLE gift_transactions (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  gift_id     BIGINT UNSIGNED NOT NULL,
  sender_id   BIGINT UNSIGNED NOT NULL,
  receiver_id BIGINT UNSIGNED NOT NULL,
  coin_amount INT UNSIGNED NOT NULL,
  context     ENUM('chat','voice_room','post') DEFAULT 'chat',
  context_id  BIGINT UNSIGNED NULL,  -- room_id or post_id
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gift_id) REFERENCES gifts(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

### `coin_transactions`
```sql
CREATE TABLE coin_transactions (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  type        ENUM('purchase','spend','earn','refund') NOT NULL,
  amount      INT NOT NULL,           -- positive or negative
  balance_after INT UNSIGNED NOT NULL,
  reference   VARCHAR(255),           -- payment gateway reference
  description VARCHAR(255),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### `matches`
```sql
CREATE TABLE matches (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  matched_id  BIGINT UNSIGNED NOT NULL,
  status      ENUM('pending','accepted','declined') DEFAULT 'pending',
  score       TINYINT UNSIGNED,  -- 0-100 match score
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, matched_id)
);
```

### `notifications`
```sql
CREATE TABLE notifications (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  type            VARCHAR(50) NOT NULL,   -- e.g. 'message', 'call', 'gift', 'match'
  title           VARCHAR(255),
  body            TEXT,
  data            JSON,                   -- extra payload
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### `reports`
```sql
CREATE TABLE reports (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  reporter_id     BIGINT UNSIGNED NOT NULL,
  reportable_type ENUM('user','post','comment','message','room') NOT NULL,
  reportable_id   BIGINT UNSIGNED NOT NULL,
  reason          ENUM('spam','harassment','hate_speech','sexual_content','violence','other') NOT NULL,
  description     TEXT,
  status          ENUM('pending','reviewed','resolved','dismissed') DEFAULT 'pending',
  resolved_by     BIGINT UNSIGNED NULL,
  resolved_at     TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id),
  FOREIGN KEY (resolved_by) REFERENCES users(id)
);
```

### `translations`
```sql
CREATE TABLE translations (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  source_type     ENUM('message','post','comment') NOT NULL,
  source_id       BIGINT UNSIGNED NOT NULL,
  source_lang     VARCHAR(10) NOT NULL,
  target_lang     VARCHAR(10) NOT NULL,
  translated_text TEXT NOT NULL,
  engine          VARCHAR(50),    -- 'google', 'deepl', 'openai'
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (source_type, source_id, target_lang)
);
```

### `blocks`
```sql
CREATE TABLE blocks (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  blocker_id  BIGINT UNSIGNED NOT NULL,
  blocked_id  BIGINT UNSIGNED NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (blocker_id, blocked_id)
);
```

### `follows`
```sql
CREATE TABLE follows (
  id          BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  follower_id BIGINT UNSIGNED NOT NULL,
  following_id BIGINT UNSIGNED NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (follower_id, following_id)
);
```

---

## Indexing Strategy

```sql
-- High-frequency lookups
CREATE INDEX idx_messages_conversation ON messages(conversation_id, sent_at);
CREATE INDEX idx_posts_user ON posts(user_id, created_at);
CREATE INDEX idx_posts_feed ON posts(visibility, created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at);
CREATE INDEX idx_gift_transactions_receiver ON gift_transactions(receiver_id);
CREATE INDEX idx_room_participants_room ON room_participants(room_id, left_at);
CREATE INDEX idx_translations_lookup ON translations(source_type, source_id, target_lang);
```
