'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from './api';
import type { AdminUser, AuthContextType } from './auth-types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);

  const isAuthenticated = !!user && !!api.getToken();

  // Session restoration on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = api.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await api.auth.me();
      if (response.success && response.data) {
        const userData = response.data as AdminUser;
        if (userData.role === 'admin' || userData.role === 'super_admin') {
          setUser(userData);
          scheduleTokenRefresh();
        } else {
          api.clearToken();
        }
      } else {
        api.clearToken();
      }
      setIsLoading(false);
    };

    restoreSession();

    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, []);

  const scheduleTokenRefresh = () => {
    if (refreshTimer) clearTimeout(refreshTimer);
    // Refresh token every 50 minutes (assuming 60 min expiry)
    const timer = setTimeout(() => {
      refreshToken();
    }, 50 * 60 * 1000);
    setRefreshTimer(timer);
  };

  const refreshToken = async () => {
    try {
      const response = await api.auth.refresh();
      if (response.success && response.data) {
        const { token } = response.data;
        if (token) {
          api.setToken(token);
          scheduleTokenRefresh();
        }
      } else {
        await logout();
      }
    } catch (error) {
      await logout();
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.auth.login(email, password);
    
    if (!response.success) {
      throw new Error(response.error || 'Login failed');
    }

    const { user: userData, token } = response.data;
    
    // Validate admin role
    if (userData.role !== 'admin' && userData.role !== 'super_admin') {
      throw new Error('Access denied. Admin privileges required.');
    }

    // Check account status
    if (userData.status === 'suspended') {
      throw new Error('Your account has been suspended.');
    }
    if (userData.status === 'banned') {
      throw new Error('Your account has been banned.');
    }

    api.setToken(token);
    setUser(userData);
    scheduleTokenRefresh();
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    if (refreshTimer) clearTimeout(refreshTimer);
    api.clearToken();
    setUser(null);
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
