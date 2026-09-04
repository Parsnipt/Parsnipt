/**
 * Migration service to convert old extraction format to new format
 * Handles backward compatibility and data transformation
 */

import { Artifact, ArtifactRole, FileAnalysis, ArtifactKind } from '../../types/artifact.js';

interface OldExtraction {
  id: string;
  name: string;
  type: string; 
  code: string;
  startLine: number;
  endLine: number;
  lineCount: number;
  complexity: string;
  confidence: number;
  parameters?: Array<{ name: string; hasDefault: boolean }>;
  isArrow?: boolean;
  isExported?: boolean;
}

interface OldFileAnalysis {
  summary: {
    totalItems: number;
    processingTimeMs: number;
  };
  constants: OldExtraction[];
  functions: OldExtraction[];
  utilities: OldExtraction[];
  components: OldExtraction[];
}

class MigrationService {
  /**
   * Convert old extraction format to new format
   */
  static migrateExtraction(old: OldExtraction, fileContext: string): Artifact {
    const newArtifact: Artifact = {
      id: old.id,
      fingerprint: '', // Will be calculated
      name: old.name,
      kind: this.mapKind(old.type, old.isArrow),
      role: this.inferRole(old.name, old.type),
      language: 'javascript',

      source: {
        file: fileContext, 
        startLine: old.startLine,
        endLine: old.endLine,
        lineCount: old.lineCount
      },

      documentation: {
        leading: [],
        inline: [],
        trailing: []
      },

      syntax: {
        isAsync: false,
        isArrow: old.isArrow || false,
        isGenerator: false,
        isExported: old.isExported || false,
        isImported: false,
        visibility: 'public',
        exportType: old.isExported ? 'named' : 'none'
      },

      parameters: (old.parameters || []).map((param, index) => ({
        name: param.name,
        hasDefault: param.hasDefault,
        position: index,
        isRest: false,
        isDestructured: false
      })),

      returns: {
        present: false,
        count: 0,
        expressions: [],
        isAsync: false,
        isGenerator: false
      },

      analysis: {
        complexity: (old.complexity as 'simple' | 'moderate' | 'complex') || 'simple',
        cyclomaticComplexity: 1,
        nestingDepth: 0,
        branchCount: 0,
        loopCount: 0,
        callCount: 0,
        externalDependencies: 0,
        documentationCoverage: 0
      },

      relationships: {
        calls: [],
        calledBy: [],
        references: [],
        referencedBy: [],
        imports: [],
        exports: [],
        children: []
      },

      confidence: {
        overall: old.confidence,
        classification: old.confidence,
        location: 1.0,
        parameters: 0.9,
        returns: 0.8,
        analysis: 0.85
      },

      code: old.code,
      createdAt: new Date().toISOString(),
      version: 1
    };

    return newArtifact;
  }

  /**
   * Convert old file analysis to new format
   */
  static migrateFileAnalysis(old: OldFileAnalysis, fileName: string, code: string): FileAnalysis {
    const allArtifacts = [
      ...old.constants,
      ...old.functions,
      ...old.utilities,
      ...old.components
    ];

    const migratedArtifacts = allArtifacts.map(artifact =>
      this.migrateExtraction(artifact, fileName)
    );

    // Count by kind
    const byKind: Record<ArtifactKind, number> = {
      'function': 0,
      'method': 0,
      'arrow-function': 0,
      'class': 0,
      'constant': 0,
      'variable': 0,
      'property': 0,
      'component': 0,
      'interface': 0,
      'enum': 0,
      'object-literal': 0
    };

    migratedArtifacts.forEach(artifact => {
      byKind[artifact.kind]++;
    });

    // Count by role
    const byRole: Record<ArtifactRole, number> = {
      'utility': 0,
      'validation': 0,
      'configuration': 0,
      'rendering': 0,
      'networking': 0,
      'security': 0,
      'data-processing': 0,
      'business-logic': 0,
      'test': 0,
      'initialization': 0,
      'transformation': 0,
      'handler': 0,
      'factory': 0,
      'decorator': 0,
      'unknown': 0
    };

    migratedArtifacts.forEach(artifact => {
      byRole[artifact.role]++;
    });

    const migrated: FileAnalysis = {
      schemaVersion: '1.0.0',
      generator: {
        name: 'Parsnipt',
        version: '0.2.0'
      },
      source: {
        fileName,
        language: 'javascript',
        lineCount: code.split('\n').length,
        characterCount: code.length
      },
      processingTime: {
        parsingMs: 0,
        extractionMs: old.summary.processingTimeMs,
        analysisMs: 0,
        totalMs: old.summary.processingTimeMs
      },
      timestamp: new Date().toISOString(),
      summary: {
        totalArtifacts: old.summary.totalItems,
        byKind,
        byRole,
        overallConfidence: this.calculateAverageConfidence(migratedArtifacts),
        documentationCoverage: this.calculateDocumentationCoverage(migratedArtifacts)
      },
      artifacts: migratedArtifacts
    };

    return migrated;
  }

  /**
   * Map old type to new kind
   */
  private static mapKind(oldType: string, isArrow?: boolean): ArtifactKind {
    const type = oldType.toLowerCase();

    if (type === 'constant') return 'constant';
    if (type === 'component') return 'component';
    if (type === 'utility' || type === 'function') {
      return isArrow ? 'arrow-function' : 'function';
    }
    if (type === 'class') return 'class';
    if (type === 'method') return 'method';

    return 'variable';
  }

  /**
   * Infer role from old type and name
   */
  private static inferRole(name: string, oldType: string): ArtifactRole {
    const type = oldType.toLowerCase();
    const lowerName = name.toLowerCase();

    if (type === 'component') return 'rendering';
    if (type === 'constant') return 'configuration';

    if (lowerName.includes('validate')) return 'validation';
    if (lowerName.includes('config')) return 'configuration';
    if (lowerName.includes('render')) return 'rendering';

    return 'utility';
  }

  /**
   * Calculate average confidence across artifacts
   */
  private static calculateAverageConfidence(artifacts: Artifact[]): number {
    if (artifacts.length === 0) return 0;
    const sum = artifacts.reduce((acc, a) => acc + a.confidence.overall, 0);
    return sum / artifacts.length;
  }

  /**
   * Calculate documentation coverage
   */
  private static calculateDocumentationCoverage(artifacts: Artifact[]): number {
    if (artifacts.length === 0) return 0;

    const documented = artifacts.filter(a =>
      a.documentation?.leading && a.documentation.leading.length > 0
    ).length;

    return (documented / artifacts.length) * 100;
  }
}

export { MigrationService };