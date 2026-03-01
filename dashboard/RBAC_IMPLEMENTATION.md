# Role-Based Access Control (RBAC) Implementation

## Backend (Laravel)

### Middleware
✅ **IsAdmin** - Allows `admin` and `super_admin`
✅ **IsSuperAdmin** - Allows only `super_admin`

### API Routes
```php
// Admin routes (admin + super_admin)
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'is.admin'])->group(function () {
    Route::get('users', [AdminController::class, 'listUsers']);
    Route::get('reports', [AdminController::class, 'listReports']);
    Route::post('users/{id}/suspend', [AdminController::class, 'suspendUser']);
    Route::post('users/{id}/restore', [AdminController::class, 'restoreUser']);
});

// Super Admin only routes
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'is.super_admin'])->group(function () {
    Route::post('users/{id}/ban', [AdminController::class, 'banUser']);
    Route::get('admins', [AdminController::class, 'listAdmins']);
    Route::post('admins', [AdminController::class, 'createAdmin']);
    Route::get('settings', [AdminController::class, 'getSettings']);
});
```

## Frontend (Next.js)

### Components
✅ **RoleGuard** - Client-side route protection
✅ **Unauthorized Page** - Access denied page

### Usage

#### Protect Entire Layout
```tsx
// app/(dashboard)/layout.tsx
<RoleGuard allowedRoles={['admin', 'super_admin']}>
  <DashboardLayout />
</RoleGuard>
```

#### Protect Specific Page
```tsx
// app/admin/settings/page.tsx
export default function SettingsPage() {
  return (
    <RoleGuard allowedRoles={['super_admin']}>
      <div>Super Admin Settings</div>
    </RoleGuard>
  );
}
```

#### Conditional Rendering
```tsx
import { useAuth } from '@/lib/auth-context';

export default function MyComponent() {
  const { user } = useAuth();

  return (
    <div>
      {user?.role === 'super_admin' && (
        <Button>Super Admin Only Action</Button>
      )}
      
      {['admin', 'super_admin'].includes(user?.role) && (
        <Button>Admin Action</Button>
      )}
    </div>
  );
}
```

## Route Structure

### Public Routes
- `/login` - Login page (all users)

### Protected Routes (Admin + Super Admin)
- `/admin` - Dashboard overview
- `/admin/users` - User management
- `/admin/reports` - Content moderation
- `/admin/analytics` - Analytics dashboard
- `/admin/calls` - Call monitoring
- `/admin/rooms` - Voice room monitoring
- `/admin/gifts` - Gift management

### Super Admin Only Routes
- `/admin/admins` - Admin management
- `/admin/settings` - Platform settings
- `/admin/security/banned-ips` - IP ban management

## User Roles

### User (role: 'user')
- Access: Mobile app only
- Cannot access dashboard

### Admin (role: 'admin')
- Access: Dashboard (limited)
- Can: View users, suspend users, moderate content, view analytics
- Cannot: Ban users, manage admins, change settings

### Super Admin (role: 'super_admin')
- Access: Full dashboard access
- Can: Everything admin can do + ban users, manage admins, change settings

## Testing

### Test Credentials
```
Super Admin:
Email: admin@banitalk.com
Password: password123

Admin:
Email: moderator@banitalk.com
Password: password123

User:
Email: user@banitalk.com
Password: password123
```

### Test Scenarios

1. **Login as User**
   - Should redirect to `/unauthorized` when accessing `/admin`

2. **Login as Admin**
   - Can access `/admin/users`
   - Cannot access `/admin/admins` (403 error)

3. **Login as Super Admin**
   - Can access all routes

## API Response Examples

### Success (200)
```json
{
  "success": true,
  "data": { ... }
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Super Admin privileges required."
}
```

## Implementation Checklist

✅ Backend middleware (IsAdmin, IsSuperAdmin)
✅ Frontend RoleGuard component
✅ Unauthorized page
✅ Dashboard layout protection
✅ Auth context with role validation
✅ API service with token management

## Next Steps

1. Add role badges in UI
2. Hide/show menu items based on role
3. Add audit logging for admin actions
4. Implement session management
5. Add IP-based access control
