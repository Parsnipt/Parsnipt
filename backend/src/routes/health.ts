/**
 * Health check route
 * Returns API health status (no authentication required)
 */

import { Router, Request, Response } from 'express';

const router = Router();

interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  uptime: number;
}

router.get('/', (_req: Request, res: Response) => {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    uptime: process.uptime(),
  };

  res.json(response);
});

export default router;