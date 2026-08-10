/**
 * User routes
 * GET /api/v1/users/me
 * PUT /api/v1/users/me
 * POST /api/v1/users/me/password
 */

import { Router, Request, Response, NextFunction } from 'express';
import UserController from '../controllers/userController.js';
import { authMiddleware, requireAuth } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(authMiddleware, requireAuth);

// Get user profile
router.get('/me', (req: Request, res: Response, next: NextFunction) =>
  UserController.getProfile(req, res, next)
);

// Update user profile
router.put('/me', (req: Request, res: Response, next: NextFunction) =>
  UserController.updateProfile(req, res, next)
);

// Change password
router.post('/me/password', (req: Request, res: Response, next: NextFunction) =>
  UserController.changePassword(req, res, next)
);

export default router;