/**
 * Code analysis and AST-related TypeScript types
 */

export interface CodeItemMetadata {
  parameters: ParameterInfo[];
  returnType?: string;
  isAsync: boolean;
  isArrow: boolean;
  isExported: boolean;
  docComment?: string;
}

export interface ParameterInfo {
  name: string;
  type?: string;
  hasDefault: boolean;
}

export interface ComplexityMetrics {
  cyclomaticComplexity: number;
  nestingDepth: number;
  lineCount: number;
}

export interface AnalysisResult {
  success: boolean;
  error?: string;
  items?: AnalyzedCodeItem[];
  summary?: {
    totalItems: number;
    byType: {
      functions: number;
      components: number;
      utilities: number;
      constants: number;
    };
  };
}

export interface AnalyzedCodeItem {
  id: string;
  name: string;
  type: 'function' | 'component' | 'utility' | 'constant';
  code: string;
  startLine: number;
  endLine: number;
  lineCount: number;
  complexity: 'simple' | 'moderate' | 'complex';
  metadata: CodeItemMetadata;
  confidence: number; // 0-1, how confident this is the right type
}

export interface ASTAnalysisContext {
  sourceCode: string;
  fileName: string;
  items: AnalyzedCodeItem[];
  exports: Set<string>;
  imports: Map<string, string>;
}