/**
 * Global TypeScript type definitions
 */

export interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface Extraction {
  id: string;
  fileName: string;
  status: 'processing' | 'completed' | 'failed';
  results?: ExtractionResults;
  createdAt: string;
}

export interface ExtractionResults {
  functions: CodeItem[];
  components: CodeItem[];
  utilities: CodeItem[];
  constants: CodeItem[];
}

export interface CodeItem {
  name: string;
  type: 'function' | 'component' | 'utility' | 'constant';
  code: string;
  startLine: number;
  endLine: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}