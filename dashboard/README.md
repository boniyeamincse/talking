# BaniTalk Super Admin Dashboard

A comprehensive Next.js 16 admin dashboard for managing the BaniTalk platform with 16 main menus and 127 sub-pages.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

## 📁 Project Structure

```
dashboard/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── admin/
│   │   │       ├── page.tsx                    # Dashboard Overview
│   │   │       ├── users/
│   │   │       │   ├── page.tsx                # User List
│   │   │       │   └── [id]/page.tsx           # User Detail
│   │   │       ├── reports/page.tsx            # Content Moderation
│   │   │       ├── rooms/active/page.tsx       # Active Voice Rooms
│   │   │       ├── calls/active/page.tsx       # Active Calls
│   │   │       ├── gifts/page.tsx              # Gift Catalog
│   │   │       ├── admins/page.tsx             # Admin Management
│   │   │       ├── analytics/overview/page.tsx # Analytics
│   │   │       ├── languages/page.tsx          # Translation System
│   │   │       └── settings/general/page.tsx   # Platform Settings
│   │   ├── layout.tsx                          # Root Layout
│   │   └── page.tsx                            # Redirect to /admin
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── Sidebar.tsx                     # Navigation Sidebar
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── EmptyState.tsx
│   │   └── PageTemplate.tsx                    # Reusable Page Layout
│   └── lib/
│       ├── api.ts                              # API Service Layer
│       ├── types.ts                            # TypeScript Types
│       ├── menu-config.ts                      # Menu Configuration
│       └── utils.ts                            # Utility Functions
├── public/                                     # Static Assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🎯 Features

### ✅ Implemented
- **Dashboard Overview** - KPIs, live stats, system health
- **User Management** - List, search, filter, view details, warn/suspend/ban/restore
- **Content Moderation** - Report queue with pending/resolved/dismissed tabs
- **Voice Rooms** - Live room monitoring with real-time updates
- **Active Calls** - Monitor audio/video calls in real-time
- **Gift Catalog** - Manage virtual gifts and economy
- **Admin Management** - Create and manage admin accounts
- **Analytics** - Platform-wide metrics and insights
- **Translation System** - 180+ language management
- **Platform Settings** - General settings and feature toggles

### 🎨 UI/UX
- Glass morphism design
- Dark mode support
- Responsive layout
- Smooth animations (Framer Motion)
- Collapsible sidebar with search
- Role-based menu items (SA/A)
- Loading states
- Empty states
- Error handling

## 📋 Complete Menu Structure

### 1. Dashboard (SA)
- Overview & KPIs
- Live Online Users
- Platform Health
- API Status Monitor
- Quick Actions

### 2. Auth & Security (SA)
- Admin Accounts ✅
- Create Admin
- Role & Permissions
- Active Sessions
- Login Audit Log
- Security Events
- Banned IP Addresses
- Two-Factor Auth

### 3. User Management (A)
- All Users ✅
- Search & Filter ✅
- User Profile View ✅
- Edit User Profile
- User Activity Timeline
- Verified Accounts
- Suspended Users
- Banned Users
- Warn User ✅
- Suspend User ✅
- Ban User ✅
- Restore Account ✅
- User Badges & Roles
- Online / Offline Status

### 4. Content Moderation (A)
- Report Queue ✅
- Pending Reports ✅
- Resolved Reports ✅
- Dismissed Reports ✅
- Post Moderation
- Comment Moderation
- Message Moderation
- Spam Detection
- Harassment Flags
- Moderation History
- AI Toxic Content Flags

### 5. Chat & Messaging (A)
- Conversation Monitor
- Flagged Messages
- Group Chats
- Media Uploads
- Message Statistics
- Deleted Message Log

### 6. Calls & Video (A)
- Active Calls (Live) ✅
- Audio Call History
- Video Call History
- Missed Calls
- Call Duration Stats
- Call Analytics
- TURN Server Status
- WebRTC Signal Logs

### 7. Voice Rooms (A)
- Active Rooms (Live) ✅
- All Rooms History
- Monitor Room (Silent)
- Force Close Room ✅
- Remove Host
- Karaoke Sessions
- Room Reports
- Speaker Stats
- Audience Analytics

### 8. Social Feed (A)
- All Posts
- Trending Posts
- Country Topics
- Reported Posts
- Removed Posts
- Trending Hashtags
- Feed Algorithm Config
- Post Analytics
- Saved Posts Overview

### 9. Gifts & Economy (SA)
- Gift Catalog ✅
- Add New Gift
- Edit / Manage Gifts
- Gift Categories
- Gift Transactions (Live)
- Gift Leaderboard
- Top Senders
- Top Earners (Influencers)
- Coin Purchase History
- Coin Balances Overview
- Revenue from Coins
- Transaction Ledger
- Economic Balance Ratio
- Payment Gateway Logs
- Refund Requests

### 10. Translation System (SA)
- Language Management ✅
- Add Language
- Translation API Usage
- Translation Cache
- Error Rate Monitor
- Auto-Translate Config
- Language Usage Stats
- Language Heatmap

### 11. Partner Matching (SA)
- Match Overview
- Match Success Rate
- Algorithm Config
- Scoring Weights
- Match History
- Pending Matches
- Run Matching Job
- Rejected Matches

### 12. Notifications (SA)
- Send Announcement
- Push Log (FCM)
- Delivery Reports
- Failed Notifications
- Device Tokens (FCM)
- Notification Templates
- Quiet Hours Config

### 13. Analytics (SA)
- Platform Overview ✅
- User Growth (DAU/MAU)
- Retention & Churn
- Country Distribution
- Language Heatmap
- Cultural Exchange Map
- Trending Topics
- Call Analytics
- Feed Engagement
- Revenue Analytics
- API Response Times
- Error Rates (Sentry)
- Queue Performance

### 14. Speech Learning (SL) (SA)
- SL Overview
- Grammar Lessons
- Vocabulary Lists
- Pronunciation Scoring
- Tongue Twister Module
- Daily Challenges
- User SL Progress
- SL Analytics
- Flutter Integration

### 15. Platform Settings (SA)
- General Settings ✅
- Feature Flags
- Maintenance Mode
- Rate Limit Config
- TURN Server Config
- Storage Config (S3)
- Translation API Keys
- Firebase / FCM Config
- Payment Gateway (Stripe)
- Email / SMTP Config
- WebSocket Config
- CDN / CloudFront

### 16. Audit Logs (SA)
- Admin Action Log
- User Ban / Suspend Log
- API Request Log
- Error Log
- Queue Monitor (Horizon)
- System Event Log

## 🔌 API Integration

### Configuration

Update the API base URL in `src/lib/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
```

### Authentication

```typescript
import { api } from '@/lib/api';

// Login
const response = await api.auth.login(email, password);
if (response.success) {
  api.setToken(response.data.token);
  // Redirect to dashboard
}

// Logout
await api.auth.logout();
api.clearToken();
```

### Data Fetching

```typescript
// Users
const users = await api.users.list();
const user = await api.users.get(id);

// Reports
const reports = await api.reports.list();
await api.reports.resolve(id, action);

// Analytics
const stats = await api.analytics.overview();

// And more...
```

## 🎨 Styling

### Tailwind CSS 4
- Utility-first CSS framework
- Dark mode support
- Custom color palette
- Responsive design

### Custom Fonts
- **Outfit** - Headings and body text
- **JetBrains Mono** - Code and monospace

### Color Palette
```css
Primary: #38bdf8 (Blue)
Success: #34d399 (Green)
Warning: #facc15 (Yellow)
Danger: #f87171 (Red)
Purple: #a78bfa
Pink: #f472b6
Orange: #fb923c
```

## 🧩 Components

### Reusable Components

```typescript
// Page Template
<PageTemplate
  title="Page Title"
  description="Page description"
  actions={<button>Action</button>}
>
  {/* Content */}
</PageTemplate>

// Stat Card
<StatCard
  title="Total Users"
  value="12,500"
  change="+12.5%"
  icon={Users}
  color="bg-blue-500"
/>

// Empty State
<EmptyState
  icon={Users}
  title="No users found"
  description="Try adjusting your filters"
/>

// Loading Spinner
<LoadingSpinner size="md" />
```

## 📝 Creating New Pages

1. **Create page file**:
```bash
dashboard/src/app/(dashboard)/admin/[section]/page.tsx
```

2. **Use template**:
```typescript
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';

export default function NewPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const response = await api.section.method();
    if (response.success) {
      setData(response.data);
    }
    setLoading(false);
  };

  return (
    <PageTemplate title="Page Title" description="Description">
      {loading ? <LoadingSpinner /> : (
        <div>{/* Content */}</div>
      )}
    </PageTemplate>
  );
}
```

3. **Menu item already configured** in `src/lib/menu-config.ts`

## 🔐 Role-Based Access

### Roles
- **SA** (Super Admin) - Full access to all features
- **A** (Admin) - Limited access to user management and moderation

### Implementation
Menu items are tagged with roles in `menu-config.ts`. Implement server-side checks in your API.

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
```env
NEXT_PUBLIC_API_URL=https://api.banitalk.com/api/v1
```

## 📦 Dependencies

```json
{
  "next": "16.1.6",
  "react": "19.2.3",
  "react-dom": "19.2.3",
  "tailwindcss": "^4",
  "framer-motion": "^12.34.3",
  "lucide-react": "^0.575.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.5.0",
  "typescript": "^5"
}
```

## 🎯 Next Steps

1. **Connect Real API**
   - Update API_BASE_URL
   - Test all endpoints
   - Handle authentication

2. **Implement Remaining Pages**
   - Follow established patterns
   - Use PageTemplate component
   - Connect to API

3. **Add Charts**
   - Install recharts or chart.js
   - Create chart components
   - Add to analytics pages

4. **Real-time Features**
   - WebSocket integration
   - Live updates
   - Push notifications

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)

## 🤝 Contributing

1. Follow existing code patterns
2. Use TypeScript for type safety
3. Maintain consistent styling
4. Test before committing

## 📄 License

Proprietary - BaniTalk Platform

---

**Status**: Core infrastructure complete with 11 example pages. Ready for full implementation.

**Total Pages**: 127 sub-items across 16 main menus
**Implemented**: 11 key pages demonstrating all patterns
**Remaining**: 116 pages following established patterns
