# 👥 User Roles & Permissions – Talkin

## Role Overview

Talkin uses a **Role-Based Access Control (RBAC)** system with three defined roles:

| Role | Description |
|---|---|
| **Super Admin** | Full system control — platform config, analytics, monetization, all admin management |
| **Admin** | Delegated operational control — user management, content moderation, report handling |
| **User** | Regular platform member — all communication, social, and learning features |

Future roles may include **Moderator**, **Language Coach**, and **Verified Creator**.

---

## Super Admin

The Super Admin is responsible for platform health, user safety, and business operations. There is typically one or a small team of Super Admins.

### Permissions

#### User Management
- View all registered users
- Search and filter user accounts
- Edit user profiles (in emergency cases)
- Ban accounts permanently
- Suspend accounts temporarily (with duration)
- Lift bans or suspensions
- View user activity logs
- Impersonate users for debugging (audit-logged)

#### Content Moderation
- View all reported posts, messages, and comments
- Remove or hide reported content
- Issue warnings to users
- Escalate reports for review
- View moderation history

#### Language & Translation Management
- Add or remove supported languages
- Edit translation settings
- Review translation accuracy reports

#### Voice Room Monitoring
- View all active voice rooms
- Join any room silently (admin mode)
- Force-close rooms violating policies
- View room history and logs

#### Analytics Dashboard
- View platform-wide metrics
- Active users (DAU/MAU)
- Call statistics
- Language usage data
- Revenue reports

#### Gift & Monetization Control
- Manage gift catalog (add/remove/edit gifts)
- Set gift pricing
- Review and approve coin top-ups
- Handle refund requests
- Manage revenue sharing rules

#### Report Handling
- Review user-submitted reports
- Resolve reports with actions
- View report history and patterns

#### System Settings
- Manage platform configurations
- Feature flag management
- Maintenance mode toggle
- Create and manage Admin accounts
- Set Admin permissions scope

---

## Admin

The Admin role handles day-to-day operational moderation and user management. Admins report to and are managed by the Super Admin.

### Permissions

#### User Management
- View all registered users
- Search and filter user accounts
- Suspend accounts temporarily (with reason)
- Lift suspensions
- View user activity logs
- Cannot permanently ban users (Super Admin only)

#### Content Moderation
- View all reported posts, messages, and comments
- Remove or hide reported content
- Issue warnings to users
- View moderation history
- Cannot access admin management controls

#### Voice Room Monitoring
- View all active voice rooms
- Force-close rooms violating community guidelines
- View room history and participant logs

#### Report Handling
- Review user-submitted reports
- Resolve or escalate reports
- View full report history

#### Analytics (Read-only)
- View active user counts
- View report volume and resolution rates
- Cannot access revenue or monetization data

---

## User

Standard platform member with access to all social and communication features.

### Permissions

#### Account
- Register with email or social login
- Login / logout
- Reset password
- Delete own account

#### Profile
- Set display name and username
- Upload profile photo
- Set native and learning languages
- Add interests and bio
- Set country/region
- Control privacy settings (public/private profile)

#### Communication
- Send and receive direct messages
- Create and participate in group chats
- Make audio calls
- Make video calls
- Block / unblock other users
- Report users or content

#### Voice Rooms
- Create a voice room
- Join any public voice room as audience
- Speak when given permission
- Host own room (with host controls)
- Assign co-hosts in own room
- Send emoji reactions in rooms

#### Social Feed
- Create text, photo, and video posts
- Like and comment on posts
- Share posts
- Follow and unfollow users
- Save posts
- Translate posts and comments

#### Gifts
- Purchase virtual coins
- Send gifts to other users
- View gift history (sent/received)
- View gift leaderboard

#### Language Learning
- Access grammar lessons
- Use vocabulary flashcards
- Participate in practice challenges
- Track learning progress

#### Community
- Join and leave groups
- Post in groups
- Participate in group events
- Create groups

#### Partner Matching
- Set matching preferences
- View suggested matches
- Accept or decline matches
- Start conversation with matches

---

## Planned Future Roles

### Moderator (Planned)
- Community-level content moderation
- Can remove posts from managed groups
- Can issue warnings (not bans)
- Reports escalated to Super Admin

### Language Coach (Planned)
- Verified language teachers
- Can create structured lessons
- Premium listing in partner matching
- Revenue sharing from lesson purchases

### Verified Creator (Planned)
- Verified high-follower users
- Access to creator analytics
- Priority in feed algorithm
- Eligible for monetization program
