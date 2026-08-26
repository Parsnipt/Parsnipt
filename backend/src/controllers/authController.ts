/**
 * Authentication controller
 * Handles HTTP requests for auth endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { RegisterRequest, LoginRequest } from '../types/auth.js';
import AuthService from '../services/authService.js';
import { ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export class AuthController {
  /**
   * Password complexity validator:
   * - Minimum 8 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 number
   */
  private static validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new ValidationError('Password is required');
    }

    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }
  }

  /**
   * Basic email format validator
   */
  private static validateEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new ValidationError('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new ValidationError('Please provide a valid email address');
    }
  }

  /**
   * POST /api/v1/auth/register
   * Register new user with strict input validation
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, name } = req.body as RegisterRequest;

      // Validate Name
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        throw new ValidationError('Full name is required');
      }

      // Validate Email & Password Complexity
      this.validateEmail(email);
      this.validatePassword(password);

      const result = await AuthService.register({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
      });

      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   * Login user and return tokens
   */
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      this.validateEmail(email);

      const result = await AuthService.login({
        email: email.trim().toLowerCase(),
        password,
      });

      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Logout user (invalidate token)
   */
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      logger.info(`User logged out: ${req.userId}`);

      const response: SuccessResponse<{ message: string }> = {
        success: true,
        data: { message: 'Successfully logged out' },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  static async refreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }

      const result = AuthService.refreshAccessToken(refreshToken);

      const response: SuccessResponse<typeof result> = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;