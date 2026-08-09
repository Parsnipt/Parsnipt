/**
 * Main API router
 * Aggregates all API routes
 */

import { Router } from 'express';
import healthRouter from './health.js'; 

const router = Router();

// Health check (no auth required)
router.use('/health', healthRouter);

// TODO: Expected future routes here (e.g., Auth, Extractions): 
// router.use('/auth', authRouter);
// router.use('/extractions', extractionsRouter);

export default router;