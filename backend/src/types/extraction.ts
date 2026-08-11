/**
 * Extraction-related TypeScript types
 */

export interface CreateExtractionRequest {
  fileName: string;
  fileSizeBytes: number;
  fileContent: string;
}

export interface Extraction {
  id: string;
  userId: string;
  fileName: string;
  fileSizeBytes: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extractionResults?: ExtractionResults;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractionResults {
  functions: CodeItem[];
  components: CodeItem[];
  utilities: CodeItem[];
  constants: CodeItem[];
  summary: {
    totalItems: number;
    processingTimeMs: number;
  };
}

export interface CodeItem {
  id: string;
  name: string;
  type: 'function' | 'component' | 'utility' | 'constant';
  code: string;
  startLine: number;
  endLine: number;
  lineCount: number;
  complexity?: 'simple' | 'moderate' | 'complex';
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileType?: string;
}