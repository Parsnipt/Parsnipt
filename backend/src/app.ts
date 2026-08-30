/**
 * Express application setup
 * Configures middleware, routes, and error handling
 */

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/index.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const createApp = (): Express => {
  const app = express();

  // Security middleware
  app.use(helmet());
  const allowedOrigins = [
    'https://www.parsnipt.dev',
    'https://parsnipt.vercel.app',
    process.env.CORS_ORIGIN,
    'http://localhost:3000',
    'http://localhost:5173'
  ].filter(Boolean); // Removes undefined values

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  // Rate limiting (basic: 100 requests per 15 minutes)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    // Bypasses the rate limiter entirely when running automated tests
    skip: (_req) => process.env.NODE_ENV === 'test', 
  });
  app.use(limiter);

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Request logging
  app.use(requestLogger);

  // API routes
  app.use('/api/v1', apiRouter);

  // Health check at root (for load balancers)
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // 404 handler 
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;