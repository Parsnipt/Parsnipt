/**
 * Extraction-related TypeScript types for frontend
 */

export type ArtifactKind = 'function' | 'arrow-function' | 'class' | 'method' | 'component' | 'constant' | 'variable' | 'unknown';
export type ArtifactRole = 'rendering' | 'data-processing' | 'validation' | 'networking' | 'configuration' | 'security' | 'initialization' | 'utility' | 'unknown';

export interface SourceLocation {
  startLine: number;
  endLine: number;
  startColumn?: number;
  endColumn?: number;
}

export interface Parameter {
  name: string;
  type?: string;
  hasDefault: boolean;
  defaultValue?: string;
  isDestructured?: boolean;
}

export interface ReturnInfo {
  present: boolean;
  count: number;
  expressions: string[];
  isAsync: boolean;
  isGenerator: boolean;
}

export interface Documentation {
  leading: string[];
  inline: string[];
  trailing: string[];
  jsdoc?: {
    description: string;
    tags: Array<{ tag: string; value: string }>;
  };
}

export interface SyntaxInfo {
  isAsync: boolean;
  isGenerator: boolean;
  isArrow: boolean;
  visibility: 'public' | 'private' | 'protected';
  exportType: 'none' | 'default' | 'named';
}

export interface AnalysisMetrics {
  complexity: 'low' | 'medium' | 'high';
  cyclomaticComplexity: number;
  nestingDepth: number;
  branchCount: number;
  loopCount: number;
  callCount: number;
  documentationCoverage: number;
}

export interface Relationships {
  calls: string[];
  calledBy: string[];
  references: string[];
  referencedBy: string[];
  imports: string[];
  exports: string[];
  children: string[];
}

export interface ConfidenceScores {
  overall: number;
  classification: number;
  location: number;
  parameters: number;
  returns: number;
  analysis: number;
}

export interface Artifact {
  id: string;
  name: string;
  kind: ArtifactKind;
  role: ArtifactRole;
  code: string;
  fingerprint: string;
  source: SourceLocation;
  parent: { id: string; name: string } | null;
  scopeDepth: number;
  syntax: SyntaxInfo;
  parameters: Parameter[];
  returns: ReturnInfo;
  documentation: Documentation;
  analysis: AnalysisMetrics;
  relationships: Relationships;
  confidence: ConfidenceScores;
}

export interface FileAnalysis {
  schemaVersion: string;
  generator: { name: string; version: string };
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
    byKind: Record<string, number>;
    byRole: Record<string, number>;
    overallConfidence: number;
    documentationCoverage: number;
  };
  artifacts: Artifact[];
}

export interface CreateExtractionRequest {
  file: File;
  language?: string;
}

// Responses from API
export interface ExtractionUploadResponse {
  success: boolean;
  data: FileAnalysis;
  timestamp?: string;
}

// Represents a saved artifact in the DB history
export interface DbExtraction {
  id: string;
  user_id: string;
  name: string;
  code: string;
  kind: ArtifactKind;
  role: ArtifactRole;
  fingerprint: string;
  created_at: string;
}

export interface ExtractionListResponse {
  success: boolean;
  data: DbExtraction[];
  timestamp?: string;
}