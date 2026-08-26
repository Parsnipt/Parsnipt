/**
 * Authentication routes
 * POST /api/v1/auth/register
 * POST /api/v1/auth/login
 * POST /api/v1/auth/logout
 * POST /api/v1/auth/refresh
 */

import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/authController.js';
import { authMiddleware, requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * Strict rate limiter for authentication endpoints:
 * Max 10 attempts per 15 minutes window
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
    },
    timestamp: new Date().toISOString(),
  },
  skip: (_req) => process.env.NODE_ENV === 'test',
});

/**
 * Public routes (rate-limited against brute-force)
 */

// Register new user
router.post(
  '/register',
  authLimiter,
  (req: Request, res: Response, next: NextFunction) =>
    AuthController.register(req, res, next)
);

// Verify email
router.get('/verify/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const AuthServiceImpl = (await import('../services/authService.js')).default;
    
    await AuthServiceImpl.verifyEmail(token);
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post(
  '/login',
  authLimiter,
  (req: Request, res: Response, next: NextFunction) =>
    AuthController.login(req, res, next)
);

// Refresh access token
router.post(
  '/refresh',
  (req: Request, res: Response, next: NextFunction) =>
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