/**
 * Extraction controller
 * Handles HTTP requests for extraction endpoints
 */

import { Request, Response, NextFunction } from 'express';
import ExtractionService from '../services/extractionService.js';
import FileService from '../services/fileService.js';
import AuthService from '../services/authService.js';
import {
  AuthenticationError,
  ValidationError,
} from '../utils/errors.js';
import logger from '../utils/logger.js';

interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string;
}

export class ExtractionController {
  /**
   * POST /api/v1/extractions
   * Upload file and create extraction record
   */
  static async createExtraction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let tempFilePath: string | null = null;

    try {
      // Verify authentication
      if (!req.userId) {
        throw new AuthenticationError('User ID not found in request');
      }

      // Check if file was uploaded
      if (!req.file) {
        throw new ValidationError('No file uploaded');
      }

      // Get user tier for file size limit
      let userTier: 'free' | 'pro' | 'enterprise' = 'free';
      try {
        const user = await AuthService.getUser(req.userId);
        userTier = user.tier as 'free' | 'pro' | 'enterprise';
      } catch (error) {
        logger.warn(`Could not determine user tier for: ${req.userId}`);
      }

      // Validate file
      const fileSizeBytes = req.file.size;
      const fileName = req.file.originalname;

      const validation = FileService.validateFile(
        fileName,
        fileSizeBytes,
        userTier
      );

      if (!validation.isValid) {
        throw new ValidationError(validation.error || 'File validation failed');
      }

      // Check rate limit (10 extractions/day for free tier)
      const extractionCountToday = await ExtractionService.getUserExtractionCountToday(req.userId);
      const dailyLimit = userTier === 'free' ? 10 : 100;

      if (extractionCountToday >= dailyLimit) {
        throw new ValidationError(
          `Daily extraction limit (${dailyLimit}) reached for ${userTier} tier`
        );
      }

      // Create extraction record
      const extraction = await ExtractionService.createExtraction(
        req.userId,
        fileName,
        fileSizeBytes
      );

      // Save file temporarily
      tempFilePath = await FileService.saveFileTemporarily(
        req.file.buffer,
        fileName,
        extraction.id
      );

      logger.info(
        `File uploaded: ${extraction.id} - ${fileName} (${fileSizeBytes} bytes)`
      );

      // Update status to processing
      await ExtractionService.updateExtractionStatus(extraction.id, 'processing');

      // TODO: Queue for extraction engine (async job)
      // Ran as a background "fire-and-forget" process
      try {
        const CodeExtractionController = (await import('../controllers/codeExtractionController.js')).default;
        
        // Server responds immediately while parsing happens in the background.
        CodeExtractionController.processExtraction(extraction.id).catch(err => {
          logger.warn(`Background extraction failed: ${err}`);
        });
      } catch (error) {
        logger.warn(`Failed to trigger background extraction: ${error}`);
      }

      const response: SuccessResponse<typeof extraction> = {
        success: true,
        data: extraction,
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      // Clean up temp file on error
      if (tempFilePath) {
        try {
          await FileService.deleteTemporaryFile(tempFilePath);
        } catch (err) {
          logger.warn(`Failed to clean up temp file on error: ${err}`);
        }
      }

      next(error);
    }
  }
  /**
   * GET /api/v1/extractions
   * List all extractions for current user
   */
  static async listExtractions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new AuthenticationError('User ID not found in request');
      }

      const extractions = await ExtractionService.getUserExtractions(req.userId);

      const response: SuccessResponse<typeof extractions> = {
        success: true,
        data: extractions,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/extractions/:id
   * Get extraction details by ID
   */
  static async getExtraction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new AuthenticationError('User ID not found in request');
      }

      const { id } = req.params;

      const extraction = await ExtractionService.getExtraction(id);

      // Verify ownership
      if (extraction.userId !== req.userId) {
        throw new ValidationError('Cannot access extraction you do not own');
      }

      const response: SuccessResponse<typeof extraction> = {
        success: true,
        data: extraction,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/extractions/:id
   * Delete extraction by ID
   */
  static async deleteExtraction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new AuthenticationError('User ID not found in request');
      }

      const { id } = req.params;

      // Verify ownership and delete
      await ExtractionService.deleteExtraction(id, req.userId);

      const response: SuccessResponse<{ message: string }> = {
        success: true,
        data: { message: 'Extraction deleted successfully' },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/extractions/:id/export
   * Export extraction results
   */
  static async exportExtraction(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.userId) {
        throw new AuthenticationError('User ID not found in request');
      }

      const { id } = req.params;
      
      // Variable ready for Phase 2, currently commented out to avoid unused variable errors
      // const { format = 'json' } = req.body; 

      const extraction = await ExtractionService.getExtraction(id);

      // Verify ownership
      if (extraction.userId !== req.userId) {
        throw new ValidationError('Cannot access extraction you do not own');
      }

      if (!extraction.extractionResults) {
        throw new ValidationError('Extraction has no results yet');
      }

      // TODO: Phase 2 implements actual export logic
      // Phase 1, returns the data

      const response: SuccessResponse<typeof extraction> = {
        success: true,
        data: extraction,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default ExtractionController;