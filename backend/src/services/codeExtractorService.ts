/**
 * Code extraction service using Babel AST
 * Analyzes source code and extracts functions, components, utilities, and constants
 */

import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import generateModule from '@babel/generator';
import * as t from '@babel/types';
import { randomUUID } from 'crypto';
import {
  AnalyzedCodeItem,
  CodeItemMetadata,
  ASTAnalysisContext,
  AnalysisResult,
} from '../types/codeAnalysis.js';
import {
  extractDocComment,
  extractParameters,
  extractReturnType,
  isReactComponent,
  isUtilityFunction,
  calculateCyclomaticComplexity,
  getComplexityLevel,
  extractVariableType,
} from '../utils/astHelpers.js';
import logger from '../utils/logger.js';

// Babel ESM/CJS interop fixes
const traverse = typeof traverseModule === 'function' ? traverseModule : (traverseModule as any).default;
const generate = typeof generateModule === 'function' ? generateModule : (generateModule as any).default;

export class CodeExtractorService {
  /**
   * Main extraction method
   * Parses source code and extracts all code items
   */
  static async extractCodeItems(
    sourceCode: string,
    fileName: string
  ): Promise<AnalysisResult> {
    try {
      // Parse source code to AST
      const ast = this.parseSourceCode(sourceCode, fileName);
      if (!ast) {
        return {
          success: false,
          error: 'Failed to parse source code',
        };
      }

      // Create analysis context
      const context: ASTAnalysisContext = {
        sourceCode,
        fileName,
        items: [],
        exports: new Set(),
        imports: new Map(),
      };

      // Traverse and extract
      this.traverseAndExtract(ast, context);

      logger.info(
        `Code extraction complete: ${context.items.length} items extracted from ${fileName}`
      );

      return {
        success: true,
        items: context.items,
        summary: {
          totalItems: context.items.length,
          byType: {
            functions: context.items.filter((i) => i.type === 'function').length,
            components: context.items.filter((i) => i.type === 'component').length,
            utilities: context.items.filter((i) => i.type === 'utility').length,
            constants: context.items.filter((i) => i.type === 'constant').length,
          },
        },
      };
    } catch (error) {
      logger.error(`Code extraction error: ${error}`);
      return {
        success: false,
        error: `Code extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Parse source code using Babel
   */
  private static parseSourceCode(sourceCode: string, fileName: string): any {
    try {
      const sourceType = fileName.endsWith('module') ? 'module' : 'module';
      const plugins: any[] = [
        ['typescript'],
        ['jsx'],
        ['decorators', { decoratorsBeforeExport: false }],
      ];

      const ast = parse(sourceCode, {
        sourceType: sourceType as 'module' | 'script',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins,
        attachComment: true,
      });

      return ast;
    } catch (error) {
      logger.warn(`Failed to parse ${fileName}: ${error}`);
      return null;
    }
  }

  /**
   * Traverse AST and extract code items
   */
  private static traverseAndExtract(ast: any, context: ASTAnalysisContext): void {
    traverse(ast, {
      // Track exports
      ExportNamedDeclaration: (path: any) => {
        if (path.node.declaration) {
          if (t.isFunctionDeclaration(path.node.declaration)) {
            context.exports.add(path.node.declaration.id?.name || '');
          } else if (t.isVariableDeclaration(path.node.declaration)) {
            path.node.declaration.declarations.forEach((decl: any) => {
              if (t.isIdentifier(decl.id)) {
                context.exports.add(decl.id.name);
              }
            });
          }
        }
      },

      // Extract functions and methods
      FunctionDeclaration: (path: any) => {
        const item = this.extractFunctionDeclaration(path.node, context);
        if (item) context.items.push(item);
      },

      // Extract arrow functions and function expressions
      VariableDeclarator: (path: any) => {
        if (t.isArrowFunctionExpression(path.node.init) || 
            t.isFunctionExpression(path.node.init)) {
          const item = this.extractArrowOrExpressionFunction(
            path.node as any,
            context
          );
          if (item) context.items.push(item);
        } else if (
          t.isIdentifier(path.node.id) &&
          (t.isStringLiteral(path.node.init) ||
            t.isNumericLiteral(path.node.init) ||
            t.isBooleanLiteral(path.node.init) ||
            t.isArrayExpression(path.node.init) ||
            t.isObjectExpression(path.node.init))
        ) {
          const item = this.extractConstant(path.node as any, context);
          if (item) context.items.push(item);
        }
      },

      // Extract class methods
      ClassMethod: (path: any) => {
        if (t.isClassMethod(path.node)) {
          const item = this.extractClassMethod(path.node, context);
          if (item) context.items.push(item);
        }
      },
    });
  }

  /**
   * Extract function declaration
   */
  private static extractFunctionDeclaration(
    node: t.FunctionDeclaration,
    context: ASTAnalysisContext
  ): AnalyzedCodeItem | null {
    try {
      const name = node.id?.name || 'anonymous';
      const code = generate(node).code;
      const lines = code.split('\n');
      const lineCount = lines.length;

      // Get line numbers (approximation)
      const startLine = node.loc?.start.line || 0;
      const endLine = node.loc?.end.line || startLine + lineCount;

      const params = extractParameters(node);
      const returnType = extractReturnType(node);
      const docComment = extractDocComment(node);
      const complexity = calculateCyclomaticComplexity(code);

      const metadata: CodeItemMetadata = {
        parameters: params,
        returnType,
        isAsync: node.async || false,
        isArrow: false,
        isExported: context.exports.has(name),
        docComment,
      };

      // Determine type
      let type: 'function' | 'component' | 'utility' = 'function';
      let confidence = 0.95;

      if (isReactComponent(name, code, params)) {
        type = 'component';
      } else if (isUtilityFunction(name, code)) {
        type = 'utility';
      }

      return {
        id: randomUUID(),
        name,
        type,
        code,
        startLine,
        endLine,
        lineCount,
        complexity: getComplexityLevel(complexity, lineCount),
        metadata,
        confidence,
      };
    } catch (error) {
      logger.warn(`Failed to extract function declaration: ${error}`);
      return null;
    }
  }

  /**
   * Extract arrow function or function expression
   */
  private static extractArrowOrExpressionFunction(
    node: t.VariableDeclarator,
    context: ASTAnalysisContext
  ): AnalyzedCodeItem | null {
    try {
      const name = t.isIdentifier(node.id) ? node.id.name : 'anonymous';
      const func = node.init as t.ArrowFunctionExpression | t.FunctionExpression;

      const code = generate(node).code;
      const lines = code.split('\n');
      const lineCount = lines.length;

      const startLine = node.loc?.start.line || 0;
      const endLine = node.loc?.end.line || startLine + lineCount;

      const params = extractParameters(func);
      const returnType = extractReturnType(func);
      const docComment = extractDocComment(node);
      const complexity = calculateCyclomaticComplexity(code);

      const metadata: CodeItemMetadata = {
        parameters: params,
        returnType,
        isAsync: func.async || false,
        isArrow: t.isArrowFunctionExpression(func),
        isExported: context.exports.has(name),
        docComment,
      };

      // Determine type
      let type: 'function' | 'component' | 'utility' = 'function';
      let confidence = 0.9;

      if (isReactComponent(name, code, params)) {
        type = 'component';
        confidence = 0.95;
      } else if (isUtilityFunction(name, code)) {
        type = 'utility';
      }

      return {
        id: randomUUID(),
        name,
        type,
        code,
        startLine,
        endLine,
        lineCount,
        complexity: getComplexityLevel(complexity, lineCount),
        metadata,
        confidence,
      };
    } catch (error) {
      logger.warn(`Failed to extract arrow/expression function: ${error}`);
      return null;
    }
  }

  /**
   * Extract class method
   */
  private static extractClassMethod(
    node: t.ClassMethod,
    _context: ASTAnalysisContext
  ): AnalyzedCodeItem | null {
    try {
      const name = t.isIdentifier(node.key)
        ? node.key.name
        : t.isStringLiteral(node.key)
          ? node.key.value
          : 'method';

      const code = generate(node).code;
      const lines = code.split('\n');
      const lineCount = lines.length;

      const startLine = node.loc?.start.line || 0;
      const endLine = node.loc?.end.line || startLine + lineCount;

      const params = extractParameters(node);
      const returnType = extractReturnType(node);
      const complexity = calculateCyclomaticComplexity(code);

      const metadata: CodeItemMetadata = {
        parameters: params,
        returnType,
        isAsync: node.async || false,
        isArrow: false,
        isExported: false,
      };

      return {
        id: randomUUID(),
        name,
        type: 'utility',
        code,
        startLine,
        endLine,
        lineCount,
        complexity: getComplexityLevel(complexity, lineCount),
        metadata,
        confidence: 0.85,
      };
    } catch (error) {
      logger.warn(`Failed to extract class method: ${error}`);
      return null;
    }
  }

  /**
   * Extract constant
   */
  private static extractConstant(
    node: t.VariableDeclarator,
    context: ASTAnalysisContext
  ): AnalyzedCodeItem | null {
    try {
      if (!t.isIdentifier(node.id)) return null;

      const name = node.id.name;
      const code = generate(node).code;

      // Only extract if it looks like a constant (all uppercase or is exported)
      if (!/^[A-Z_]+$/.test(name) && !context.exports.has(name)) {
        return null;
      }

      const startLine = node.loc?.start.line || 0;
      const endLine = node.loc?.end.line || startLine + 1;

      const type = extractVariableType(node);

      const metadata: CodeItemMetadata = {
        parameters: [],
        returnType: type,
        isAsync: false,
        isArrow: false,
        isExported: context.exports.has(name),
      };

      return {
        id: randomUUID(),
        name,
        type: 'constant',
        code,
        startLine,
        endLine,
        lineCount: 1,
        complexity: 'simple',
        metadata,
        confidence: 0.95,
      };
    } catch (error) {
      logger.warn(`Failed to extract constant: ${error}`);
      return null;
    }
  }

  /**
   * Filter extraction results
   * Removes low-confidence or duplicate items
   */
  static filterResults(items: AnalyzedCodeItem[]): AnalyzedCodeItem[] {
    // Remove duplicates by name
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.name)) {
        return false;
      }
      seen.add(item.name);
      return item.confidence >= 0.7; // Keep items with 70%+ confidence
    });
  }

  /**
   * Sort results by relevance
   */
  static sortByRelevance(items: AnalyzedCodeItem[]): AnalyzedCodeItem[] {
    return items.sort((a, b) => {
      // Prioritize by type (components > functions > utilities > constants)
      const typeScore = {
        component: 4,
        function: 3,
        utility: 2,
        constant: 1,
      };

      if (typeScore[a.type as keyof typeof typeScore] !== 
          typeScore[b.type as keyof typeof typeScore]) {
        return typeScore[b.type as keyof typeof typeScore] - 
               typeScore[a.type as keyof typeof typeScore];
      }

      // Then by confidence
      if (a.confidence !== b.confidence) {
        return b.confidence - a.confidence;
      }

      // Then by line number
      return a.startLine - b.startLine;
    });
  }
}

export default CodeExtractorService;