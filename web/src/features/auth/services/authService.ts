import { apiClient } from '@core/api/client';
import { AuthResponse, User } from '@types/api';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/login', { email, password });
  },

  async register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
    native_language?: string;
    learning_language?: string;
  }): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  async logout(): Promise<void> {
    return apiClient.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    return apiClient.get<User>('/users/me');
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('/auth/refresh');
  },
};
