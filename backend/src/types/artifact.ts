/**
 * Comprehensive artifact model with semantic structure
 */

// ============================================
// Kind: What is it syntactically?
// ============================================
export type ArtifactKind =
  | 'function'
  | 'method'
  | 'arrow-function'
  | 'class'
  | 'constant'
  | 'variable'
  | 'property'
  | 'component'
  | 'interface'
  | 'enum'
  | 'object-literal';

// ============================================
// Role: What does it appear to do?
// ============================================
export type ArtifactRole =
  | 'utility'
  | 'validation'
  | 'configuration'
  | 'rendering'
  | 'networking'
  | 'security'
  | 'data-processing'
  | 'business-logic'
  | 'test'
  | 'initialization'
  | 'transformation'
  | 'handler'
  | 'factory'
  | 'decorator'
  | 'unknown';

// ============================================
// Visibility/Export Status
// ============================================
export type Visibility = 'public' | 'private' | 'protected' | 'module';

export type ExportType = 'named' | 'default' | 'none';

// ============================================
// Parameter Information
// ============================================
export interface Parameter {
  name: string;
  position: number;
  hasDefault: boolean;
  defaultValue?: string;
  isRest: boolean;
  isDestructured: boolean;
  destructurePattern?: string; // e.g., "{ name, age }"
  typeAnnotation?: string; // TypeScript type
}

// ============================================
// Return Information
// ============================================
export interface ReturnInfo {
  present: boolean;
  count: number;
  expressions: string[]; // Actual return statements
  inferredType?: string; // Inferred from analysis
  isAsync: boolean;
  isGenerator: boolean;
}

// ============================================
// Comment/Documentation
// ============================================
export interface CommentBlock {
  startLine: number;
  endLine: number;
  text: string;
  type: 'block' | 'line';
}

export interface InlineComment {
  line: number;
  column: number;
  text: string;
}

export interface JSDocBlock {
  description?: string;
  params?: Array<{
    name: string;
    type?: string;
    description?: string;
  }>;
  returns?: {
    type?: string;
    description?: string;
  };
  throws?: Array<{
    type: string;
    description?: string;
  }>;
  deprecated?: boolean;
  example?: string;
  todo?: string[];
  fixme?: string[];
  see?: string[];
}

export interface Documentation {
  leading: CommentBlock[];
  inline: InlineComment[];
  trailing: CommentBlock[];
  jsdoc?: JSDocBlock;
}

// ============================================
// Source Traceability
// ============================================
export interface SourceRange {
  file: string;
  startLine: number;
  endLine: number;
  lineCount: number;
  startColumn?: number;
  endColumn?: number;
}

// ============================================
// Hierarchy & Scope
// ============================================
export interface Parent {
  id: string;
  name: string;
  kind: ArtifactKind;
}

export interface Scope {
  depth: number; // 0 = file level, 1 = in class/function, etc.
  parentId?: string;
  containedBy?: string;
}

// ============================================
// Syntax Information
// ============================================
export interface SyntaxInfo {
  isAsync: boolean;
  isArrow: boolean;
  isGenerator: boolean;
  isExported: boolean;
  isImported: boolean;
  visibility: Visibility;
  exportType: ExportType;
}

// ============================================
// Analysis Metrics
// ============================================
export interface AnalysisMetrics {
  complexity: 'simple' | 'moderate' | 'complex';
  cyclomaticComplexity: number; // 1-N
  nestingDepth: number;
  branchCount: number; // if/switch statements
  loopCount: number; // for/while/forEach
  callCount: number; // Function calls made
  externalDependencies: number;
  documentationCoverage: number; // 0-100%
}

// ============================================
// Relationships
// ============================================
export interface Relationships {
  calls: string[]; // IDs of artifacts this calls
  calledBy: string[]; // IDs that call this
  references: string[]; // IDs referenced
  referencedBy: string[]; // IDs that reference this
  imports: string[]; 
  exports: string[];
  children?: string[];
  parent?: string;
}

// ============================================
// Confidence Scoring
// ============================================
export interface ConfidenceScores {
  overall: number; // 0-1
  classification: number; // How sure Parsnipt is about kind/role
  location: number; // How sure about line numbers
  parameters: number; // How sure about param extraction
  returns: number; // How sure about return info
  analysis: number; // How sure about metrics
}

// ============================================
// Main Artifact
// ============================================
export interface Artifact {
  // Identity
  id: string; // UUID
  fingerprint: string; // SHA256 of content
  name: string;

  // Classification
  kind: ArtifactKind;
  role: ArtifactRole;
  language: string; // 'javascript', 'typescript', etc.

  // Source
  source: SourceRange;

  // Documentation
  documentation?: Documentation;

  // Hierarchy
  parent?: Parent;
  children?: Artifact[];
  scope?: Scope;

  // Code Syntax
  syntax: SyntaxInfo;

  // Interface
  parameters: Parameter[];
  returns: ReturnInfo;

  // Analysis
  analysis: AnalysisMetrics;

  // Relationships
  relationships: Relationships;

  // Confidence
  confidence: ConfidenceScores;

  // Raw Source
  code: string;

  // Metadata
  createdAt: string; // ISO timestamp
  version: number; // Schema version
}

// ============================================
// File-Level Analysis
// ============================================
export interface FileAnalysis {
  schemaVersion: string;
  generator: {
    name: string;
    version: string;
  };
  source: {
    fileName: string;
    language: string;
    lineCount: number;
    characterCount: number;
  };
  processingTime: {
    parsingMs: number;
    extractionMs: number;
    analysisMs: number;
    totalMs: number;
  };
  timestamp: string;
  summary: {
    totalArtifacts: number;
    byKind: Record<ArtifactKind, number>;
    byRole: Record<ArtifactRole, number>;
    overallConfidence: number;
    documentationCoverage: number;
  };
  artifacts: Artifact[];
}