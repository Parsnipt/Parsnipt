/**
 * ExtractionService tests
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import ExtractionService from './extractionService.js';

describe('ExtractionService', () => {
  beforeEach(() => {
    ExtractionService.clearAll();
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

    it('should retrieve extraction by ID', () => {
      const extraction = ExtractionService.getExtraction(extractionId);
      expect(extraction.id).toBe(extractionId);
      expect(extraction.fileName).toBe(fileName);
    });

    it('should throw error for non-existent ID', () => {
      expect(() => {
        ExtractionService.getExtraction('non-existent-id');
      }).toThrow();
    });
  });

  describe('getUserExtractions', () => {
    beforeEach(async () => {
      await ExtractionService.createExtraction(testUserId, 'file1.js', 1024);
      await ExtractionService.createExtraction(testUserId, 'file2.ts', 2048);
      await ExtractionService.createExtraction('other-user', 'file3.js', 512);
    });

    it('should return only user\'s extractions', () => {
      const extractions = ExtractionService.getUserExtractions(testUserId);
      expect(extractions.length).toBe(2);
      expect(extractions.every((e) => e.userId === testUserId)).toBe(true);
    });

    it('should return empty array for user with no extractions', () => {
      const extractions = ExtractionService.getUserExtractions('new-user');
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

    it('should update status', () => {
      const updated = ExtractionService.updateExtractionStatus(
        extractionId,
        'processing'
      );
      expect(updated.status).toBe('processing');
    });

    it('should set error message', () => {
      const errorMsg = 'Extraction failed';
      const updated = ExtractionService.updateExtractionStatus(
        extractionId,
        'failed',
        errorMsg
      );
      expect(updated.status).toBe('failed');
      expect(updated.error).toBe(errorMsg);
    });

    it('should update timestamp', () => {
      const extraction = ExtractionService.getExtraction(extractionId);            
      const pastTime = new Date(extraction.updatedAt);
      
      pastTime.setSeconds(pastTime.getSeconds() - 1);
      extraction.updatedAt = pastTime.toISOString();

      const oldTimestamp = extraction.updatedAt;      
      const updated = ExtractionService.updateExtractionStatus(
        extractionId,
        'processing'
      );
      
      expect(new Date(updated.updatedAt).getTime()).toBeGreaterThan(
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

    it('should set results and mark completed', () => {
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

      const updated = ExtractionService.setExtractionResults(
        extractionId,
        results
      );
      expect(updated.extractionResults).toEqual(results);
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

    it('should delete extraction', () => {
      ExtractionService.deleteExtraction(extractionId, testUserId);
      expect(() => {
        ExtractionService.getExtraction(extractionId);
      }).toThrow();
    });

    it('should prevent deleting another user\'s extraction', () => {
      expect(() => {
        ExtractionService.deleteExtraction(extractionId, 'other-user');
      }).toThrow();
    });
  });

  describe('getUserExtractionCountToday', () => {
    beforeEach(async () => {
      await ExtractionService.createExtraction(testUserId, 'file1.js', 1024);
      await ExtractionService.createExtraction(testUserId, 'file2.js', 1024);
    });

    it('should count today\'s extractions', () => {
      const count = ExtractionService.getUserExtractionCountToday(testUserId);
      expect(count).toBe(2);
    });

    it('should return 0 for user with no extractions today', () => {
      const count = ExtractionService.getUserExtractionCountToday('new-user');
      expect(count).toBe(0);
    });
  });
});