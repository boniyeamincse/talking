# 📁 Project Folder Structure – Talkin

## Repository Overview

Talkin uses a **monorepo** structure with three main applications:

```
talkin/
├── README.md
├── docs/                    # Documentation (you are here)
├── blueprint/               # Technical design docs
├── backend/                 # Laravel API
├── web/                     # React + TypeScript Frontend
└── mobile/                  # Flutter Mobile App
```

---

## Backend – Laravel API

```
backend/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── RunMatchingJob.php
│   │       └── PruneOldNotifications.php
│   │
│   ├── Events/
│   │   ├── MessageSent.php
│   │   ├── CallInitiated.php
│   │   ├── GiftSent.php
│   │   └── RoomReaction.php
│   │
│   ├── Exceptions/
│   │   └── Handler.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── V1/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── UserController.php
│   │   │   │   │   ├── ProfileController.php
│   │   │   │   │   ├── ChatController.php
│   │   │   │   │   ├── CallController.php
│   │   │   │   │   ├── VideoCallController.php
│   │   │   │   │   ├── VoiceRoomController.php
│   │   │   │   │   ├── PostController.php
│   │   │   │   │   ├── CommentController.php
│   │   │   │   │   ├── LikeController.php
│   │   │   │   │   ├── GiftController.php
│   │   │   │   │   ├── TranslationController.php
│   │   │   │   │   ├── MatchingController.php
│   │   │   │   │   ├── NotificationController.php
│   │   │   │   │   └── ReportController.php
│   │   │   │   └── Admin/
│   │   │   │       ├── SuperAdmin/
│   │   │   │       │   ├── AdminAccountController.php
│   │   │   │       │   ├── AdminGiftController.php
│   │   │   │       │   ├── AdminAnalyticsController.php
│   │   │   │       │   └── AdminSettingsController.php
│   │   │   │       ├── AdminUserController.php
│   │   │   │       ├── AdminReportController.php
│   │   │   │       └── AdminRoomController.php
│   │   │   └── BaseController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   ├── CheckRole.php          # checks: user / admin / super_admin
│   │   │   ├── CheckSuperAdmin.php    # gate for super_admin-only routes
│   │   │   ├── RateLimitMessages.php
│   │   │   └── ForceJsonResponse.php
│   │   │
│   │   └── Requests/
│   │       ├── Auth/
│   │       │   ├── RegisterRequest.php
│   │       │   └── LoginRequest.php
│   │       ├── Chat/
│   │       │   └── SendMessageRequest.php
│   │       ├── Post/
│   │       │   └── CreatePostRequest.php
│   │       └── ...
│   │
│   ├── Jobs/
│   │   ├── TranslateMessage.php
│   │   ├── SendPushNotification.php
│   │   ├── RunMatchingAlgorithm.php
│   │   └── ProcessMediaUpload.php
│   │
│   ├── Listeners/
│   │   ├── SendMessageNotification.php
│   │   ├── BroadcastCallEvent.php
│   │   └── TriggerTranslation.php
│   │
│   ├── Models/
│   │   ├── User.php
│   │   ├── Profile.php
│   │   ├── Language.php
│   │   ├── Conversation.php
│   │   ├── Message.php
│   │   ├── Call.php
│   │   ├── VideoCall.php
│   │   ├── VoiceRoom.php
│   │   ├── RoomParticipant.php
│   │   ├── Post.php
│   │   ├── Comment.php
│   │   ├── Like.php
│   │   ├── Gift.php
│   │   ├── GiftTransaction.php
│   │   ├── Match.php
│   │   ├── Notification.php
│   │   ├── Report.php
│   │   └── Translation.php
│   │
│   ├── Notifications/
│   │   ├── NewMessageNotification.php
│   │   ├── IncomingCallNotification.php
│   │   ├── GiftReceivedNotification.php
│   │   └── MatchFoundNotification.php
│   │
│   ├── Policies/
│   │   ├── PostPolicy.php
│   │   ├── MessagePolicy.php
│   │   └── VoiceRoomPolicy.php
│   │
│   ├── Resources/
│   │   ├── UserResource.php
│   │   ├── MessageResource.php
│   │   ├── PostResource.php
│   │   └── ...
│   │
│   └── Services/
│       ├── TranslationService.php
│       ├── MatchingService.php
│       ├── WebRTCSignalingService.php
│       ├── GiftService.php
│       └── MediaService.php
│
├── config/
│   ├── app.php
│   ├── broadcasting.php
│   ├── sanctum.php
│   ├── translation.php        # custom
│   └── webrtc.php             # custom
│
├── database/
│   ├── factories/
│   ├── migrations/
│   │   ├── create_users_table.php
│   │   ├── create_profiles_table.php
│   │   ├── create_messages_table.php
│   │   └── ...
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── LanguageSeeder.php
│       └── GiftSeeder.php
│
├── routes/
│   ├── api.php
│   ├── channels.php           # WebSocket channel authorization
│   └── console.php
│
├── tests/
│   ├── Feature/
│   │   ├── AuthTest.php
│   │   ├── ChatTest.php
│   │   └── ...
│   └── Unit/
│       ├── MatchingServiceTest.php
│       └── TranslationServiceTest.php
│
├── .env.example
├── composer.json
└── README.md
```

---

## Web Frontend – React + TypeScript

```
web/
├── public/
│   ├── index.html
│   └── icons/
│
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios instance
│   │   ├── auth.ts
│   │   ├── chat.ts
│   │   ├── calls.ts
│   │   ├── posts.ts
│   │   ├── gifts.ts
│   │   └── rooms.ts
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── Loader.tsx
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── TranslationBadge.tsx
│   │   ├── calls/
│   │   │   ├── AudioCall.tsx
│   │   │   ├── VideoCall.tsx
│   │   │   └── CallControls.tsx
│   │   ├── feed/
│   │   │   ├── FeedPost.tsx
│   │   │   ├── PostComments.tsx
│   │   │   └── CreatePost.tsx
│   │   ├── rooms/
│   │   │   ├── VoiceRoom.tsx
│   │   │   ├── RoomParticipants.tsx
│   │   │   └── RoomControls.tsx
│   │   ├── gifts/
│   │   │   ├── GiftPicker.tsx
│   │   │   └── GiftAnimation.tsx
│   │   └── matching/
│   │       ├── MatchCard.tsx
│   │       └── MatchList.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useWebSocket.ts
│   │   ├── useWebRTC.ts
│   │   ├── useTranslation.ts
│   │   └── useNotifications.ts
│   │
│   ├── pages/
│   │   ├── Auth/
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── Chat/
│   │   │   ├── ChatList.tsx
│   │   │   └── ChatDetail.tsx
│   │   ├── Feed/
│   │   │   └── Feed.tsx
│   │   ├── Rooms/
│   │   │   ├── RoomList.tsx
│   │   │   └── RoomDetail.tsx
│   │   ├── Profile/
│   │   │   └── Profile.tsx
│   │   ├── Matching/
│   │   │   └── Matching.tsx
│   │   └── Admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminUsers.tsx
│   │       └── AdminReports.tsx
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── chatStore.ts
│   │   ├── notificationStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/
│   │   ├── user.ts
│   │   ├── message.ts
│   │   ├── post.ts
│   │   ├── call.ts
│   │   └── gift.ts
│   │
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── webrtcHelpers.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx
│
├── .env.example
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Mobile App – Flutter

```
mobile/
├── android/
├── ios/
├── lib/
│   ├── main.dart
│   ├── app.dart
│   │
│   ├── core/
│   │   ├── api/
│   │   │   ├── api_client.dart
│   │   │   ├── auth_api.dart
│   │   │   ├── chat_api.dart
│   │   │   ├── call_api.dart
│   │   │   └── post_api.dart
│   │   ├── constants/
│   │   │   ├── app_colors.dart
│   │   │   └── api_endpoints.dart
│   │   ├── models/
│   │   │   ├── user.dart
│   │   │   ├── message.dart
│   │   │   ├── post.dart
│   │   │   └── gift.dart
│   │   ├── services/
│   │   │   ├── auth_service.dart
│   │   │   ├── webrtc_service.dart
│   │   │   ├── socket_service.dart
│   │   │   └── notification_service.dart
│   │   └── utils/
│   │       ├── formatters.dart
│   │       └── validators.dart
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── screens/
│   │   │   │   ├── login_screen.dart
│   │   │   │   └── register_screen.dart
│   │   │   └── providers/
│   │   │       └── auth_provider.dart
│   │   ├── chat/
│   │   │   ├── screens/
│   │   │   │   ├── chat_list_screen.dart
│   │   │   │   └── chat_detail_screen.dart
│   │   │   ├── widgets/
│   │   │   │   ├── message_bubble.dart
│   │   │   │   └── message_input.dart
│   │   │   └── providers/
│   │   │       └── chat_provider.dart
│   │   ├── calls/
│   │   │   ├── screens/
│   │   │   │   ├── audio_call_screen.dart
│   │   │   │   └── video_call_screen.dart
│   │   │   └── providers/
│   │   │       └── call_provider.dart
│   │   ├── feed/
│   │   │   ├── screens/
│   │   │   │   └── feed_screen.dart
│   │   │   └── widgets/
│   │   │       ├── post_card.dart
│   │   │       └── create_post_sheet.dart
│   │   ├── rooms/
│   │   │   ├── screens/
│   │   │   │   ├── room_list_screen.dart
│   │   │   │   └── room_screen.dart
│   │   │   └── widgets/
│   │   │       └── room_participant_tile.dart
│   │   ├── gifts/
│   │   │   └── widgets/
│   │   │       ├── gift_picker.dart
│   │   │       └── gift_animation.dart
│   │   ├── matching/
│   │   │   ├── screens/
│   │   │   │   └── matching_screen.dart
│   │   │   └── widgets/
│   │   │       └── match_card.dart
│   │   └── profile/
│   │       ├── screens/
│   │       │   └── profile_screen.dart
│   │       └── widgets/
│   │           └── language_badges.dart
│   │
│   └── shared/
│       ├── widgets/
│       │   ├── avatar.dart
│       │   ├── loading_spinner.dart
│       │   └── error_view.dart
│       └── themes/
│           └── app_theme.dart
│
├── pubspec.yaml
├── .env
└── README.md
```

---

## Environment Variables

### Backend `.env.example`
```env
APP_NAME=Talkin
APP_ENV=local
APP_KEY=
APP_URL=https://api.talkin.app

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=talkin
DB_USERNAME=root
DB_PASSWORD=

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

BROADCAST_DRIVER=pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=

FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=ap-southeast-1
AWS_BUCKET=talkin-media

GOOGLE_TRANSLATE_API_KEY=
TRANSLATION_PROVIDER=google

FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

TURN_SERVER_URL=turn:turn.talkin.app:3478
TURN_SECRET=
```

### Web `.env.example`
```env
VITE_API_URL=https://api.talkin.app/api/v1
VITE_SOCKET_URL=wss://ws.talkin.app
VITE_PUSHER_KEY=
VITE_PUSHER_CLUSTER=
VITE_STUN_SERVER=stun:stun.l.google.com:19302
VITE_TURN_SERVER=turn:turn.talkin.app:3478
```
