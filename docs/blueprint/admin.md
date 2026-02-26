# 📊 Admin Dashboard – Talkin

## Overview

The Admin Dashboard is a dedicated web interface (or embedded admin section) accessible only to Super Admins. It provides monitoring, moderation, and management capabilities for the entire Talkin platform.

---

## Dashboard Sections

### 1. Overview (Home)

Real-time platform health snapshot:

| Metric | Display |
|---|---|
| Active Users (now) | Live counter |
| Daily Active Users (DAU) | Line chart (30 days) |
| Monthly Active Users (MAU) | Number card |
| Total Registered Users | Number card |
| Active Voice Rooms | Live counter |
| Messages Sent Today | Counter |
| Calls in Progress | Live counter |
| Open Reports | Alert badge |
| Revenue Today | Currency value |

---

### 2. User Management

| Feature | Description |
|---|---|
| User List | Paginated, searchable, filterable list |
| User Profile View | Full profile, activity log, conversations (admin only) |
| Status Filter | Active / Suspended / Banned |
| Country Filter | Filter by country |
| Ban User | Permanent ban with reason |
| Suspend User | Temporary suspension with duration and reason |
| Restore User | Lift ban or suspension |
| Force Logout | Invalidate all tokens for a user |
| View Reports Filed Against User | List of all reports involving this user |

---

### 3. Content Moderation

#### Reports Queue

| Column | Description |
|---|---|
| Report ID | Unique report identifier |
| Reporter | User who submitted the report |
| Content Type | Post / Comment / Message / User / Room |
| Reason | Spam / Hate / Sexual / Violence / Other |
| Status | Pending / Reviewed / Resolved / Dismissed |
| Date | Report submission time |

#### Report Actions

- **View Content** — Preview the reported content
- **Remove Content** — Delete or hide from platform
- **Warn User** — Send an in-app warning
- **Suspend User** — Temporary suspension
- **Ban User** — Permanent removal
- **Dismiss Report** — Mark as not a violation

---

### 4. Voice Room Monitoring

| Feature | Description |
|---|---|
| Active Rooms List | Live list of all open rooms with participant count |
| Room Detail | View host, co-hosts, speakers, audience |
| Silent Join | Admin can join as invisible observer |
| Force Close Room | Immediately end a room (with reason logged) |
| Room History | Closed rooms with duration and participant count |
| Flag for Review | Mark a room for attention |

---

### 5. Analytics

#### User Analytics
- Registration trend (daily/weekly/monthly)
- Churn rate
- Retention cohorts
- Country distribution map
- Language distribution

#### Communication Analytics
- Messages sent per day
- Calls per day (audio + video)
- Average call duration
- Active voice rooms over time

#### Language Analytics
- Top native languages
- Top learning languages
- Most popular language pairs
- Translation API usage

#### Engagement Analytics
- Posts created per day
- Like/comment rates
- Gift transactions per day
- Match acceptance rate

---

### 6. Revenue & Monetization

| Metric | Description |
|---|---|
| Total Revenue | All-time and period-filtered |
| Daily Revenue | Chart (30 days) |
| Coin Purchases | Volume and value |
| Top Spending Users | Leaderboard |
| Gift Transactions | Volume by gift type |
| Revenue by Country | Geographic breakdown |
| Pending Payouts | Creator/host earnings awaiting transfer |

#### Gift Management
- Add new gifts with name, price, animation, culture tag
- Edit existing gifts (name, price, active status)
- Disable a gift (keeps history, hides from shop)
- View gift popularity rankings

---

### 7. Language Management

| Feature | Description |
|---|---|
| Language List | All supported languages with status |
| Add Language | Add a new supported language |
| Toggle Language | Enable/disable a language |
| Translation Stats | API usage and error rates per language |

---

### 8. System Settings

| Setting | Description |
|---|---|
| Maintenance Mode | Toggle platform maintenance state |
| Feature Flags | Enable/disable specific features |
| Rate Limit Config | Adjust API rate limits |
| TURN Server Config | Update WebRTC TURN credentials |
| FCM Config | Firebase push notification settings |
| Translation API | Switch or configure translation engine |

---

## Access & Security

- Admin panel accessible at `/admin` (separate subdomain recommended: `admin.talkin.app`)
- Protected by `role:admin` or `role:super_admin` middleware on all routes
- **Super Admin** accesses all sections including revenue, gift management, admin management, and platform settings
- **Admin** accesses moderation sections only: users (suspend, not ban), reports, voice rooms, and user-level analytics
- Session-based auth with short timeout (30 min inactivity)
- All admin actions audit-logged with admin ID, timestamp, and action details
- IP allowlist recommended for production

### Admin Role Access Matrix

| Section | Super Admin | Admin |
|---|---|---|
| Overview Dashboard | ✅ Full | ✅ Limited (no revenue) |
| User Management | ✅ Ban + Suspend | ✅ Suspend only |
| Admin Management | ✅ Create/Edit/Delete | ❌ No access |
| Content Moderation | ✅ | ✅ |
| Voice Room Monitoring | ✅ | ✅ |
| Analytics | ✅ Full | ✅ User stats only |
| Revenue & Monetization | ✅ | ❌ |
| Gift Management | ✅ | ❌ |
| Language Management | ✅ | ❌ |
| System Settings | ✅ | ❌ |

---

## Admin Notification Alerts

Admins receive in-dashboard alerts for:

- 🔴 Active user spike (sudden +50% in 1 hour)
- 🔴 High report volume (>100 reports in 1 hour)
- 🟡 Translation API error rate elevated
- 🟡 Failed payment rate elevated
- 🟢 Daily revenue milestone reached
