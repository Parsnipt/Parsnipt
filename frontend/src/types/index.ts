/**
 * Central export file for all TypeScript types
 */

// Auth types
export * from './auth';

// Extraction types
export * from './extraction';

// Utility types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}