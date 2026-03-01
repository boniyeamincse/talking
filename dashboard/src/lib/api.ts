// API Service Layer for BaniTalk Admin Dashboard

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  private async getCsrfCookie(): Promise<void> {
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    try {
      await fetch(`${baseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to fetch CSRF cookie:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 - Token expired
        if (response.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        // Handle 403 - Insufficient permissions
        if (response.status === 403) {
          this.clearToken();
        }
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  auth = {
    login: async (email: string, password: string) => {
      await this.getCsrfCookie();
      return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },
    logout: () => this.request('/auth/logout', { method: 'POST' }),
    refresh: () => this.request('/auth/refresh', { method: 'POST' }),
    me: () => this.request('/users/me'),
  };

  // User Management
  users = {
    list: (params?: any) => this.request('/admin/users', { method: 'GET' }),
    get: (id: number) => this.request(`/admin/users/${id}`),
    suspend: (id: number, reason: string) =>
      this.request(`/admin/users/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    restore: (id: number) =>
      this.request(`/admin/users/${id}/restore`, { method: 'POST' }),
    warn: (id: number, reason: string, details?: string) =>
      this.request(`/admin/users/${id}/warn`, {
        method: 'POST',
        body: JSON.stringify({ reason, details }),
      }),
    ban: (id: number, reason: string) =>
      this.request(`/admin/users/${id}/ban`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  };

  // Reports & Moderation
  reports = {
    list: (params?: any) => this.request('/admin/reports'),
    get: (id: number) => this.request(`/admin/reports/${id}`),
    resolve: (id: number, action: string, notes?: string) =>
      this.request(`/admin/reports/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ action, notes }),
      }),
    dismiss: (id: number, reason?: string) =>
      this.request(`/admin/reports/${id}/dismiss`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  };

  // Analytics
  analytics = {
    overview: () => this.request('/admin/analytics/overview'),
    users: (period?: string) =>
      this.request(`/admin/analytics/users?period=${period || 'week'}`),
    calls: (period?: string) =>
      this.request(`/admin/analytics/calls?period=${period || 'week'}`),
    revenue: (period?: string) =>
      this.request(`/admin/analytics/revenue?period=${period || 'month'}`),
  };

  // Admin Management (Super Admin only)
  admins = {
    list: () => this.request('/admin/admins'),
    create: (data: any) =>
      this.request('/admin/admins', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      this.request(`/admin/admins/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    remove: (id: number) =>
      this.request(`/admin/admins/${id}`, { method: 'DELETE' }),
  };

  // Sessions
  sessions = {
    active: () => this.request('/admin/sessions/active'),
    logout: (sessionId: string) =>
      this.request(`/admin/sessions/${sessionId}/logout`, { method: 'POST' }),
  };

  // Generic request methods
  get = (endpoint: string) => this.request(endpoint, { method: 'GET' });
  post = (endpoint: string, data: any) =>
    this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });

  // Platform Settings (Super Admin only)
  settings = {
    get: () => this.request('/admin/settings'),
    update: (data: any) =>
      this.request('/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };

  // Gifts & Economy
  gifts = {
    list: () => this.request('/admin/gifts'),
    create: (data: any) =>
      this.request('/admin/gifts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      this.request(`/admin/gifts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      this.request(`/admin/gifts/${id}`, { method: 'DELETE' }),
    transactions: (params?: any) => this.request('/admin/gifts/transactions'),
    leaderboard: () => this.request('/admin/gifts/leaderboard'),
  };

  // Voice Rooms
  rooms = {
    active: () => this.request('/admin/rooms/active'),
    history: (params?: any) => this.request('/admin/rooms/history'),
    close: (id: number) =>
      this.request(`/admin/rooms/${id}/close`, { method: 'POST' }),
  };

  // Calls
  calls = {
    active: () => this.request('/admin/calls/active'),
    history: (params?: any) => this.request('/admin/calls/history'),
  };

  // Chat & Messaging
  chat = {
    conversations: (params?: any) => this.request('/admin/chat/conversations'),
    flagged: () => this.request('/admin/chat/flagged'),
  };

  // Notifications
  notifications = {
    broadcast: (data: any) =>
      this.request('/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logs: (params?: any) => this.request('/admin/notifications/logs'),
  };

  // Translation
  translation = {
    languages: () => this.request('/admin/languages'),
    usage: (params?: any) => this.request('/admin/translation/usage'),
  };

  // Matching
  matching = {
    overview: () => this.request('/admin/matching/overview'),
    history: (params?: any) => this.request('/admin/matching/history'),
  };

  // Security
  security = {
    bannedIPs: () => this.request('/admin/security/banned-ips'),
    banIP: (data: any) =>
      this.request('/admin/security/banned-ips', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    unbanIP: (id: number) =>
      this.request(`/admin/security/banned-ips/${id}/unban`, { method: 'POST' }),
    twoFactorStats: () => this.request('/admin/security/2fa/stats'),
    twoFactorAdmins: () => this.request('/admin/security/2fa/admins'),
    toggleEnforcement: (enabled: boolean) =>
      this.request('/admin/security/2fa/enforcement', {
        method: 'POST',
        body: JSON.stringify({ enabled }),
      }),
    reset2FA: (adminId: number) =>
      this.request(`/admin/security/2fa/${adminId}/reset`, { method: 'POST' }),
    securityEvents: (params?: any) => this.request('/admin/security/events'),
  };

  // Audit Logs
  audit = {
    actions: (filter?: string) =>
      this.request(`/admin/audit/actions${filter ? `?filter=${filter}` : ''}`),
    moderation: (params?: any) => this.request('/admin/audit/moderation'),
    apiRequests: (params?: any) => this.request('/admin/audit/api'),
    errors: (params?: any) => this.request('/admin/audit/errors'),
    system: (params?: any) => this.request('/admin/audit/system'),
  };

  // Advanced Analytics
  advancedAnalytics = {
    retention: (period?: string) =>
      this.request(`/admin/analytics/retention?period=${period || 'month'}`),
    churn: (period?: string) =>
      this.request(`/admin/analytics/churn?period=${period || 'month'}`),
    countries: () => this.request('/admin/analytics/countries'),
    languageHeatmap: () => this.request('/admin/analytics/language-heatmap'),
    cultureMap: () => this.request('/admin/analytics/culture-map'),
    trending: (period?: string) =>
      this.request(`/admin/analytics/trending?period=${period || 'day'}`),
    feedEngagement: (period?: string) =>
      this.request(`/admin/analytics/feed-engagement?period=${period || 'week'}`),
    apiPerformance: () => this.request('/admin/analytics/api-performance'),
    errorRates: (period?: string) =>
      this.request(`/admin/analytics/error-rates?period=${period || 'day'}`),
    queuePerformance: () => this.request('/admin/analytics/queue-performance'),
  };

  // Content Moderation
  moderation = {
    posts: (params?: any) => this.request('/admin/moderation/posts'),
    comments: (params?: any) => this.request('/admin/moderation/comments'),
    messages: (params?: any) => this.request('/admin/moderation/messages'),
    spam: (params?: any) => this.request('/admin/moderation/spam'),
    harassment: (params?: any) => this.request('/admin/moderation/harassment'),
    history: (params?: any) => this.request('/admin/moderation/history'),
    aiFlags: (params?: any) => this.request('/admin/moderation/ai-flags'),
    takeAction: (id: number, action: string, reason?: string) =>
      this.request(`/admin/moderation/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      }),
  };

  // Social Feed
  feed = {
    posts: (params?: any) => this.request('/admin/feed/posts'),
    trending: (params?: any) => this.request('/admin/feed/trending'),
    country: (countryCode: string) =>
      this.request(`/admin/feed/country/${countryCode}`),
    reported: (params?: any) => this.request('/admin/feed/reported'),
    removed: (params?: any) => this.request('/admin/feed/removed'),
    hashtags: (params?: any) => this.request('/admin/feed/hashtags'),
    algorithmConfig: () => this.request('/admin/feed/algorithm-config'),
    updateAlgorithm: (data: any) =>
      this.request('/admin/feed/algorithm-config', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    analytics: (period?: string) =>
      this.request(`/admin/feed/analytics?period=${period || 'week'}`),
  };

  // Economy & Coins
  economy = {
    coinPurchases: (params?: any) => this.request('/admin/economy/coin-purchases'),
    coinBalances: (params?: any) => this.request('/admin/economy/coin-balances'),
    revenue: (period?: string) =>
      this.request(`/admin/economy/revenue?period=${period || 'month'}`),
    ledger: (params?: any) => this.request('/admin/economy/ledger'),
    balanceRatio: () => this.request('/admin/economy/balance-ratio'),
    paymentLogs: (params?: any) => this.request('/admin/economy/payment-logs'),
    refunds: (params?: any) => this.request('/admin/economy/refunds'),
    processRefund: (id: number, reason: string) =>
      this.request(`/admin/economy/refunds/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  };
}

export const api = new ApiService();
