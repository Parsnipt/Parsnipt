/**
 * Main extraction service using enhanced Babel visitor
 * Handles file parsing and artifact extraction
 */

import * as parser from '@babel/parser';
import { ArtifactVisitor } from './babel-visitor.js';
import { Artifact, FileAnalysis } from '../../types/artifact.js';
import { performance } from 'perf_hooks';

class ExtractionService {
  /**
   * Extract artifacts from source code
   */
  async extractFromCode(
    code: string,
    fileName: string,
    language: string = 'javascript'
  ): Promise<FileAnalysis> {

    try {
      // Parse code with Babel
      const parseStartTime = performance.now();
      const ast = this.parseCode(code, language);
      const parseEndTime = performance.now();

      // Extract artifacts
      const extractStartTime = performance.now();
      const visitor = new ArtifactVisitor(code, fileName);
      const artifacts = visitor.visit(ast);
      const extractEndTime = performance.now();

      // Analyze artifacts
      const analysisStartTime = performance.now();
      this.enrichArtifacts(artifacts, code);
      const analysisEndTime = performance.now();

      // Build file analysis
      const fileAnalysis = this.buildFileAnalysis(
        artifacts,
        fileName,
        code,
        parseEndTime - parseStartTime,
        extractEndTime - extractStartTime,
        analysisEndTime - analysisStartTime
      );

      return fileAnalysis;
    } catch (error) {
      throw new ExtractionError(
        `Failed to extract from ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse code based on language
   */
  private parseCode(code: string, language: string): any {
    const parserOptions = {
      sourceType: 'module' as const,
      attachComment: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: this.getParserPlugins(language)
    };

    try {
      return parser.parse(code, parserOptions);
    } catch (error) {
      throw new ParsingError(
        `Failed to parse as ${language}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get Babel parser plugins based on language
   */
  private getParserPlugins(language: string): any[] {
    const basePlugins = [
      'jsx',
      'asyncGenerators',
      ['pipelineOperator', { proposal: 'minimal' }],
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'classStaticBlock',
      'decorators-legacy',
      'doExpressions',
      'dynamicImport',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'functionBind',
      'functionSent',
      'importMeta',
      'logicalAssignment',
      'nullishCoalescingOperator',
      'numericSeparator',
      'objectRestSpread',
      'optionalCatchBinding',
      'optionalChaining',
      ['pipelineOperator', { proposal: 'minimal' }],
      'partialApplication',
      'recordAndTuple',
      'RegexpUnicodeSets',
      'throwExpressions'
    ];

    if (language === 'typescript' || language === 'tsx') {
      basePlugins.push('typescript');
    }

    return basePlugins;
  }

  /**
   * Enrich artifacts with additional analysis
   */
  private enrichArtifacts(artifacts: Artifact[], _code: string): void {
    // Add relationships between artifacts
    this.establishRelationships(artifacts);

    // Enhance documentation coverage
    artifacts.forEach(artifact => {
      artifact.analysis.documentationCoverage = this.calculateDocCoverage(artifact);
    });
  }

  /**
   * Establish relationships between artifacts
   */
  private establishRelationships(artifacts: Artifact[]): void {
    const artifactMap = new Map<string, Artifact>();
    artifacts.forEach(a => artifactMap.set(a.id, a));

    // Link parent-child relationships
    artifacts.forEach(artifact => {
      if (artifact.parent?.id) {
        const parent = artifactMap.get(artifact.parent.id);
        if (parent) {
          if (!parent.relationships.children) {
            parent.relationships.children = [];
          }
          parent.relationships.children.push(artifact.id);
        }
      }
    });

    // Detect calls between artifacts
    artifacts.forEach(artifact => {
      artifact.relationships.calls?.forEach(callName => {
        const called = artifacts.find(a => a.name === callName);
        if (called && called.id !== artifact.id) {
          if (!called.relationships.calledBy) {
            called.relationships.calledBy = [];
          }
          if (!called.relationships.calledBy.includes(artifact.id)) {
            called.relationships.calledBy.push(artifact.id);
          }
        }
      });
    });
  }

  /**
   * Calculate documentation coverage percentage
   */
  private calculateDocCoverage(artifact: Artifact): number {
    if (artifact.documentation?.jsdoc?.description) {
      return 100;
    }

    let score = 0;
    if (artifact.documentation?.leading && artifact.documentation.leading.length > 0) {
      score += 50;
    }
    if (artifact.documentation?.inline && artifact.documentation.inline.length > 0) {
      score += 25;
    }
    if (artifact.returns?.present) {
      score += 25;
    }

    return Math.min(score, 100);
  }

  /**
   * Build file-level analysis
   */
  private buildFileAnalysis(
    artifacts: Artifact[],
    fileName: string,
    code: string,
    parseTime: number,
    extractTime: number,
    analysisTime: number
  ): FileAnalysis {
    // Count artifacts by kind
    const byKind: Record<string, number> = {};
    artifacts.forEach(a => {
      byKind[a.kind] = (byKind[a.kind] || 0) + 1;
    });

    // Count artifacts by role
    const byRole: Record<string, number> = {};
    artifacts.forEach(a => {
      byRole[a.role] = (byRole[a.role] || 0) + 1;
    });

    // Calculate overall confidence
    const overallConfidence =
      artifacts.length > 0
        ? artifacts.reduce((sum, a) => sum + a.confidence.overall, 0) / artifacts.length
        : 0;

    // Calculate documentation coverage
    const docCoverage =
      artifacts.length > 0
        ? artifacts.reduce((sum, a) => sum + a.analysis.documentationCoverage, 0) / artifacts.length
        : 0;

    return {
      schemaVersion: '1.0.0',
      generator: {
        name: 'Parsnipt',
        version: '0.2.0'
      },
      source: {
        fileName,
        language: this.detectLanguage(fileName),
        lineCount: code.split('\n').length,
        characterCount: code.length
      },
      processingTime: {
        parsingMs: Math.round(parseTime),
        extractionMs: Math.round(extractTime),
        analysisMs: Math.round(analysisTime),
        totalMs: Math.round(parseTime + extractTime + analysisTime)
      },
      timestamp: new Date().toISOString(),
      summary: {
        totalArtifacts: artifacts.length,
        byKind: byKind as any,
        byRole: byRole as any,
        overallConfidence: Math.round(overallConfidence * 100) / 100,
        documentationCoverage: Math.round(docCoverage)
      },
      artifacts
    };
  }

  /**
   * Detect language from file extension
   */
  private detectLanguage(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'mjs': 'javascript',
      'ts': 'typescript',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'py': 'python',
      'go': 'go'
    };

    return languageMap[ext || ''] || 'javascript';
  }
}

class ExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExtractionError';
  }
}

class ParsingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ParsingError';
  }
}

export { ExtractionService, ExtractionError, ParsingError };