/**
 * Authentication-related TypeScript types
 */

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
  verificationToken?: string
}

export interface UserWithPassword extends User {
  passwordHash: string;
  isVerified?: boolean;
  verificationToken?: string
}

export interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest {
  userId?: string;
  user?: User;
}