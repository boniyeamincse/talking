# SuperAdmin Dashboard - Quick Start Guide

**For Developers Starting on the Project**

---

## 🚀 Getting Started in 5 Minutes

### 1. Prerequisites Check
```bash
# Check Node.js version (need 18+)
node --version

# Check npm version
npm --version

# Check git
git --version
```

### 2. Clone & Setup
```bash
# Clone repository
git clone <repository-url>
cd banitalk/admin-dashboard

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 3. Configure Environment
Edit `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:6001
VITE_APP_NAME=BaniTalk Admin
```

### 4. Run Development Server
```bash
npm run dev
# Open http://localhost:5173
```

### 5. Test Login
```
Email: admin@talkin.app
Password: TalkinAdmin@2026!
```

---

## 📁 Project Structure

```
admin-dashboard/
├── src/
│   ├── pages/           # Page components
│   │   ├── Auth/        # Login, password reset
│   │   ├── Dashboard/   # Main dashboard
│   │   ├── Users/       # User management
│   │   ├── Admins/      # Admin management
│   │   ├── Reports/     # Content moderation
│   │   ├── Analytics/   # Analytics & insights
│   │   ├── Gifts/       # Gift management
│   │   └── Settings/    # Platform settings
│   │
│   ├── components/      # Reusable components
│   │   ├── common/      # Buttons, inputs, cards
│   │   ├── layout/      # Header, sidebar, footer
│   │   └── modules/     # Feature-specific components
│   │
│   ├── services/        # API services
│   │   ├── api.ts       # Axios instance
│   │   ├── auth.ts      # Auth service
│   │   ├── users.ts     # User service
│   │   └── analytics.ts # Analytics service
│   │
│   ├── store/           # State management
│   │   ├── slices/      # Redux slices
│   │   └── index.ts     # Store configuration
│   │
│   ├── types/           # TypeScript types
│   ├── utils/           # Helper functions
│   ├── hooks/           # Custom React hooks
│   └── App.tsx          # Main app component
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run format           # Format with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

---

## 🎨 UI Components (Material-UI)

### Common Components
```tsx
import { Button, TextField, Card, Table } from '@mui/material';

// Button
<Button variant="contained" color="primary">
  Click Me
</Button>

// Text Input
<TextField
  label="Email"
  variant="outlined"
  fullWidth
/>

// Card
<Card>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Layout Components
```tsx
import { Box, Grid, Container } from '@mui/material';

// Responsive Grid
<Grid container spacing={3}>
  <Grid item xs={12} md={6}>
    Content
  </Grid>
</Grid>
```

---

## 🔐 Authentication Flow

### Login Process
```tsx
import { useAuth } from '@/hooks/useAuth';

function LoginPage() {
  const { login, isLoading } = useAuth();

  const handleSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      // Redirect to dashboard
    } catch (error) {
      // Show error
    }
  };
}
```

### Protected Routes
```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## 📡 API Service Usage

### Basic API Call
```tsx
import { api } from '@/services/api';

// GET request
const users = await api.get('/admin/users');

// POST request
const newAdmin = await api.post('/admin/admins', {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
});

// PUT request
await api.put(`/admin/users/${id}`, data);

// DELETE request
await api.delete(`/admin/users/${id}`);
```

### Using Service Layer
```tsx
import { userService } from '@/services/users';

// List users with filters
const users = await userService.list({
  search: 'john',
  status: 'active',
  page: 1
});

// Get user detail
const user = await userService.getById(123);

// Ban user
await userService.ban(123, 'Spam violation');
```

---

## 🎯 Common Tasks

### Task 1: Add a New Page
```bash
# 1. Create page component
src/pages/NewFeature/index.tsx

# 2. Add route in App.tsx
<Route path="/new-feature" element={<NewFeature />} />

# 3. Add menu item in Sidebar
<MenuItem to="/new-feature">New Feature</MenuItem>
```

### Task 2: Create API Service
```typescript
// src/services/newService.ts
import { api } from './api';

export const newService = {
  list: async (params) => {
    const response = await api.get('/admin/items', { params });
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/admin/items', data);
    return response.data;
  }
};
```

### Task 3: Add State Management
```typescript
// src/store/slices/newSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const newSlice = createSlice({
  name: 'new',
  initialState: { items: [] },
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    }
  }
});

export const { setItems } = newSlice.actions;
export default newSlice.reducer;
```

---

## 📊 Working with Charts

### Using Recharts
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="users" stroke="#8884d8" />
</LineChart>
```

---

## 🧪 Testing

### Component Test Example
```tsx
import { render, screen } from '@testing-library/react';
import { LoginPage } from './LoginPage';

test('renders login form', () => {
  render(<LoginPage />);
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
});
```

### API Service Test
```typescript
import { userService } from '@/services/users';

jest.mock('@/services/api');

test('fetches users', async () => {
  const users = await userService.list();
  expect(users).toHaveLength(10);
});
```

---

## 🐛 Debugging Tips

### React DevTools
```bash
# Install browser extension
# Chrome: React Developer Tools
# Firefox: React Developer Tools
```

### Console Logging
```tsx
// Debug API responses
console.log('API Response:', response);

// Debug state
console.log('Current State:', state);

// Debug props
console.log('Props:', props);
```

### Network Debugging
```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by XHR/Fetch
4. Check API requests/responses
```

---

## 🔍 Code Style Guide

### Naming Conventions
```typescript
// Components: PascalCase
const UserList = () => {};

// Functions: camelCase
const fetchUsers = () => {};

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://...';

// Types/Interfaces: PascalCase
interface User {}
type UserRole = 'admin' | 'super_admin';
```

### File Naming
```
Components:     UserList.tsx
Services:       userService.ts
Types:          user.types.ts
Utils:          formatDate.ts
Hooks:          useAuth.ts
```

### Import Order
```typescript
// 1. React imports
import React, { useState } from 'react';

// 2. Third-party imports
import { Button } from '@mui/material';

// 3. Internal imports
import { api } from '@/services/api';
import { User } from '@/types';

// 4. Relative imports
import { UserCard } from './UserCard';
```

---

## 📚 Useful Resources

### Documentation
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Material-UI Docs](https://mui.com/material-ui/getting-started/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Recharts Docs](https://recharts.org/)

### Internal Docs
- [Development Plan](./superadmin-dashboard-plan.md)
- [Work Status](./superadmin-dashboard-status.md)
- [API Documentation](../../api/README.md)
- [Project Requirements](../project-requirements.md)

---

## 🆘 Getting Help

### Common Issues

**Issue: Port 5173 already in use**
```bash
# Kill process on port
npx kill-port 5173
# Or use different port
npm run dev -- --port 3000
```

**Issue: Module not found**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue: TypeScript errors**
```bash
# Check types
npm run type-check
# Restart TypeScript server in VSCode
Cmd/Ctrl + Shift + P > "TypeScript: Restart TS Server"
```

**Issue: API connection failed**
```bash
# Check backend is running
cd api && php artisan serve

# Check .env file has correct API_BASE_URL
```

---

## 🎓 Learning Path

### Week 1: Setup & Basics
- [ ] Setup development environment
- [ ] Understand project structure
- [ ] Learn Material-UI basics
- [ ] Complete Module 1: Authentication

### Week 2: Core Features
- [ ] Build user list page
- [ ] Implement search/filter
- [ ] Create detail views
- [ ] Add CRUD operations

### Week 3: Advanced Features
- [ ] Integrate charts
- [ ] Add real-time updates
- [ ] Implement state management
- [ ] Write tests

---

## ✅ Pre-commit Checklist

Before committing code:
- [ ] Code runs without errors
- [ ] No console errors in browser
- [ ] TypeScript types are correct
- [ ] ESLint passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Tests pass (`npm run test`)
- [ ] Commit message is descriptive

---

## 🚀 Deployment

### Build for Production
```bash
# Create production build
npm run build

# Test production build locally
npm run preview
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

---

## 📞 Team Contacts

| Role | Name | Contact |
|------|------|---------|
| Tech Lead | TBD | - |
| Frontend Lead | TBD | - |
| Backend Lead | TBD | - |

---

## 🎯 Your First Task

1. **Setup Environment**
   - Clone repo
   - Install dependencies
   - Run dev server

2. **Explore Codebase**
   - Read project structure
   - Check existing components
   - Review API services

3. **Pick a Task**
   - Check [Work Status](./superadmin-dashboard-status.md)
   - Choose unassigned task
   - Update status tracker

4. **Start Coding**
   - Create feature branch
   - Implement feature
   - Write tests
   - Submit PR

---

**Welcome to the team! 🎉**

*Last Updated: March 1, 2026*
