/**
 * Extraction repository for database operations
 */

import knex from '../../config/database.js';
import { Extraction } from '../../types/extraction.js';
import logger from '../../utils/logger.js';

export class ExtractionRepository {
  /**
   * Create new extraction
   */
  static async create(
    extraction: Omit<Extraction, 'createdAt' | 'updatedAt'>
  ): Promise<Extraction> {
    try {
      const result = await knex('extractions')
        .insert({
          id: extraction.id,
          user_id: extraction.userId,
          file_name: extraction.fileName,
          file_size_bytes: extraction.fileSizeBytes,
          status: extraction.status,
          extraction_results: extraction.extractionResults || null,
          error: extraction.error || null,
        })
        .returning('*') as unknown as any[]; // Double cast for TypeScript safety

      const dbExtraction = result[0];

      return this.mapDbToExtraction(dbExtraction);
    } catch (error) {
      logger.error(`Failed to create extraction: ${error}`);
      throw error;
    }
  }

  /**
   * Find extraction by ID
   */
  static async findById(id: string): Promise<Extraction | null> {
    try {
      const extraction = await knex('extractions').where('id', id).first();

      if (!extraction) return null;

      return this.mapDbToExtraction(extraction);
    } catch (error) {
      logger.error(`Failed to find extraction: ${error}`);
      throw error;
    }
  }

  /**
   * Find all extractions for user
   */
  static async findByUserId(userId: string): Promise<Extraction[]> {
    try {
      const extractions = await knex('extractions')
        .where('user_id', userId)
        .orderBy('created_at', 'desc');

      return extractions.map(this.mapDbToExtraction);
    } catch (error) {
      logger.error(`Failed to find user extractions: ${error}`);
      throw error;
    }
  }

  /**
   * Update extraction
   */
  static async update(
    id: string,
    updates: Partial<Extraction>
  ): Promise<Extraction> {
    try {
      const dbUpdates: any = {};

      if (updates.status) dbUpdates.status = updates.status;
      if (updates.extractionResults)
        dbUpdates.extraction_results = updates.extractionResults;
      if (updates.error) dbUpdates.error = updates.error;

      dbUpdates.updated_at = knex.fn.now();

      // Double cast satisfying strict compiler checks
      const result = await knex('extractions')
        .where('id', id)
        .update(dbUpdates, ['*']) as unknown as any[];

      return this.mapDbToExtraction(result[0]);
    } catch (error) {
      logger.error(`Failed to update extraction: ${error}`);
      throw error;
    }
  }

  /**
   * Delete extraction
   */
  static async delete(id: string): Promise<void> {
    try {
      await knex('extractions').where('id', id).del();
    } catch (error) {
      logger.error(`Failed to delete extraction: ${error}`);
      throw error;
    }
  }

  /**
   * Count extractions for user today
   */
  static async countUserExtractionsToday(userId: string): Promise<number> {
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const result = await knex('extractions')
        .where('user_id', userId)
        .where('created_at', '>=', startOfDay)
        .count('* as count')
        .first();

      return result?.count ? parseInt(result.count as string, 10) : 0;
    } catch (error) {
      logger.error(`Failed to count user extractions: ${error}`);
      throw error;
    }
  }

  /**
   * Map database record to Extraction type
   */
  private static mapDbToExtraction(dbRecord: any): Extraction {
    return {
      id: dbRecord.id,
      userId: dbRecord.user_id,
      fileName: dbRecord.file_name,
      fileSizeBytes: dbRecord.file_size_bytes,
      status: dbRecord.status,
      extractionResults: dbRecord.extraction_results,
      error: dbRecord.error,
      createdAt: dbRecord.created_at.toISOString(),
      updatedAt: dbRecord.updated_at.toISOString(),
    };
  }
}

export default ExtractionRepository;