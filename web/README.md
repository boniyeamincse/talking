# 🌐 BaniTalk Web App (React + Vite)

Enterprise-grade React web application for BaniTalk language learning platform.

## 🏗️ Architecture

```
web/
├── src/
│   ├── core/           # Core functionality (API, Auth, Store)
│   ├── features/       # Feature modules (Auth, Chat, Profile, etc.)
│   ├── shared/         # Shared components & utilities
│   ├── pages/          # Page components
│   ├── types/          # TypeScript types
│   └── styles/         # Global styles
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd web
npm install
```

### Development

```bash
npm run dev
```

App runs on: http://localhost:3000

### Build

```bash
npm run build
npm run preview
```

## 🔧 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **React Query** - Data fetching

## 🔐 Security Features

- ✅ HTTP-only cookies (recommended)
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ Secure token storage
- ✅ Request ID tracking
- ✅ API interceptors

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/core/api/client.ts` | API client with interceptors |
| `src/core/store/authStore.ts` | Authentication state |
| `src/core/config/env.ts` | Environment configuration |
| `src/types/api.ts` | TypeScript API types |

## 🌍 Environment Variables

Create `.env` file:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:6001
```

## 📦 Production Build

```bash
npm run build
```

Output: `dist/` folder

## 🧪 Testing

```bash
npm run test
```

## 📝 License

MIT License - BaniTalk Team
