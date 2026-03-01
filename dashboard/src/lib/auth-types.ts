// Authentication type definitions
export interface AdminUser {
  id: number;
  uuid: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'banned';
  email_verified_at: string | null;
  created_at: string;
}

export interface AuthToken {
  token: string;
  type: string;
  expires_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AdminUser;
  token: AuthToken;
}

export interface AuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}
