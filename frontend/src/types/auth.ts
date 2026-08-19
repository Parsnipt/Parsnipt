/**
 * Authentication-related TypeScript types for frontend
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}