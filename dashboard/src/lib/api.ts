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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
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
    login: (email: string, password: string) =>
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
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
}

export const api = new ApiService();
