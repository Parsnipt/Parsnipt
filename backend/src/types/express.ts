/**
 * Extended Express types for authentication
 */

import { AuthenticatedRequest } from './auth.js';

// Extend Express Request with auth properties
declare global {
  namespace Express {
    // Automatically pulls in userId and user from AuthenticatedRequest
    interface Request extends AuthenticatedRequest {}
  }
}

export {};