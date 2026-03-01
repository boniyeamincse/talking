# BaniTalk — Project Requirements Document

**Version:** 1.0  
**Last Updated:** March 1, 2026  
**Status:** Active Development

---

## 1. Executive Summary

BaniTalk is a comprehensive language learning and cultural exchange platform that connects people worldwide through real-time communication, AI-powered speech learning, and social features. The platform combines mobile (Flutter) and backend (Laravel) technologies to deliver a seamless multilingual social experience.

### 1.1 Project Vision
Break language barriers by creating an engaging platform where users can learn languages through authentic conversations, cultural exchange, and AI-powered learning tools.

### 1.2 Target Audience
- Language learners (beginner to advanced)
- Cultural exchange enthusiasts
- International students and professionals
- Travelers and global citizens
- Ages 16-45, tech-savvy users

---

## 2. System Architecture

### 2.1 Technology Stack

**Frontend (Mobile)**
- Framework: Flutter 3.27+
- Language: Dart 3.0+
- State Management: Provider/Riverpod
- Real-time: WebSocket, Agora SDK
- Video/Audio: WebRTC

**Backend (API)**
- Framework: Laravel 11.x
- Language: PHP 8.2+
- Database: MySQL 8.0+ / PostgreSQL 14+
- Cache: Redis
- Queue: Laravel Queue
- Real-time: Laravel WebSockets / Pusher

**Third-Party Services**
- Authentication: Google OAuth, Apple Sign-In
- Push Notifications: Firebase Cloud Messaging
- Voice Rooms: Agora SDK
- AI Speech Analysis: Custom ML models
- Payment: In-app purchases (iOS/Android)

### 2.2 System Components
```
┌─────────────────┐
│  Flutter APK    │
│  (Mobile App)   │
└────────┬────────┘
         │
         ├─── HTTP/REST ───┐
         ├─── WebSocket ───┤
         └─── WebRTC ──────┤
                           │
                    ┌──────▼──────┐
                    │ Laravel API │
                    │  (Backend)  │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │  MySQL  │      │  Redis  │      │  Agora  │
    │Database │      │  Cache  │      │   SDK   │
    └─────────┘      └─────────┘      └─────────┘
```

---

## 3. Functional Requirements

### 3.1 Authentication & User Management

**FR-AUTH-001: User Registration**
- Users must register with email/password or social OAuth
- Required fields: name, email, password, native language, learning languages
- Email verification required
- Password: minimum 8 characters, mixed case, numbers

**FR-AUTH-002: Social Login**
- Support Google OAuth 2.0
- Support Apple Sign-In
- Auto-create profile from social data

**FR-AUTH-003: Onboarding Flow**
- Language selection (native + learning)
- Interest selection
- Profile photo upload
- Privacy settings configuration

**FR-AUTH-004: Session Management**
- JWT/Sanctum token-based authentication
- Token refresh mechanism
- Multi-device support
- Logout from all devices option

### 3.2 User Profiles

**FR-PROFILE-001: Profile Information**
- Display name, bio, location, age
- Native language and learning languages
- Interests and hobbies
- Profile photo and cover photo
- Verification badge (optional)

**FR-PROFILE-002: Privacy Settings**
- Profile visibility (public/friends/private)
- Online status visibility
- Last seen visibility
- Block/unblock users
- Report users

**FR-PROFILE-003: Language Preferences**
- Add/remove learning languages
- Set proficiency levels
- Learning goals and targets

### 3.3 Real-time Messaging

**FR-CHAT-001: One-on-One Chat**
- Send text messages
- Send media (photos, videos, audio)
- Message status (sent, delivered, read)
- Typing indicators
- Message reactions (emoji)
- Delete messages (for self/everyone)

**FR-CHAT-002: Group Chat**
- Create group conversations
- Add/remove participants
- Group admin roles
- Group name and photo
- Participant limit: 100 users

**FR-CHAT-003: Message Features**
- Message search
- Message translation (inline)
- Voice messages
- File sharing (documents, images)
- Message forwarding
- Copy/paste messages

**FR-CHAT-004: Real-time Sync**
- WebSocket connection for instant delivery
- Offline message queue
- Message persistence
- Cross-device synchronization

### 3.4 Voice & Video Calls

**FR-CALL-001: One-on-One Calls**
- Initiate voice calls
- Initiate video calls
- Call notifications
- Accept/decline calls
- End call functionality

**FR-CALL-002: Call Features**
- Mute/unmute microphone
- Enable/disable camera
- Switch camera (front/back)
- Speaker/earpiece toggle
- Call duration display

**FR-CALL-003: Call Quality**
- WebRTC peer-to-peer connection
- Adaptive bitrate
- Network quality indicator
- Reconnection on network drop

**FR-CALL-004: Call History**
- Call logs (incoming, outgoing, missed)
- Call duration records
- Redial functionality

### 3.5 Voice Rooms (Audio Spaces)

**FR-ROOM-001: Room Management**
- Create public/private rooms
- Room capacity: 10-50 participants
- Room topics and tags
- Room cover image
- Schedule rooms (future feature)

**FR-ROOM-002: Participant Roles**
- Host: full control
- Co-host: moderate participants
- Speaker: can speak
- Listener: listen only
- Request to speak functionality

**FR-ROOM-003: Room Features**
- Raise hand to speak
- Mute/unmute participants (host)
- Kick participants (host)
- Room reactions (emoji)
- Room chat (text)

**FR-ROOM-004: Room Discovery**
- Browse active rooms
- Filter by language/topic
- Search rooms
- Recommended rooms

### 3.6 Social Feed (Moments)

**FR-FEED-001: Post Creation**
- Create text posts
- Upload photos (up to 10)
- Upload videos (up to 60 seconds)
- Add location tags
- Add language tags
- Post privacy settings

**FR-FEED-002: Post Interactions**
- Like posts
- Comment on posts
- Share posts
- Save posts
- Report posts

**FR-FEED-003: Feed Algorithm**
- Personalized feed based on interests
- Language-based filtering
- Following feed
- Discover feed
- Trending posts

**FR-FEED-004: Comments**
- Nested comments (replies)
- Like comments
- Delete own comments
- Report comments

### 3.7 Speech Learning (AI Coach)

**FR-SPEECH-001: Pronunciation Practice**
- Tongue twisters by difficulty
- Common phrases practice
- Custom text practice
- Record and analyze pronunciation

**FR-SPEECH-002: AI Analysis**
- Pronunciation accuracy score
- Phoneme-level feedback
- Comparison with native speaker
- Improvement suggestions

**FR-SPEECH-003: Progress Tracking**
- Practice history
- Accuracy trends
- Achievements and badges
- Daily streak tracking

**FR-SPEECH-004: Learning Content**
- Categorized by language
- Difficulty levels (beginner, intermediate, advanced)
- Topic-based lessons
- Cultural context notes

### 3.8 Virtual Economy & Gifts

**FR-GIFT-001: Coin System**
- Virtual currency (coins)
- Purchase coins (in-app)
- Earn coins (daily login, achievements)
- Coin balance display
- Transaction history

**FR-GIFT-002: Gift Catalog**
- Gift categories (flowers, food, luxury)
- Gift animations
- Gift prices in coins
- Limited edition gifts

**FR-GIFT-003: Sending Gifts**
- Send gifts in chat
- Send gifts in voice rooms
- Send gifts on posts
- Gift notifications
- Gift leaderboard

**FR-GIFT-004: Monetization**
- In-app purchase packages
- Subscription tiers (optional)
- Gift redemption (future)

### 3.9 Partner Matching

**FR-MATCH-001: Discovery Deck**
- Swipe interface (like/pass)
- User cards with profile info
- Language compatibility display
- Interest matching score

**FR-MATCH-002: Matching Algorithm**
- Language learning goals
- Shared interests
- Location proximity
- Activity level
- Age range preferences

**FR-MATCH-003: Match Management**
- View matches
- Start conversation
- Unmatch users
- Match suggestions

**FR-MATCH-004: Preferences**
- Set age range
- Set distance range
- Language preferences
- Gender preferences

### 3.10 Notifications

**FR-NOTIF-001: Push Notifications**
- New messages
- Call notifications
- Match notifications
- Gift received
- Post interactions
- Room invitations

**FR-NOTIF-002: In-App Notifications**
- Notification center
- Unread count badge
- Mark as read
- Notification history

**FR-NOTIF-003: Notification Settings**
- Enable/disable by type
- Quiet hours
- Sound preferences
- Vibration preferences

### 3.11 Admin Panel

**FR-ADMIN-001: User Management**
- View all users
- Ban/unban users
- Delete users
- View user activity

**FR-ADMIN-002: Content Moderation**
- Review reported content
- Remove inappropriate posts
- Moderate voice rooms
- Ban words/phrases

**FR-ADMIN-003: Analytics**
- User growth metrics
- Engagement statistics
- Revenue reports
- System health monitoring

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-PERF-001: Response Time**
- API response time: < 200ms (95th percentile)
- Message delivery: < 500ms
- App launch time: < 3 seconds

**NFR-PERF-002: Scalability**
- Support 100,000+ concurrent users
- Handle 1M+ messages per day
- Database query optimization

**NFR-PERF-003: Resource Usage**
- App size: < 50MB
- Memory usage: < 200MB
- Battery efficient background operations

### 4.2 Security

**NFR-SEC-001: Data Protection**
- HTTPS/TLS for all communications
- End-to-end encryption for calls
- Encrypted data at rest
- GDPR compliance

**NFR-SEC-002: Authentication**
- Secure password hashing (bcrypt)
- Token expiration and refresh
- Rate limiting on auth endpoints
- Brute force protection

**NFR-SEC-003: Privacy**
- User data anonymization
- Right to be forgotten
- Data export functionality
- Privacy policy compliance

### 4.3 Reliability

**NFR-REL-001: Availability**
- 99.9% uptime SLA
- Graceful degradation
- Automatic failover
- Health check endpoints

**NFR-REL-002: Data Integrity**
- Database backups (daily)
- Transaction rollback support
- Data validation
- Audit logging

### 4.4 Usability

**NFR-USE-001: User Experience**
- Intuitive navigation
- Consistent UI/UX patterns
- Accessibility support (WCAG 2.1)
- Multi-language support (i18n)

**NFR-USE-002: Responsiveness**
- Smooth animations (60 FPS)
- Optimistic UI updates
- Loading states
- Error handling with user feedback

### 4.5 Compatibility

**NFR-COMP-001: Platform Support**
- iOS 13.0+
- Android 8.0+ (API 26+)
- Tablet support
- Landscape/portrait modes

**NFR-COMP-002: Network**
- Work on 3G/4G/5G/WiFi
- Offline mode (limited features)
- Low bandwidth optimization

---

## 5. API Requirements

### 5.1 RESTful API Design
- Follow REST principles
- Versioned endpoints (/api/v1/)
- JSON request/response format
- Standard HTTP status codes
- Pagination for list endpoints

### 5.2 API Documentation
- OpenAPI/Swagger specification
- Interactive API explorer
- Code examples
- Authentication guide

### 5.3 Rate Limiting
- 100 requests/minute per user
- 1000 requests/hour per IP
- Exponential backoff on errors

---

## 6. Database Requirements

### 6.1 Core Tables
- users
- profiles
- conversations
- messages
- calls
- voice_rooms
- posts
- comments
- gifts
- transactions
- notifications
- matches
- reports

### 6.2 Data Retention
- Messages: indefinite (user-controlled)
- Call logs: 90 days
- Notifications: 30 days
- Deleted content: 30 days (soft delete)

---

## 7. Testing Requirements

### 7.1 Unit Testing
- 80%+ code coverage
- Test critical business logic
- Mock external dependencies

### 7.2 Integration Testing
- API endpoint testing
- Database integration tests
- Third-party service mocks

### 7.3 E2E Testing
- Critical user flows
- Cross-platform testing
- Performance testing

### 7.4 QA Process
- Manual testing checklist
- Beta testing program
- Bug tracking system
- Regression testing

---

## 8. Deployment Requirements

### 8.1 Backend Deployment
- Docker containerization
- CI/CD pipeline
- Blue-green deployment
- Database migrations

### 8.2 Mobile Deployment
- App Store submission
- Google Play submission
- Beta testing (TestFlight, Internal Testing)
- Version management

### 8.3 Monitoring
- Application performance monitoring
- Error tracking (Sentry)
- Analytics (Firebase, Mixpanel)
- Server monitoring

---

## 9. Compliance & Legal

### 9.1 Data Privacy
- GDPR compliance (EU)
- CCPA compliance (California)
- Privacy policy
- Terms of service
- Cookie policy

### 9.2 Content Policy
- Community guidelines
- Content moderation rules
- Age restrictions (16+)
- Prohibited content list

### 9.3 Intellectual Property
- User-generated content rights
- Third-party licenses
- Open source compliance

---

## 10. Success Metrics

### 10.1 User Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- User retention rate
- Churn rate

### 10.2 Engagement Metrics
- Messages sent per day
- Call duration
- Voice room participation
- Post interactions

### 10.3 Business Metrics
- Revenue per user
- Conversion rate (free to paid)
- Gift transaction volume
- Customer acquisition cost

---

## 11. Future Enhancements

### 11.1 Phase 2 Features
- AI chatbot language tutor
- Live translation in calls
- Language certification tests
- Gamification system

### 11.2 Phase 3 Features
- Web application
- Desktop applications
- AR/VR language experiences
- Corporate/education plans

---

## 12. Constraints & Assumptions

### 12.1 Constraints
- Budget: TBD
- Timeline: 12 months to v1.0
- Team size: 5-10 developers
- Third-party API costs

### 12.2 Assumptions
- Users have stable internet
- Users grant necessary permissions
- Third-party services remain available
- Market demand for language learning

---

## 13. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Third-party API changes | High | Medium | Abstract API calls, maintain fallbacks |
| Scalability issues | High | Medium | Load testing, horizontal scaling |
| Security breaches | Critical | Low | Security audits, penetration testing |
| User adoption | High | Medium | Marketing, user feedback, iterations |
| Regulatory changes | Medium | Low | Legal consultation, compliance monitoring |

---

## 14. Glossary

- **APK**: Android Package Kit (mobile app)
- **WebRTC**: Web Real-Time Communication
- **Agora**: Third-party SDK for voice rooms
- **Sanctum**: Laravel authentication system
- **WebSocket**: Protocol for real-time bidirectional communication
- **i18n**: Internationalization
- **GDPR**: General Data Protection Regulation

---

## 15. Approval & Sign-off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | | | |
| Technical Lead | | | |
| QA Lead | | | |
| Stakeholder | | | |

---

**Document Control**
- Version: 1.0
- Created: March 1, 2026
- Last Modified: March 1, 2026
- Next Review: April 1, 2026
- Owner: BaniTalk Team

---

*This document is a living document and will be updated as requirements evolve.*
