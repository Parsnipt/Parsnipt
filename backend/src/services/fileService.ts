/**
 * File handling service
 * Handles file validation, storage, and cleanup
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import logger from '../utils/logger.js';
import { ValidationError } from '../utils/errors.js';

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  free: 50 * 1024, // 50KB
  pro: 10 * 1024 * 1024, // 10MB
  enterprise: 100 * 1024 * 1024, // 100MB
};

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Temporary upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'temp');

export class FileService {
  /**
   * Ensure upload directory exists
   */
  static async ensureUploadDir(): Promise<void> {
    try {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      logger.error(`Failed to create upload directory: ${error}`);
      throw new Error('Failed to create upload directory');
    }
  }

  /**
   * Validate file extension
   */
  private static validateExtension(fileName: string): boolean {
    const ext = path.extname(fileName).toLowerCase();
    return ALLOWED_EXTENSIONS.includes(ext);
  }

  /**
   * Validate uploaded file
   */
  static validateFile(
    fileName: string,
    fileSizeBytes: number,
    userTier: 'free' | 'pro' | 'enterprise' = 'free'
  ): { isValid: boolean; error?: string } {
    try {
      // Check file extension
      if (!this.validateExtension(fileName)) {
        return {
          isValid: false,
          error: `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
        };
      }

      // Check file size
      const sizeLimit = FILE_SIZE_LIMITS[userTier];
      if (fileSizeBytes > sizeLimit) {
        const limitMB = sizeLimit / (1024 * 1024);
        return {
          isValid: false,
          error: `File size exceeds limit of ${limitMB}MB for ${userTier} tier`,
        };
      }

      // Check minimum file size (at least 1 byte)
      if (fileSizeBytes === 0) {
        return {
          isValid: false,
          error: 'File is empty',
        };
      }

      return { isValid: true };
    } catch (error) {
      logger.error(`File validation error: ${error}`);
      return {
        isValid: false,
        error: 'File validation failed',
      };
    }
  }

  /**
   * Generate temporary file path
   */
  static generateTempFilePath(fileName: string, extractionId: string): string {
    const ext = path.extname(fileName);
    const tempFileName = `${extractionId}${ext}`;
    return path.join(UPLOAD_DIR, tempFileName);
  }

  /**
   * Save uploaded file to temporary location
   */
  static async saveFileTemporarily(
    fileBuffer: Buffer,
    fileName: string,
    extractionId: string
  ): Promise<string> {
    try {

      if (!this.validateExtension(fileName)) {
        throw new ValidationError('Invalid file type. Defense-in-depth validation failed.');
      }

      await this.ensureUploadDir();

      const filePath = this.generateTempFilePath(fileName, extractionId);

      // Write file to disk
      await promisify(fs.writeFile)(filePath, fileBuffer);

      logger.info(`File saved temporarily: ${filePath}`);
      return filePath;
    } catch (error) {
      logger.error(`Failed to save file: ${error}`);
      throw new ValidationError('Failed to save uploaded file');
    }
  }

  /**
   * Read file content
   */
  static async readFileContent(filePath: string): Promise<string> {
    try {
      const content = await promisify(fs.readFile)(filePath, 'utf-8');
      return content;
    } catch (error) {
      logger.error(`Failed to read file: ${error}`);
      throw new Error('Failed to read file content');
    }
  }

  /**
   * Delete temporary file
   */
  static async deleteTemporaryFile(filePath: string): Promise<void> {
    try {
      // Only delete if file exists and is in temp directory
      if (filePath.includes(UPLOAD_DIR)) {
        await unlink(filePath);
        logger.info(`Temporary file deleted: ${filePath}`);
      }
    } catch (error) {
      // Don't throw - just log warning
      logger.warn(`Failed to delete temporary file: ${filePath}`);
    }
  }

  /**
   * Clean up old temporary files (older than 24 hours)
   */
  static async cleanupOldFiles(maxAgeHours: number = 24): Promise<number> {
    try {
      let deletedCount = 0;
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
      const now = Date.now();

      const files = await promisify(fs.readdir)(UPLOAD_DIR);

      for (const file of files) {
        const filePath = path.join(UPLOAD_DIR, file);
        const stats = await promisify(fs.stat)(filePath);

        if (now - stats.mtime.getTime() > maxAgeMs) {
          await unlink(filePath);
          deletedCount++;
          logger.info(`Cleaned up old file: ${file}`);
        }
      }

      logger.info(`Cleanup complete: deleted ${deletedCount} files`);
      return deletedCount;
    } catch (error) {
      logger.warn(`Cleanup failed: ${error}`);
      return 0;
    }
  }

  /**
   * Get file statistics
   */
  static async getFileStats(filePath: string): Promise<fs.Stats> {
    try {
      return await promisify(fs.stat)(filePath);
    } catch (error) {
      throw new Error('Failed to get file statistics');
    }
  }
}

export default FileService;