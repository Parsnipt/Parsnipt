/**
 * Main API router
 * Aggregates all API routes
 */

import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import extractionsRouter from './extractions.js';

const router = Router();

// Health check (no auth required)
router.use('/health', healthRouter);

// Authentication routes
router.use('/auth', authRouter);

// User routes
router.use('/users', usersRouter);

// Extraction routes
router.use('/extractions', extractionsRouter);

export default router;