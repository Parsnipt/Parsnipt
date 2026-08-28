/**
 * User controller
 * Handles user profile operations
 */

import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/authService.js';
import { AuthenticationError } from '../utils/errors.js';

interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export class UserController {
  /**
   * GET /api/v1/users/me
   * Get current user profile
   */
  static async getProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new AuthenticationError('User ID not found in request');
      }

      const user = await AuthService.getUser(req.userId);

      const response: SuccessResponse<typeof user> = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/me
   * Update user profile
   */
  static async updateProfile(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new AuthenticationError('User ID not found in request');
      }

      const { name, email } = req.body;
      const user = await AuthService.updateUser(req.userId, { name, email });

      const response: SuccessResponse<typeof user> = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/users/me/password
   * Change user password
   */
  static async changePassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new AuthenticationError('User ID not found in request');
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Current password and new password are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      await AuthService.changePassword(req.userId, currentPassword, newPassword);

      const response: SuccessResponse<{ message: string }> = {
        success: true,
        data: { message: 'Password updated successfully' },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;