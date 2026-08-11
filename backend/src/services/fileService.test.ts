/**
 * FileService tests
 */

import { describe, it, expect } from '@jest/globals';
import FileService from './fileService.js';

describe('FileService', () => {
  describe('validateFile', () => {
    it('should validate JavaScript file', () => {
      const result = FileService.validateFile('test.js', 1024);
      expect(result.isValid).toBe(true);
    });

    it('should validate TypeScript file', () => {
      const result = FileService.validateFile('test.ts', 1024);
      expect(result.isValid).toBe(true);
    });

    it('should validate React component', () => {
      const result = FileService.validateFile('Component.jsx', 2048);
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid file type', () => {
      const result = FileService.validateFile('test.txt', 1024);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject oversized file for free tier', () => {
      const fileSizeBytes = 100 * 1024; // 100KB
      const result = FileService.validateFile('test.js', fileSizeBytes, 'free');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('exceeds limit');
    });

    it('should accept large file for pro tier', () => {
      const fileSizeBytes = 5 * 1024 * 1024; // 5MB
      const result = FileService.validateFile('test.js', fileSizeBytes, 'pro');
      expect(result.isValid).toBe(true);
    });

    it('should reject empty file', () => {
      const result = FileService.validateFile('test.js', 0);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should be case-insensitive for extensions', () => {
      const result1 = FileService.validateFile('TEST.JS', 1024);
      const result2 = FileService.validateFile('Test.Ts', 1024);
      expect(result1.isValid).toBe(true);
      expect(result2.isValid).toBe(true);
    });
  });

  describe('generateTempFilePath', () => {
    it('should generate correct temp file path', () => {
      const filePath = FileService.generateTempFilePath('test.js', 'extraction-123');
      expect(filePath).toContain('extraction-123.js');
      expect(filePath).toContain('temp');
    });

    it('should preserve file extension', () => {
      const jsPath = FileService.generateTempFilePath('code.js', 'id-1');
      const tsPath = FileService.generateTempFilePath('code.ts', 'id-2');
      const jsxPath = FileService.generateTempFilePath('component.jsx', 'id-3');

      expect(jsPath).toContain('.js');
      expect(tsPath).toContain('.ts');
      expect(jsxPath).toContain('.jsx');
    });
  });
});