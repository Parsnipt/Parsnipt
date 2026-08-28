/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */

import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/authService.js';
import { AuthenticationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

/**
 * Middleware to verify JWT token
 * Should be applied to protected routes
 */
export const authMiddleware = async(
  req: Request,
  _res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = AuthService.verifyToken(token);

    // Attach user ID to request
    req.userId = decoded.userId;

    // Optionally fetch full user data
    try {
      const user = await AuthService.getUser(decoded.userId);      
      req.user = user;
    } catch (error) {
      logger.warn(`Could not fetch user data for ID: ${decoded.userId}`);
    }

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Invalid token'));
    }
  }
};

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.userId) {
    next(new AuthenticationError('Authentication required'));
  } else {
    next();
  }
};