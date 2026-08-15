import apiClient from './api';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Registration failed');
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
      localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Login failed');
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token');

    const response = await apiClient.post('/auth/refresh', { refreshToken });
    if (response.data.success) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data.data.accessToken;
    }
    throw new Error('Token refresh failed');
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};