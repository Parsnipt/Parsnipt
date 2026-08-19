/**
 * Authentication service
 * Handles all authentication API calls and token management
 */

import apiClient from './api.js';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiSuccessResponse,
} from '../types/auth.js';

export const authService = {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<AuthResponse>
      >('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        
        // Return user data
        return response.data.data;
      }

      throw new Error('Registration response was not successful');
    } catch (error) {
      // Extract error message from API response or use generic message
      if (error instanceof Error) {
        // Check if it's an axios error with response data
        const axiosError = error as any;
        if (axiosError.response?.data?.error?.message) {
          throw new Error(axiosError.response.data.error.message);
        }
        throw error;
      }
      throw new Error('Registration failed');
    }
  },

  /**
   * Login a user
   * POST /api/v1/auth/login
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<AuthResponse>
      >('/auth/login', {
        email: data.email,
        password: data.password,
      });

      if (response.data.success) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', response.data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', response.data.data.tokens.refreshToken);
        
        // Return user data
        return response.data.data;
      }

      throw new Error('Login response was not successful');
    } catch (error) {
      // Extract error message from API response
      if (error instanceof Error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.error?.message) {
          throw new Error(axiosError.response.data.error.message);
        }
        throw error;
      }
      throw new Error('Login failed');
    }
  },

  /**
   * Logout a user
   * POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.warn('Logout API call failed, but clearing local tokens anyway');
    } finally {
      // Always clear tokens locally, even if API call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Refresh access token using refresh token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<
        ApiSuccessResponse<{ accessToken: string; expiresIn: number }>
      >('/auth/refresh', {
        refreshToken,
      });

      if (response.data.success) {
        // Store new access token
        localStorage.setItem('accessToken', response.data.data.accessToken);
        return response.data.data.accessToken;
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  /**
   * Clear all stored auth data
   */
  clearAuth(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

export default authService;