export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:6001',
  appName: 'BaniTalk',
  appVersion: '1.0.0',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
