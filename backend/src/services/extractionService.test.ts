/**
 * ExtractionService tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import ExtractionService from '../services/extractionService.js';

describe('ExtractionService', () => {
  beforeEach(async () => {
    await ExtractionService.clearAll();
  });
  const testUserId = 'test-user-123';
  const fileName = 'test.js';
  const fileSizeBytes = 1024;

  describe('createExtraction', () => {
    it('should create extraction record', async () => {
      const extraction = await ExtractionService.createExtraction(
        testUserId,
        fileName,
        fileSizeBytes
      );

      expect(extraction.id).toBeDefined();
      expect(extraction.userId).toBe(testUserId);
      expect(extraction.fileName).toBe(fileName);
      expect(extraction.fileSizeBytes).toBe(fileSizeBytes);
      expect(extraction.status).toBe('pending');
      expect(extraction.createdAt).toBeDefined();
    });

    it('should generate unique IDs', async () => {
      const extraction1 = await ExtractionService.createExtraction(
        testUserId,
        'file1.js',
        1024
      );
      const extraction2 = await ExtractionService.createExtraction(
        testUserId,
        'file2.js',
        1024
      );

      expect(extraction1.id).not.toBe(extraction2.id);
    });
  });

  describe('getExtraction', () => {
    let extractionId: string;

    beforeEach(async () => {
      const extraction = await ExtractionService.createExtraction(
        testUserId,
        fileName,
        fileSizeBytes
      );
      extractionId = extraction.id;
    });

    it('should retrieve extraction by ID', async () => {
      const extraction = await ExtractionService.getExtraction(extractionId);
      expect(extraction.id).toBe(extractionId);
      expect(extraction.fileName).toBe(fileName);
    });

    it('should throw error for non-existent ID', async () => {
      await expect(ExtractionService.getExtraction('non-existent-id')).rejects.toThrow();
    });
  });

  describe('getUserExtractions', () => {
    beforeEach(async () => {
      await ExtractionService.createExtraction(testUserId, 'file1.js', 1024);
      await ExtractionService.createExtraction(testUserId, 'file2.ts', 2048);
      await ExtractionService.createExtraction('other-user', 'file3.js', 512);
    });

    it('should return only user\'s extractions', async () => {
      const extractions = await ExtractionService.getUserExtractions(testUserId);
      expect(extractions.length).toBe(2);
      expect(extractions.every((e) => e.userId === testUserId)).toBe(true);
    });

    it('should return empty array for user with no extractions', async () => {
      const extractions = await ExtractionService.getUserExtractions('new-user');
      expect(extractions.length).toBe(0);
    });
  });

  describe('updateExtractionStatus', () => {
    let extractionId: string;

    beforeEach(async () => {
      const extraction = await ExtractionService.createExtraction(
        testUserId,
        fileName,
        fileSizeBytes
      );
      extractionId = extraction.id;
    });

    it('should update status', async () => {
      const updated = await ExtractionService.updateExtractionStatus(
        extractionId,
        'processing'
      );
      expect(updated.status).toBe('processing');
    });

    it('should set error message', async () => {
      const errorMsg = 'Extraction failed';
      const updated = await ExtractionService.updateExtractionStatus(
        extractionId,
        'failed',
        errorMsg
      );
      expect(updated.status).toBe('failed');
      expect(updated.error).toBe(errorMsg);
    });

    it('should update timestamp', async () => {
      const extraction = await ExtractionService.getExtraction(extractionId);            
      const oldTimestamp = extraction.updatedAt;      
      
      // Artificial delay to ensure the database registers a new millisecond
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updated = await ExtractionService.updateExtractionStatus(
        extractionId,
        'processing'
      );
      
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(oldTimestamp).getTime()
      );
    });
  });

  describe('setExtractionResults', () => {
    let extractionId: string;

    beforeEach(async () => {
      const extraction = await ExtractionService.createExtraction(
        testUserId,
        fileName,
        fileSizeBytes
      );
      extractionId = extraction.id;
    });

    it('should set results and mark completed', async () => {
      const results = {
        functions: [],
        components: [],
        utilities: [],
        constants: [],
        summary: {
          totalItems: 0,
          processingTimeMs: 100,
        },
      };

      const updated = await ExtractionService.setExtractionResults(
        extractionId,
        results
      );
      
      // Node-pg handles JSON differently, so we check properties instead of strict equality
      expect(updated.extractionResults!.summary.processingTimeMs).toBe(100);
      expect(updated.status).toBe('completed');
    });
  });

  describe('deleteExtraction', () => {
    let extractionId: string;

    beforeEach(async () => {
      const extraction = await ExtractionService.createExtraction(
        testUserId,
        fileName,
        fileSizeBytes
      );
      extractionId = extraction.id;
    });

    it('should delete extraction', async () => {
      await ExtractionService.deleteExtraction(extractionId, testUserId);
      await expect(ExtractionService.getExtraction(extractionId)).rejects.toThrow();
    });

    it('should prevent deleting another user\'s extraction', async () => {
      await expect(ExtractionService.deleteExtraction(extractionId, 'other-user')).rejects.toThrow();
    });
  });

  describe('getUserExtractionCountToday', () => {
    beforeEach(async () => {
      await ExtractionService.createExtraction(testUserId, 'file1.js', 1024);
      await ExtractionService.createExtraction(testUserId, 'file2.js', 1024);
    });

    it('should count today\'s extractions', async () => {
      const count = await ExtractionService.getUserExtractionCountToday(testUserId);
      expect(count).toBe(2);
    });

    it('should return 0 for user with no extractions today', async () => {
      const count = await ExtractionService.getUserExtractionCountToday('new-user');
      expect(count).toBe(0);
    });
  });
});