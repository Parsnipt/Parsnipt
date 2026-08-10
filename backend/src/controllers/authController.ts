/**
 * Authentication controller
 * Handles HTTP requests for auth endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { RegisterRequest, LoginRequest } from '../types/auth.js';
import AuthService from '../services/authService.js';
import logger from '../utils/logger.js';

interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export class AuthController {
  /**
   * POST /api/v1/auth/register
   * Register new user
   */
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password, name } = req.body as RegisterRequest;

      const result = await AuthService.register({ email, password, name });

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

      const result = await AuthService.login({ email, password });

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
      // Future implementation: Invalidate token in Redis
      // Current implementation: Acknowledge logout
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
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Refresh token is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
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