# Quick Reference Card

## 🚀 Getting Started

```bash
cd dashboard
npm install
npm run dev
# Open http://localhost:3000
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | API service layer - all endpoints |
| `src/lib/types.ts` | TypeScript type definitions |
| `src/lib/menu-config.ts` | Complete menu structure (16 menus, 127 items) |
| `src/components/PageTemplate.tsx` | Reusable page layout |
| `src/components/dashboard/Sidebar.tsx` | Navigation sidebar |

## 🎨 Reusable Components

```typescript
// Page Template
import PageTemplate from '@/components/PageTemplate';
<PageTemplate title="Title" description="Desc" actions={<button>Action</button>}>
  {children}
</PageTemplate>

// Stat Card
import StatCard from '@/components/ui/StatCard';
<StatCard title="Users" value="1,234" change="+12%" icon={Users} color="bg-blue-500" />

// Loading Spinner
import LoadingSpinner from '@/components/ui/LoadingSpinner';
<LoadingSpinner size="md" />

// Empty State
import EmptyState from '@/components/ui/EmptyState';
<EmptyState icon={Users} title="No data" description="Try again" />
```

## 🔌 API Usage

```typescript
import { api } from '@/lib/api';

// Authentication
await api.auth.login(email, password);
api.setToken(token);
await api.auth.logout();
api.clearToken();

// Users
await api.users.list();
await api.users.get(id);
await api.users.suspend(id, reason);
await api.users.restore(id);
await api.users.warn(id, reason);
await api.users.ban(id, reason);

// Reports
await api.reports.list();
await api.reports.resolve(id, action);
await api.reports.dismiss(id, reason);

// Analytics
await api.analytics.overview();
await api.analytics.users(period);

// More endpoints available in api.ts
```

## 📝 Page Template

```typescript
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function MyPage() {
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
        <div>{/* Your content */}</div>
      )}
    </PageTemplate>
  );
}
```

## 🎨 Tailwind Classes

```css
/* Containers */
bg-white dark:bg-gray-800
rounded-lg shadow-sm border border-gray-200 dark:border-gray-700

/* Text */
text-gray-900 dark:text-white
text-gray-600 dark:text-gray-400

/* Buttons */
px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700

/* Grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

/* Table */
overflow-x-auto
px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase
```

## 📊 Status Badges

```typescript
// User Status
const getStatusBadge = (status: string) => {
  const styles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    banned: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  return styles[status] || styles.active;
};

// User Role
const getRoleBadge = (role: string) => {
  const styles = {
    user: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return styles[role] || styles.user;
};
```

## 🎯 Common Patterns

### List Page with Search
```typescript
const [searchTerm, setSearchTerm] = useState('');
const filteredItems = items.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
);
```

### Real-time Updates
```typescript
useEffect(() => {
  loadData();
  const interval = setInterval(loadData, 5000);
  return () => clearInterval(interval);
}, []);
```

### Form Handling
```typescript
const [formData, setFormData] = useState({});
const handleChange = (key: string, value: any) => {
  setFormData({ ...formData, [key]: value });
};
const handleSubmit = async () => {
  const response = await api.section.create(formData);
  if (response.success) {
    alert('Success');
  }
};
```

## 🔐 Role-Based Access

```typescript
// In menu-config.ts
role: "SA" // Super Admin only
role: "A"  // Admin + Super Admin
```

## 📱 Responsive Design

```typescript
// Grid
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Flex
flex-col sm:flex-row

// Hide/Show
hidden md:block
```

## 🎨 Color Palette

```typescript
Primary:  #38bdf8 (Blue)
Success:  #34d399 (Green)
Warning:  #facc15 (Yellow)
Danger:   #f87171 (Red)
Purple:   #a78bfa
Pink:     #f472b6
Orange:   #fb923c
```

## 📚 Documentation

- `README.md` - Main documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details
- `QUICK_GENERATION_GUIDE.md` - Page templates
- `PROJECT_STATUS.md` - Current progress
- `DASHBOARD_COMPLETE_SUMMARY.md` - Complete overview

## 🚀 Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Lint code
```

## 📊 Progress

- Infrastructure: 100% ✅
- Example Pages: 11/127 (9%)
- Remaining: 116 pages

## 🎯 Priority Pages

1. User Management (14 pages)
2. Content Moderation (11 pages)
3. Analytics (13 pages)
4. Admin Management (8 pages)
5. Settings (12 pages)

---

**Quick Tip**: Copy an existing page as a starting point, then customize the API calls and content!
