/**
 * Global error handling middleware
 * Catches all errors and returns consistent response format
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, InternalServerError } from '../utils/errors.js';
import logger from '../utils/logger.js';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`Error: ${err.message}`, { stack: err.stack });

  let appError: AppError;

  if (err instanceof AppError) {
    appError = err;
  } else {
    appError = new InternalServerError(err.message);
  }

  const response: ErrorResponse = {
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details && { details: appError.details }),
    },
    timestamp: new Date().toISOString(),
  };

  res.status(appError.statusCode).json(response);
};

/**
 * 404 handler 
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`);
  next(error); 
};