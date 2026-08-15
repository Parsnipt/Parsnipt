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

export type CodeType = 'function' | 'component' | 'utility' | 'constant';

export interface CodeItem {
  id: string;
  name: string;
  type: CodeType;
  code: string;
  lineCount: number;
  complexity: string;
  startLine: number;
  endLine: number;
}

export interface Extraction {
  id: string;
  userId: string;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: string;
  extractionResults?: {
    functions: CodeItem[];
    components: CodeItem[];
    utilities: CodeItem[];
    constants: CodeItem[];
  };
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