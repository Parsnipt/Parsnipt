/**
 * Extraction-related TypeScript types for frontend
 */

export interface CodeItem {
  id: string;
  name: string;
  type: 'function' | 'component' | 'utility' | 'constant';
  code: string;
  startLine: number;
  endLine: number;
  lineCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  metadata: {
    parameters: Array<{
      name: string;
      type?: string;
      hasDefault: boolean;
    }>;
    returnType?: string;
    isAsync: boolean;
    isArrow: boolean;
    isExported: boolean;
    docComment?: string;
  };
  confidence: number;
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

export interface CreateExtractionRequest {
  file: File;
}

export interface ExtractionListResponse {
  success: boolean;
  data: Extraction[];
  timestamp: string;
}

export interface ExtractionDetailResponse {
  success: boolean;
  data: Extraction;
  timestamp: string;
}