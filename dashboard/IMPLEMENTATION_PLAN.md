# Implementation Plan - Auth & Security Module

## Phase 1: Admin Accounts Page (Priority: HIGH)

### Step 1.1: Create Admin List Page
**File:** `src/app/(dashboard)/admin/admins/page.tsx`

**Features:**
- DataTable with admin list
- Columns: Name, Email, Role, Status, Last Login, Actions
- Search by name/email
- Filter by role (Admin/Super Admin)
- Create Admin button
- Edit/Suspend/Delete actions

**Components Used:**
- DataTable
- Badge
- Button
- Input (search)
- EmptyState
- Skeleton

**API Endpoint:** `GET /api/v1/admin/admins`

---

### Step 1.2: Create Admin Modal
**File:** `src/app/(dashboard)/admin/admins/create/page.tsx` OR Modal in admins/page.tsx

**Features:**
- Form with validation
- Fields: Name, Email, Password, Role
- Password strength indicator
- Role selection (Admin/Super Admin)
- Success/Error toast

**Components Used:**
- Modal
- Input
- Button
- Toast

**API Endpoint:** `POST /api/v1/admin/admins`

---

### Step 1.3: Edit Admin Modal
**Features:**
- Pre-filled form
- Update name, email, role
- Change password option
- Suspend/Activate toggle

**API Endpoint:** `PUT /api/v1/admin/admins/{id}`

---

## Phase 2: Active Sessions Page (Priority: HIGH)

### Step 2.1: Create Sessions Page
**File:** `src/app/(dashboard)/admin/sessions/page.tsx`

**Features:**
- Real-time session list
- Columns: User, Device, IP, Location, Started, Last Activity
- Force logout button
- Auto-refresh every 30s
- Filter by user role

**Components Used:**
- DataTable
- Badge
- Button
- StatCard (session count)

**API Endpoint:** `GET /api/v1/admin/sessions/active`

---

## Phase 3: Login Audit Log (Priority: MEDIUM)

### Step 3.1: Create Audit Log Page
**File:** `src/app/(dashboard)/admin/audit/login/page.tsx`

**Features:**
- Filterable log table
- Columns: Timestamp, User, IP, Device, Status, Location
- Date range filter
- Search by user/IP
- Export to CSV
- Status filter (Success/Failed)

**Components Used:**
- DataTable
- Input (search)
- Button (export)
- Badge (status)

**API Endpoint:** `GET /api/v1/admin/audit/login`

---

## Phase 4: Security Events Dashboard (Priority: MEDIUM)

### Step 4.1: Create Security Events Page
**File:** `src/app/(dashboard)/admin/audit/security/page.tsx`

**Features:**
- Stat cards (Failed logins, Blocked IPs, Alerts)
- Event timeline
- Severity indicators (Critical/High/Medium/Low)
- Real-time updates
- Filter by event type

**Components Used:**
- StatCard
- DataTable
- Badge
- Card

**API Endpoint:** `GET /api/v1/admin/security/events`

---

## Phase 5: Banned IP Addresses (Priority: MEDIUM)

### Step 5.1: Create Banned IPs Page
**File:** `src/app/(dashboard)/admin/security/ips/page.tsx`

**Features:**
- List of banned IPs
- Add IP manually
- Columns: IP, Reason, Type, Banned At, Expires
- Unban action
- Temporary vs Permanent bans

**Components Used:**
- DataTable
- Modal (add IP)
- Button
- Badge
- Input

**API Endpoint:** 
- `GET /api/v1/admin/security/banned-ips`
- `POST /api/v1/admin/security/banned-ips`
- `DELETE /api/v1/admin/security/banned-ips/{id}`

---

## Phase 6: Role & Permissions (Priority: LOW)

### Step 6.1: Create Roles Page
**File:** `src/app/(dashboard)/admin/roles/page.tsx`

**Features:**
- Role list (Admin, Super Admin)
- Permission matrix
- Edit permissions
- Create custom roles (future)

**Components Used:**
- Card
- Checkbox
- Button

**API Endpoint:** `GET /api/v1/admin/roles`

---

## Implementation Order

### Week 1 (High Priority)
```
Day 1-2: Admin Accounts Page
  ✓ Create list page with DataTable
  ✓ Add search and filters
  ✓ Implement Create Admin modal
  ✓ Add edit/delete actions

Day 3-4: Active Sessions Page
  ✓ Create sessions list
  ✓ Add force logout
  ✓ Implement auto-refresh
  ✓ Add session statistics
```

### Week 2 (Medium Priority)
```
Day 1-2: Login Audit Log
  ✓ Create audit log page
  ✓ Add filters and search
  ✓ Implement export CSV
  ✓ Add date range picker

Day 3-4: Security Events Dashboard
  ✓ Create events page
  ✓ Add stat cards
  ✓ Implement event timeline
  ✓ Add severity filters
```

### Week 3 (Medium Priority)
```
Day 1-2: Banned IP Addresses
  ✓ Create banned IPs page
  ✓ Add IP ban modal
  ✓ Implement unban action
  ✓ Add temporary ban expiry

Day 3: Role & Permissions
  ✓ Create roles page
  ✓ Add permission matrix
```

---

## Backend Requirements

### New API Endpoints Needed

```php
// Admin Management
GET    /api/v1/admin/admins
POST   /api/v1/admin/admins
PUT    /api/v1/admin/admins/{id}
DELETE /api/v1/admin/admins/{id}

// Sessions
GET    /api/v1/admin/sessions/active
POST   /api/v1/admin/sessions/{id}/logout

// Audit Logs
GET    /api/v1/admin/audit/login
GET    /api/v1/admin/audit/login/export

// Security Events
GET    /api/v1/admin/security/events
GET    /api/v1/admin/security/stats

// Banned IPs
GET    /api/v1/admin/security/banned-ips
POST   /api/v1/admin/security/banned-ips
DELETE /api/v1/admin/security/banned-ips/{id}

// Roles
GET    /api/v1/admin/roles
PUT    /api/v1/admin/roles/{id}
```

### Database Tables Needed

```sql
-- admins (already exists in users table with role)

-- sessions
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id BIGINT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  last_activity INT,
  device VARCHAR(255),
  location VARCHAR(255)
);

-- login_logs
CREATE TABLE login_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  email VARCHAR(255),
  ip_address VARCHAR(45),
  device VARCHAR(255),
  location VARCHAR(255),
  status ENUM('success', 'failed'),
  created_at TIMESTAMP
);

-- security_events
CREATE TABLE security_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  type VARCHAR(50),
  severity ENUM('critical', 'high', 'medium', 'low'),
  description TEXT,
  ip_address VARCHAR(45),
  user_id BIGINT NULL,
  created_at TIMESTAMP
);

-- banned_ips
CREATE TABLE banned_ips (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ip_address VARCHAR(45) UNIQUE,
  reason TEXT,
  type ENUM('temporary', 'permanent'),
  banned_by BIGINT,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP
);
```

---

## File Structure

```
dashboard/src/app/(dashboard)/admin/
├── admins/
│   ├── page.tsx              # Admin list + Create modal
│   └── [id]/
│       └── page.tsx          # Edit admin (optional)
├── sessions/
│   └── page.tsx              # Active sessions
├── audit/
│   ├── login/
│   │   └── page.tsx          # Login audit log
│   └── security/
│       └── page.tsx          # Security events
├── security/
│   └── ips/
│       └── page.tsx          # Banned IPs
└── roles/
    └── page.tsx              # Roles & permissions
```

---

## Component Reusability

### Shared Components (Already Built)
- ✅ DataTable
- ✅ Modal
- ✅ Toast
- ✅ Button
- ✅ Input
- ✅ Badge
- ✅ Card
- ✅ Skeleton
- ✅ EmptyState
- ✅ StatCard

### New Components Needed
- [ ] DateRangePicker (for audit log)
- [ ] Select (for filters)
- [ ] Checkbox (for permissions)
- [ ] PasswordStrength (for create admin)

---

## Testing Checklist

### Admin Accounts
- [ ] List all admins
- [ ] Search by name/email
- [ ] Filter by role
- [ ] Create new admin
- [ ] Edit admin details
- [ ] Suspend admin
- [ ] Delete admin
- [ ] Validate form inputs
- [ ] Show success/error toasts

### Active Sessions
- [ ] List active sessions
- [ ] Auto-refresh every 30s
- [ ] Force logout session
- [ ] Show session count
- [ ] Filter by user

### Login Audit Log
- [ ] List all login attempts
- [ ] Search by user/IP
- [ ] Filter by status
- [ ] Filter by date range
- [ ] Export to CSV
- [ ] Pagination

### Security Events
- [ ] Show event statistics
- [ ] List recent events
- [ ] Filter by severity
- [ ] Filter by type
- [ ] Real-time updates

### Banned IPs
- [ ] List banned IPs
- [ ] Add IP manually
- [ ] Unban IP
- [ ] Set temporary ban
- [ ] Set permanent ban
- [ ] Show expiry date

---

## Next Steps

1. **Start with Phase 1** - Admin Accounts Page
2. **Create backend endpoints** for admin management
3. **Test with real data** from database
4. **Move to Phase 2** - Active Sessions
5. **Continue sequentially** through phases

Ready to start coding? Let me know which phase to begin with!
