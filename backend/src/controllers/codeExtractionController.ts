/**
 * Code extraction controller
 * Handles extraction processing after file upload
 */

import ExtractionService from '../services/extractionService.js';
import FileService from '../services/fileService.js';
import CodeExtractorService from '../services/codeExtractorService.js';
import { ExtractionResults } from '../types/extraction.js';
import logger from '../utils/logger.js';

export class CodeExtractionController {
  /**
   * Process extraction
   * Reads file, extracts code items, saves results
   */
  static async processExtraction(extractionId: string): Promise<void> {
    let tempFilePath: string | null = null;

    try {
      // Get extraction record
      const extraction = await ExtractionService.getExtraction(extractionId);

      if (!extraction) {
        throw new Error(`Extraction record ${extractionId} not found`);
      }

      logger.info(`Processing extraction: ${extractionId}`);

      // Mark as processing
      await ExtractionService.updateExtractionStatus(extractionId, 'processing');

      // Read file content
      tempFilePath = FileService.generateTempFilePath(extraction.fileName, extractionId);
      const fileContent = await FileService.readFileContent(tempFilePath);

      logger.info(`File read: ${extractionId}, size: ${fileContent.length} bytes`);

      // Extract code items
      const analysisResult = await CodeExtractorService.extractCodeItems(
        fileContent,
        extraction.fileName
      );

      if (!analysisResult.success || !analysisResult.items) {
        throw new Error(analysisResult.error || 'Extraction failed');
      }

      logger.info(
        `Code extracted: ${analysisResult.items.length} items found`
      );

      // Filter and sort results
      const filteredItems = CodeExtractorService.filterResults(analysisResult.items);
      const sortedItems = CodeExtractorService.sortByRelevance(filteredItems);

      logger.info(
        `Results filtered: ${sortedItems.length} items after filtering`
      );

      // Organize by type
      const results: ExtractionResults = {
        functions: sortedItems.filter((i) => i.type === 'function'),
        components: sortedItems.filter((i) => i.type === 'component'),
        utilities: sortedItems.filter((i) => i.type === 'utility'),
        constants: sortedItems.filter((i) => i.type === 'constant'),
        summary: {
          totalItems: sortedItems.length,
          processingTimeMs: Date.now() - new Date(extraction.createdAt).getTime(),
        },
      };

      // Save results to extraction record
      await ExtractionService.setExtractionResults(extractionId, results);

      logger.info(`Extraction completed: ${extractionId}`);
    } catch (error) {
      logger.error(`Extraction processing error: ${error}`);

      // Mark as failed
      await ExtractionService.updateExtractionStatus(
        extractionId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      // Clean up temp file
      if (tempFilePath) {
        try {
          await FileService.deleteTemporaryFile(tempFilePath);
        } catch (err) {
          logger.warn(`Failed to clean up temp file: ${err}`);
        }
      }
    }
  }
}

export default CodeExtractionController;