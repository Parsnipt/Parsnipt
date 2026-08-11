/**
 * Extraction business logic
 * Handles extraction creation, retrieval, and management
 */

import { randomUUID } from 'crypto';
import {
  Extraction,
  ExtractionResults,
} from '../types/extraction.js';
import {
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';
import logger from '../utils/logger.js';

// In-memory extraction store (future replacement with database in Issue #5)
const extractions = new Map<string, Extraction>();

export class ExtractionService {
  /**
   * Create new extraction record
   */
  static async createExtraction(
    userId: string,
    fileName: string,
    fileSizeBytes: number
  ): Promise<Extraction> {
    try {
      const extractionId = randomUUID();

      const extraction: Extraction = {
        id: extractionId,
        userId,
        fileName,
        fileSizeBytes,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      extractions.set(extractionId, extraction);

      logger.info(`Extraction created: ${extractionId} for user: ${userId}`);

      return extraction;
    } catch (error) {
      logger.error(`Failed to create extraction: ${error}`);
      throw new Error('Failed to create extraction record');
    }
  }

  /**
   * Get extraction by ID
   */
  static getExtraction(extractionId: string): Extraction {
    const extraction = extractions.get(extractionId);
    if (!extraction) {
      throw new NotFoundError('Extraction');
    }
    return extraction;
  }

  /**
   * Get all extractions for a user
   */
  static getUserExtractions(userId: string): Extraction[] {
    return Array.from(extractions.values()).filter(
      (e) => e.userId === userId
    );
  }

  /**
   * Update extraction status
   */
  static updateExtractionStatus(
    extractionId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    error?: string
  ): Extraction {
    const extraction = this.getExtraction(extractionId);

    extraction.status = status;
    if (error) {
      extraction.error = error;
    }
    extraction.updatedAt = new Date().toISOString();

    extractions.set(extractionId, extraction);

    logger.info(
      `Extraction status updated: ${extractionId} -> ${status}`
    );

    return extraction;
  }

  /**
   * Set extraction results
   */
  static setExtractionResults(
    extractionId: string,
    results: ExtractionResults
  ): Extraction {
    const extraction = this.getExtraction(extractionId);

    extraction.extractionResults = results;
    extraction.status = 'completed';
    extraction.updatedAt = new Date().toISOString();

    extractions.set(extractionId, extraction);

    logger.info(
      `Extraction results set: ${extractionId} with ${results.summary.totalItems} items`
    );

    return extraction;
  }

  /**
   * Delete extraction
   */
  static deleteExtraction(extractionId: string, userId: string): void {
    const extraction = this.getExtraction(extractionId);

    // Verify ownership
    if (extraction.userId !== userId) {
      throw new ValidationError('Cannot delete extraction you do not own');
    }

    extractions.delete(extractionId);

    logger.info(`Extraction deleted: ${extractionId}`);
  }

  /**
   * Get extraction count for user (for rate limiting)
   */
  static getUserExtractionCountToday(userId: string): number {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return Array.from(extractions.values()).filter((e) => {
      const createdAt = new Date(e.createdAt);
      return e.userId === userId && createdAt >= startOfDay;
    }).length;
  }
  
  // For testing purposes only
  static clearAll(): void {
    if (process.env.NODE_ENV === 'test') {
      extractions.clear();
    }
  }
}

export default ExtractionService;