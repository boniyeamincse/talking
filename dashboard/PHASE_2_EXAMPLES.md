# Phase 2: Core Components - Usage Examples

## ✅ All Components Complete

### 1. DataTable Component
**Features:** Generic typing, custom render functions, loading state, empty state

```tsx
import DataTable from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'banned';
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { 
    key: 'status', 
    label: 'Status',
    render: (user: User) => (
      <Badge variant={user.status === 'active' ? 'success' : 'error'}>
        {user.status}
      </Badge>
    )
  },
];

<DataTable
  data={users}
  columns={columns}
  loading={isLoading}
  emptyState={<EmptyState icon={Users} title="No users found" />}
/>
```

### 2. Modal Component
**Features:** Backdrop blur, ESC key close, body scroll lock, 3 sizes

```tsx
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const [isOpen, setIsOpen] = useState(false);

<Modal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)} 
  title="Edit User"
  size="md"
>
  <form className="space-y-4">
    <Input placeholder="Name" />
    <Input placeholder="Email" type="email" />
    <div className="flex gap-2 justify-end">
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button type="submit">Save</Button>
    </div>
  </form>
</Modal>
```

### 3. Toast Notifications
**Features:** 4 types, auto-dismiss (4s), stacked positioning, animations

```tsx
// 1. Wrap your app with ToastProvider (in layout.tsx)
import { ToastProvider } from '@/components/ui/Toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

// 2. Use in any component
import { useToast } from '@/components/ui/Toast';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('User created successfully', 'success');
  };

  const handleError = () => {
    showToast('Failed to save changes', 'error');
  };

  const handleWarning = () => {
    showToast('This action cannot be undone', 'warning');
  };

  const handleInfo = () => {
    showToast('New message received', 'info');
  };

  return <Button onClick={handleSuccess}>Show Toast</Button>;
}
```

### 4. Skeleton Loader (Already Complete)
```tsx
import Skeleton from '@/components/ui/Skeleton';

// Single skeleton
<Skeleton className="h-12 w-full" />

// Multiple skeletons
<Skeleton className="h-24 w-full" count={3} />
```

### 5. EmptyState (Already Complete)
```tsx
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

<EmptyState
  icon={Users}
  title="No users found"
  description="Try adjusting your search filters"
  action={{
    label: "Add User",
    onClick: () => setModalOpen(true)
  }}
/>
```

## 🎯 Real-World Example: User Management Page

```tsx
'use client';

import { useState } from 'react';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Users } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'status', 
      label: 'Status',
      render: (user) => <Badge variant={user.status === 'active' ? 'success' : 'error'}>{user.status}</Badge>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <Button size="sm" variant="ghost" onClick={() => handleEdit(user)}>
          Edit
        </Button>
      )
    }
  ];

  const handleEdit = (user) => {
    setModalOpen(true);
  };

  const handleSave = () => {
    showToast('User updated successfully', 'success');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Users</h1>
        <Button onClick={() => setModalOpen(true)}>Add User</Button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        loading={loading}
        emptyState={<EmptyState icon={Users} title="No users found" />}
      />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Edit User">
        <form onSubmit={handleSave} className="space-y-4">
          <Button type="submit">Save</Button>
        </form>
      </Modal>
    </div>
  );
}
```

## 📋 Phase 2 Checklist

✅ Build DataTable component  
✅ Create Modal system  
✅ Implement Toast notifications  
✅ Add Skeleton loaders  
✅ Build EmptyState component  

**Status: 5/5 Complete (100%)**
