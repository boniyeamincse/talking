# Quick Page Generation Guide

This guide helps you rapidly create all remaining dashboard pages using established patterns.

## 📋 Page Templates by Type

### Template 1: List/Table Page

```typescript
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { IconName } from 'lucide-react';

export default function ListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const response = await api.section.list();
    if (response.success && response.data) {
      setItems(response.data);
    }
    setLoading(false);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageTemplate
      title="Page Title"
      description="Page description"
      actions={
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add New
        </button>
      }
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Column 1
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Column 2
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{item.value}</td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredItems.length === 0 && (
              <EmptyState
                icon={IconName}
                title="No items found"
                description="Try adjusting your search"
              />
            )}
          </div>
        </>
      )}
    </PageTemplate>
  );
}
```

### Template 2: Grid/Card Page

```typescript
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { IconName } from 'lucide-react';

export default function GridPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const response = await api.section.list();
    if (response.success && response.data) {
      setItems(response.data);
    }
    setLoading(false);
  };

  return (
    <PageTemplate title="Page Title" description="Page description">
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState icon={IconName} title="No items" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6"
            >
              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </PageTemplate>
  );
}
```

### Template 3: Analytics/Stats Page

```typescript
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Users, TrendingUp, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    const response = await api.analytics.section();
    if (response.success && response.data) {
      setStats(response.data);
    }
    setLoading(false);
  };

  return (
    <PageTemplate
      title="Analytics"
      description="View detailed analytics"
      actions={
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
      }
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Metric 1"
            value={stats?.metric1 || 0}
            change="+12.5%"
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Metric 2"
            value={stats?.metric2 || 0}
            change="+8.2%"
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatCard
            title="Metric 3"
            value={stats?.metric3 || 0}
            change="+15.3%"
            icon={DollarSign}
            color="bg-purple-500"
          />
        </div>
      )}
    </PageTemplate>
  );
}
```

### Template 4: Form/Settings Page

```typescript
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const response = await api.settings.get();
    if (response.success && response.data) {
      setSettings(response.data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const response = await api.settings.update(settings);
    if (response.success) {
      alert('Settings saved');
    }
    setSaving(false);
  };

  const handleChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <PageTemplate
      title="Settings"
      description="Configure settings"
      actions={
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      }
    >
      <div className="max-w-4xl space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Section Title</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Setting Name
              </label>
              <input
                type="text"
                value={settings.setting_name || ''}
                onChange={(e) => handleChange('setting_name', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>
  );
}
```

### Template 5: Real-time Monitoring Page

```typescript
'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import PageTemplate from '@/components/PageTemplate';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { Activity } from 'lucide-react';

export default function MonitoringPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadItems, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadItems = async () => {
    const response = await api.section.active();
    if (response.success && response.data) {
      setItems(response.data);
    }
    setLoading(false);
  };

  return (
    <PageTemplate
      title="Live Monitoring"
      description="Real-time activity monitoring"
    >
      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState icon={Activity} title="No active items" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-600">LIVE</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </PageTemplate>
  );
}
```

## 🚀 Batch Generation Script

Create a script to generate multiple pages at once:

```bash
#!/bin/bash

# Example: Generate all analytics pages
pages=(
  "users"
  "retention"
  "countries"
  "languages"
  "trending"
  "calls"
  "feed"
  "revenue"
  "api"
  "errors"
  "queues"
)

for page in "${pages[@]}"; do
  mkdir -p "src/app/(dashboard)/admin/analytics/$page"
  # Copy template and customize
  cp template.tsx "src/app/(dashboard)/admin/analytics/$page/page.tsx"
done
```

## 📝 Quick Checklist for Each Page

- [ ] Create file in correct directory
- [ ] Import necessary components
- [ ] Set up state management
- [ ] Implement data fetching
- [ ] Add loading state
- [ ] Add empty state
- [ ] Add error handling
- [ ] Style with Tailwind
- [ ] Test functionality
- [ ] Verify menu navigation

## 🎯 Priority Order

### Phase 1: Core Functionality (High Priority)
1. Admin Management (`/admin/admins/*`)
2. User Actions (`/admin/users/*`)
3. Report Actions (`/admin/reports/*`)
4. Live Monitoring (`/admin/calls/active`, `/admin/rooms/active`)

### Phase 2: Analytics & Insights (Medium Priority)
5. Analytics Pages (`/admin/analytics/*`)
6. Gift System (`/admin/gifts/*`)
7. Translation System (`/admin/translation/*`)

### Phase 3: Configuration (Lower Priority)
8. Settings Pages (`/admin/settings/*`)
9. Audit Logs (`/admin/audit/*`)
10. Speech Learning (`/admin/sl/*`)

## 💡 Tips

1. **Copy existing pages** as starting points
2. **Reuse components** (PageTemplate, StatCard, etc.)
3. **Follow naming conventions** (PascalCase for components)
4. **Use TypeScript** for type safety
5. **Test incrementally** as you build
6. **Keep it simple** - don't over-engineer
7. **Consistent styling** - follow existing patterns

## 🔗 Useful Links

- Existing pages: `dashboard/src/app/(dashboard)/admin/`
- Components: `dashboard/src/components/`
- API service: `dashboard/src/lib/api.ts`
- Types: `dashboard/src/lib/types.ts`

---

With these templates and patterns, you can rapidly generate all 127 pages while maintaining consistency and quality.
