/**
 * Multer configuration for file uploads
 */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { ValidationError } from '../utils/errors.js';

// Configure multer for in-memory storage
// Will be saved to disk in the service layer
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  try {
    // Validate file extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.js', '.jsx', '.ts', '.tsx'];

    if (!allowedExts.includes(ext)) {
      cb(
        new ValidationError(
          `Invalid file type. Allowed types: ${allowedExts.join(', ')}`
        )
      );
      return;
    }

    cb(null, true);
  } catch (error) {
    cb(error as Error);
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (validation per tier in service)
    files: 1, // Only 1 file per request
  },
});

export default upload;