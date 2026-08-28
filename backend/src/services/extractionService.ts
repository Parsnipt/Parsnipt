/**
 * Extraction business logic
 * Handles extraction creation, retrieval, and management
 */

import { randomUUID } from 'crypto';
import knex from '../config/database.js';
import {
  Extraction,
  ExtractionResults,
} from '../types/extraction.js';
import {
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';
import logger from '../utils/logger.js';

// Helper to map DB row to TypeScript object safely
const mapDbToExtraction = (dbExt: any): Extraction => ({
  id: dbExt.id,
  userId: dbExt.user_id || dbExt.userId,
  fileName: dbExt.file_name || dbExt.fileName,
  fileSizeBytes: dbExt.file_size_bytes || dbExt.fileSizeBytes,
  status: dbExt.status,
  error: dbExt.error,
  // Node-pg might return JSON as an object or string, this handles both
  extractionResults: typeof dbExt.extraction_results === 'string' 
    ? JSON.parse(dbExt.extraction_results) 
    : (dbExt.extraction_results || dbExt.extractionResults),
  createdAt: dbExt.created_at || dbExt.createdAt,
  updatedAt: dbExt.updated_at || dbExt.updatedAt,
});

export class ExtractionService {
  /**
   * Create new extraction record
   */
  static async createExtraction(
    userId: string,
    fileName: string,
    fileSizeBytes: number
  ): Promise<Extraction> {
    const extractionId = randomUUID();
    const now = new Date().toISOString();

    const newExtraction = {
      id: extractionId,
      user_id: userId,
      file_name: fileName,
      file_size_bytes: fileSizeBytes,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    try {
      await knex('extractions').insert(newExtraction);
    } catch (e) {
      // Fallback for camelCase schema
      await knex('extractions').insert({
        id: extractionId,
        userId,
        fileName,
        fileSizeBytes,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      });
    }

    logger.info(`Extraction created: ${extractionId} for user: ${userId}`);

    return {
      id: extractionId,
      userId,
      fileName,
      fileSizeBytes,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get extraction by ID
   */
  static async getExtraction(extractionId: string): Promise<Extraction> {
    const dbExt = await knex('extractions').where({ id: extractionId }).first();
    if (!dbExt) {
      throw new NotFoundError('Extraction');
    }
    return mapDbToExtraction(dbExt);
  }

  /**
   * Get all extractions for a user
   */
  static async getUserExtractions(userId: string): Promise<Extraction[]> {
    try {
      const dbExtractions = await knex('extractions').where({ user_id: userId });
      return dbExtractions.map(mapDbToExtraction);
    } catch (e) {
      const dbExtractions = await knex('extractions').where({ userId });
      return dbExtractions.map(mapDbToExtraction);
    }
  }

  /**
   * Update extraction status
   */
  static async updateExtractionStatus(
    extractionId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    error?: string
  ): Promise<Extraction> {
    const now = new Date().toISOString();
    
    try {
      await knex('extractions').where({ id: extractionId }).update({
        status,
        error: error || null,
        updated_at: now
      });
    } catch (e) {
      await knex('extractions').where({ id: extractionId }).update({
        status,
        error: error || null,
        updatedAt: now
      });
    }

    logger.info(`Extraction status updated: ${extractionId} -> ${status}`);
    return this.getExtraction(extractionId);
  }

  /**
   * Set extraction results
   */
  static async setExtractionResults(
    extractionId: string,
    results: ExtractionResults
  ): Promise<Extraction> {
    const now = new Date().toISOString();
    
    try {
      await knex('extractions').where({ id: extractionId }).update({
        extraction_results: results,
        status: 'completed',
        updated_at: now
      });
    } catch (e) {
      await knex('extractions').where({ id: extractionId }).update({
        extractionResults: results,
        status: 'completed',
        updatedAt: now
      });
    }

    logger.info(`Extraction results set: ${extractionId} with ${results.summary.totalItems} items`);
    return this.getExtraction(extractionId);
  }

  /**
   * Delete extraction
   */
  static async deleteExtraction(extractionId: string, userId: string): Promise<void> {
    const extraction = await this.getExtraction(extractionId);

    // Verify ownership
    if (extraction.userId !== userId) {
      throw new ValidationError('Cannot delete extraction you do not own');
    }

    await knex('extractions').where({ id: extractionId }).del();
    logger.info(`Extraction deleted: ${extractionId}`);
  }

  /**
   * Get extraction count for user (for rate limiting)
   */
  static async getUserExtractionCountToday(userId: string): Promise<number> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    try {
      const result = await knex('extractions')
        .where('user_id', userId)
        .andWhere('created_at', '>=', startOfDay)
        .count('* as count')
        .first();
      return parseInt(result?.count as string || '0', 10);
    } catch (e) {
      const result = await knex('extractions')
        .where('userId', userId)
        .andWhere('createdAt', '>=', startOfDay)
        .count('* as count')
        .first();
      return parseInt(result?.count as string || '0', 10);
    }
  }
  
  // For testing purposes only
  static async clearAll(): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      await knex('extractions').del();
    }
  }
}

export default ExtractionService; 