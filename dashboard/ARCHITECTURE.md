# BaniTalk Dashboard Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 Frontend                      │
│                    (dashboard/ folder)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Laravel 11 Backend API                     │
│                      (api/ folder)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Database (MySQL)                        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Frontend Structure

```
dashboard/
│
├── src/
│   │
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, metadata)
│   │   ├── page.tsx                  # Redirect to /admin
│   │   └── (dashboard)/              # Dashboard group
│   │       └── admin/                # Admin routes
│   │           ├── layout.tsx        # Dashboard layout (sidebar)
│   │           ├── page.tsx          # Dashboard home ✅
│   │           │
│   │           ├── users/            # User Management
│   │           │   ├── page.tsx      # User list ✅
│   │           │   └── [id]/
│   │           │       └── page.tsx  # User detail ✅
│   │           │
│   │           ├── reports/          # Content Moderation
│   │           │   └── page.tsx      # Reports ✅
│   │           │
│   │           ├── rooms/            # Voice Rooms
│   │           │   └── active/
│   │           │       └── page.tsx  # Active rooms ✅
│   │           │
│   │           ├── calls/            # Calls & Video
│   │           │   └── active/
│   │           │       └── page.tsx  # Active calls ✅
│   │           │
│   │           ├── gifts/            # Gifts & Economy
│   │           │   └── page.tsx      # Gift catalog ✅
│   │           │
│   │           ├── admins/           # Admin Management
│   │           │   └── page.tsx      # Admin list ✅
│   │           │
│   │           ├── analytics/        # Analytics
│   │           │   └── overview/
│   │           │       └── page.tsx  # Analytics ✅
│   │           │
│   │           ├── languages/        # Translation
│   │           │   └── page.tsx      # Languages ✅
│   │           │
│   │           └── settings/         # Settings
│   │               └── general/
│   │                   └── page.tsx  # General settings ✅
│   │
│   ├── components/                   # React Components
│   │   ├── dashboard/
│   │   │   └── Sidebar.tsx           # Navigation sidebar
│   │   ├── ui/
│   │   │   ├── Badge.tsx             # Status badges
│   │   │   ├── LoadingSpinner.tsx    # Loading states
│   │   │   ├── StatCard.tsx          # KPI cards
│   │   │   └── EmptyState.tsx        # Empty states
│   │   └── PageTemplate.tsx          # Page layout wrapper
│   │
│   └── lib/                          # Utilities & Config
│       ├── api.ts                    # API service layer
│       ├── types.ts                  # TypeScript types
│       ├── menu-config.ts            # Menu structure
│       └── utils.ts                  # Helper functions
│
├── public/                           # Static assets
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
└── next.config.ts                    # Next.js config
```

## 🔄 Data Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       │ User Action
       ▼
┌──────────────────┐
│  React Component │
│   (Page/UI)      │
└──────┬───────────┘
       │
       │ Call API
       ▼
┌──────────────────┐
│  API Service     │
│  (src/lib/api.ts)│
└──────┬───────────┘
       │
       │ HTTP Request
       │ + Auth Token
       ▼
┌──────────────────────┐
│  Laravel Backend     │
│  /api/v1/admin/*     │
└──────┬───────────────┘
       │
       │ Query/Update
       ▼
┌──────────────────┐
│    Database      │
│     (MySQL)      │
└──────────────────┘
```

## 🎨 Component Hierarchy

```
RootLayout
└── DashboardLayout
    ├── Sidebar
    │   ├── Logo
    │   ├── Search
    │   ├── Menu Items
    │   │   └── Sub Items
    │   └── Collapse Button
    │
    └── Page Content
        └── PageTemplate
            ├── Header (Title, Description, Actions)
            └── Content
                ├── LoadingSpinner (if loading)
                ├── EmptyState (if no data)
                └── Data Display
                    ├── StatCard (for metrics)
                    ├── Table (for lists)
                    ├── Grid (for cards)
                    └── Form (for settings)
```

## 🔐 Authentication Flow

```
┌─────────────┐
│   Login     │
│   Page      │
└──────┬──────┘
       │
       │ Submit credentials
       ▼
┌─────────────────┐
│  api.auth.login │
└──────┬──────────┘
       │
       │ POST /api/v1/auth/login
       ▼
┌─────────────────┐
│  Laravel API    │
│  Sanctum Auth   │
└──────┬──────────┘
       │
       │ Return token
       ▼
┌─────────────────┐
│  api.setToken   │
│  Store in       │
│  localStorage   │
└──────┬──────────┘
       │
       │ Redirect
       ▼
┌─────────────────┐
│  Dashboard      │
│  (Protected)    │
└─────────────────┘
```

## 📊 State Management

```
Component State (useState)
    │
    ├── Loading State (boolean)
    ├── Data State (array/object)
    ├── Error State (string/null)
    └── UI State (filters, search, etc.)
    
Effects (useEffect)
    │
    ├── Initial Data Load
    ├── Real-time Updates (intervals)
    └── Cleanup (clear intervals)
```

## 🎯 API Service Structure

```
api (ApiService class)
│
├── auth
│   ├── login(email, password)
│   └── logout()
│
├── users
│   ├── list(params)
│   ├── get(id)
│   ├── suspend(id, reason)
│   ├── restore(id)
│   ├── warn(id, reason)
│   └── ban(id, reason)
│
├── reports
│   ├── list(params)
│   ├── get(id)
│   ├── resolve(id, action)
│   └── dismiss(id, reason)
│
├── analytics
│   ├── overview()
│   ├── users(period)
│   ├── calls(period)
│   └── revenue(period)
│
├── admins
│   ├── list()
│   ├── create(data)
│   ├── update(id, data)
│   └── remove(id)
│
├── settings
│   ├── get()
│   └── update(data)
│
├── gifts
│   ├── list()
│   ├── create(data)
│   ├── update(id, data)
│   ├── delete(id)
│   ├── transactions(params)
│   └── leaderboard()
│
├── rooms
│   ├── active()
│   ├── history(params)
│   └── close(id)
│
├── calls
│   ├── active()
│   └── history(params)
│
├── chat
│   ├── conversations(params)
│   └── flagged()
│
├── notifications
│   ├── broadcast(data)
│   └── logs(params)
│
├── translation
│   ├── languages()
│   └── usage(params)
│
└── matching
    ├── overview()
    └── history(params)
```

## 🎨 Design System Layers

```
┌─────────────────────────────────────┐
│         Tailwind CSS 4              │
│    (Utility-first styling)          │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│      Custom Components              │
│  (StatCard, Badge, etc.)            │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│      Page Templates                 │
│  (PageTemplate, layouts)            │
└─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────┐
│         Pages                       │
│  (Dashboard, Users, etc.)           │
└─────────────────────────────────────┘
```

## 🔄 Real-time Updates

```
Component Mount
    │
    ▼
Initial Data Load
    │
    ▼
Set Interval (5s)
    │
    ├─► Fetch Latest Data
    │       │
    │       ▼
    │   Update State
    │       │
    │       ▼
    │   Re-render
    │       │
    └───────┘
    
Component Unmount
    │
    ▼
Clear Interval
```

## 📱 Responsive Breakpoints

```
Mobile      Tablet      Desktop     Wide
0-640px     641-768px   769-1024px  1025px+
   │           │            │           │
   ▼           ▼            ▼           ▼
1 column    2 columns   3 columns   4 columns
```

## 🎯 Menu System

```
MENU_CONFIG (16 menus)
│
├── Dashboard (SA)
│   └── 5 sub-items
│
├── Auth & Security (SA)
│   └── 8 sub-items
│
├── User Management (A)
│   └── 14 sub-items
│
├── Content Moderation (A)
│   └── 11 sub-items
│
├── Chat & Messaging (A)
│   └── 6 sub-items
│
├── Calls & Video (A)
│   └── 8 sub-items
│
├── Voice Rooms (A)
│   └── 9 sub-items
│
├── Social Feed (A)
│   └── 9 sub-items
│
├── Gifts & Economy (SA)
│   └── 15 sub-items
│
├── Translation System (SA)
│   └── 8 sub-items
│
├── Partner Matching (SA)
│   └── 8 sub-items
│
├── Notifications (SA)
│   └── 7 sub-items
│
├── Analytics (SA)
│   └── 13 sub-items
│
├── Speech Learning (SA)
│   └── 9 sub-items
│
├── Platform Settings (SA)
│   └── 12 sub-items
│
└── Audit Logs (SA)
    └── 6 sub-items

Total: 127 sub-items
```

## 🔐 Role-Based Access

```
User Roles
│
├── user (Regular User)
│   └── No admin access
│
├── admin (Admin)
│   ├── User Management ✓
│   ├── Content Moderation ✓
│   ├── Chat & Messaging ✓
│   ├── Calls & Video ✓
│   ├── Voice Rooms ✓
│   └── Social Feed ✓
│
└── super_admin (Super Admin)
    ├── All Admin permissions ✓
    ├── Dashboard ✓
    ├── Auth & Security ✓
    ├── Gifts & Economy ✓
    ├── Translation System ✓
    ├── Partner Matching ✓
    ├── Notifications ✓
    ├── Analytics ✓
    ├── Speech Learning ✓
    ├── Platform Settings ✓
    └── Audit Logs ✓
```

---

This architecture provides a scalable, maintainable foundation for the complete admin dashboard with clear separation of concerns and consistent patterns throughout.
