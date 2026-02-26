# 🤖 Smart Partner Matching Algorithm – Talkin

## Overview

The partner matching system connects users who want to practice languages or make cross-cultural friends. It computes a match score between pairs of users based on multiple weighted factors, then surfaces the best matches.

---

## Matching Objectives

1. Connect language learners with native speakers of their target language
2. Match based on complementary language pairs (mutual exchange)
3. Factor in shared interests for quality conversation
4. Respect user preferences (age, gender, activity)
5. Promote active users over dormant accounts

---

## Matching Criteria & Weights

| Factor | Weight | Description |
|---|---|---|
| Language Compatibility | 35% | Native/learning language alignment |
| Mutual Exchange Fit | 20% | Can they help each other? |
| Shared Interests | 15% | Overlapping interest tags |
| Cultural Preferences | 10% | Cultural background affinity and curiosity |
| Activity Level | 10% | How recently and frequently active |
| Learning Goals | 5% | Similar goals (casual / serious) |
| Country / Region | 5% | Optional geographic preference |

Total: **100%**

---

## Scoring Formula

```
match_score = (
  language_score   * 0.35 +
  exchange_score   * 0.20 +
  interest_score   * 0.15 +
  culture_score    * 0.10 +
  activity_score   * 0.10 +
  goal_score       * 0.05 +
  region_score     * 0.05
) * 100
```

Score range: **0 – 100**
Minimum threshold to surface a match: **≥ 50**

---

## Factor Calculations

### Language Score (40%)

Evaluates how well the two users' language goals align.

**Scenario A: One-way learner**
- User A: Native = English, Learning = Japanese
- User B: Native = Japanese (any level)
- `language_score = 1.0` (perfect fit)

**Scenario B: Exchange pair**
- User A: Native = English, Learning = Japanese
- User B: Native = Japanese, Learning = English
- `language_score = 1.0` (ideal exchange pair, gets exchange_score bonus too)

**Scenario C: Partial match**
- User A: Learning = Japanese (intermediate)
- User B: Native = Japanese, also learning Spanish
- `language_score = 0.7`

**Scenario D: No match**
- No overlapping languages
- `language_score = 0.0` → excluded from matches

---

### Exchange Score (20%)

Did we find a mutual exchange opportunity?

```
exchange_score = 1.0   # User A's native = User B's learning AND
                       # User B's native = User A's learning
exchange_score = 0.5   # One-way only (A learns from B, not vice versa)
exchange_score = 0.0   # No exchange possible
```

---

### Interest Score (15%)

Jaccard similarity of interest tags:

```python
def interest_score(user_a_interests, user_b_interests):
    intersection = len(set(user_a_interests) & set(user_b_interests))
    union = len(set(user_a_interests) | set(user_b_interests))
    if union == 0:
        return 0.5  # neutral if no interests set
    return intersection / union
```

Example:
- User A: [music, travel, food, anime]
- User B: [anime, travel, gaming]
- Intersection: {anime, travel} = 2
- Union: 6
- Score: 2/6 = 0.33

---

### Cultural Score (10%)

Matches users based on cultural curiosity and affinity:

```python
def culture_score(user_a, user_b):
    # User A listed User B's culture in "curious about" list
    a_curious_about_b = user_b.country in user_a.cultural_interests
    b_curious_about_a = user_a.country in user_b.cultural_interests

    if a_curious_about_b and b_curious_about_a:
        return 1.0   # mutual cultural curiosity
    if a_curious_about_b or b_curious_about_a:
        return 0.6   # one-way cultural interest
    if user_a.country == user_b.country:
        return 0.4   # same culture — still relevant
    return 0.3       # neutral
```

Cultural interests are set during onboarding: "Which cultures are you most curious about?"

---

### Activity Score (10%)

Rewards recently active users:

```python
def activity_score(last_seen_at, avg_session_length, messages_sent_week):
    days_inactive = (now - last_seen_at).days

    recency = max(0, 1 - (days_inactive / 30))   # 0 if 30+ days inactive
    frequency = min(1, messages_sent_week / 50)   # capped at 50 messages/week
    
    return (recency * 0.6) + (frequency * 0.4)
```

---

### Goal Score (10%)

Both users want similar engagement level:

| User A Goal | User B Goal | Score |
|---|---|---|
| Casual chat | Casual chat | 1.0 |
| Serious study | Serious study | 1.0 |
| Casual chat | Serious study | 0.3 |
| Any | Any | 0.7 |

Goals set in profile: `casual`, `study`, `cultural_exchange`, `friendship`

---

### Region Score (5%)

Optional geographic preference:

```python
def region_score(user_a, user_b):
    if user_a.prefers_same_country and user_a.country == user_b.country:
        return 1.0
    if user_a.prefers_same_region and same_region(user_a, user_b):
        return 0.7
    return 0.5  # neutral if no preference
```

---

## Matching Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    MATCHING PIPELINE                         │
│                                                              │
│  1. Trigger: User updates profile OR scheduled daily job     │
│                           │                                  │
│  2. Candidate Pool        │                                  │
│     Filter by:            ▼                                  │
│     - Has target language overlap                            │
│     - Not already matched or declined                        │
│     - Not blocked                                            │
│     - Active in last 30 days                                 │
│     - Within age preference (if set)                         │
│     - Gender preference (if set)                             │
│                           │                                  │
│  3. Score Candidates      ▼                                  │
│     Compute match_score for each candidate                   │
│     Filter: score >= 50                                      │
│                           │                                  │
│  4. Rank & Limit          ▼                                  │
│     Sort descending by score                                 │
│     Take top 20 candidates                                   │
│                           │                                  │
│  5. Store & Notify        ▼                                  │
│     Save to matches table (status: pending)                  │
│     Send 'match.new' notification                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Anti-Gaming Rules

- **Declined cooldown**: If User A declines User B, User B won't appear for 30 days
- **Mutual decline**: If both decline, never match again
- **Daily limits**: Max 10 new match proposals sent per user per day
- **Blocked users**: Permanently excluded from matches
- **Spam score**: Users with high report rates get lower priority

---

## Match Lifecycle

```
                    pending
                       │
           ┌───────────┴───────────┐
           ▼                       ▼
        accepted               declined
           │
           ▼
    conversation opened
    (linked conversation_id stored on match)
           │
           ▼
        active match
           │
    (user can unmatch)
           ▼
        unmatched
```

---

## Database: `matches` Table

```sql
CREATE TABLE matches (
  id            BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT UNSIGNED NOT NULL,    -- who received the match
  matched_id    BIGINT UNSIGNED NOT NULL,    -- who was suggested
  status        ENUM('pending','accepted','declined','unmatched'),
  score         TINYINT UNSIGNED,            -- 0-100
  score_detail  JSON,                        -- breakdown per factor
  conversation_id BIGINT UNSIGNED NULL,      -- opened after accept
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (user_id, matched_id)
);
```

---

## Future Improvements

| Enhancement | Description | Priority |
|---|---|---|
| ML-based scoring | Train a model on successful conversations | High |
| Feedback loop | Use conversation length to improve future matching | High |
| Personality matching | Add quiz-based personality compatibility | Medium |
| Time zone matching | Match users who are online at the same time | Medium |
| A/B testing | Test different weight configurations | Low |
