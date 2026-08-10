/**
 * Authentication routes
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/logout
 * POST /api/v1/auth/refresh
 */

import { Router, Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/authController.js';
import { authMiddleware, requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// Register new user
router.post('/register', (req: Request, res: Response, next: NextFunction) =>
  AuthController.register(req, res, next)
);

// Login user
router.post('/login', (req: Request, res: Response, next: NextFunction) =>
  AuthController.login(req, res, next)
);

// Refresh access token
router.post('/refresh', (req: Request, res: Response, next: NextFunction) =>
  AuthController.refreshToken(req, res, next)
);

/**
 * Protected routes (authentication required)
 */

// Logout user
router.post(
  '/logout',
  authMiddleware,
  requireAuth,
  (req: Request, res: Response, next: NextFunction) =>
    AuthController.logout(req, res, next)
);

export default router;