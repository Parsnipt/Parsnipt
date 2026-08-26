/**
 * Code extraction service using Babel AST
 * Analyzes source code and extracts functions, components, utilities, and constants
 */

import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
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
   * Helper to slice the RAW original source code AND capture accurate line numbers
   * This bypasses Babel's generator to prevent trailing comments from attaching
   * to the bottom of the code snippet.
   */
  private static extractRawCodeAndLines(path: any, sourceCode: string): { code: string, startLine: number, endLine: number, lineCount: number } | null {
    let targetNode = path.node;
    
    // If it's a VariableDeclarator, grab the parent 'const/let' wrapper 
    // to keep the code snippet valid, unless it's bundled with many declarations.
    if (t.isVariableDeclarator(path.node) && path.parent && t.isVariableDeclaration(path.parent)) {
      if (path.parent.declarations.length === 1) {
        targetNode = path.parent;
      }
    }

    // If it is exported, expand the snippet to include the 'export' keyword
    if (path.parent && (t.isExportNamedDeclaration(path.parent) || t.isExportDefaultDeclaration(path.parent))) {
      targetNode = path.parent;
    } else if (path.parentPath?.parent && t.isExportNamedDeclaration(path.parentPath.parent)) {
      targetNode = path.parentPath.parent;
    }

    let start = targetNode.start;
    const end = targetNode.end;
    let startLine = targetNode.loc?.start.line || 0;
    const endLine = targetNode.loc?.end.line || startLine;

    // Grab the top-most leading comment so it's included in the snippet
    if (targetNode.leadingComments && targetNode.leadingComments.length > 0) {
      const firstComment = targetNode.leadingComments[0];
      start = Math.min(start, firstComment.start);
      
      // Safely update the start line to match the top comment
      if (firstComment.loc?.start.line && firstComment.loc.start.line < startLine) {
        startLine = firstComment.loc.start.line;
      }
    }

    // Slice directly from the raw string
    if (typeof start === 'number' && typeof end === 'number') {
      const code = sourceCode.slice(start, end);
      const lineCount = startLine > 0 ? (endLine - startLine) + 1 : code.split('\n').length;
      return { code, startLine, endLine, lineCount };
    }

    return null;
  }

  /**
   * Traverse AST and extract code items
   */
  private static traverseAndExtract(ast: any, context: ASTAnalysisContext): void {
    traverse(ast, {
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

      FunctionDeclaration: (path: any) => {
        const item = this.extractFunctionDeclaration(path, context);
        if (item) context.items.push(item);
      },

      VariableDeclarator: (path: any) => {
        if (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init)) {
          const item = this.extractArrowOrExpressionFunction(path, context);
          if (item) context.items.push(item);
        } else if (
          t.isIdentifier(path.node.id) &&
          (t.isStringLiteral(path.node.init) ||
            t.isNumericLiteral(path.node.init) ||
            t.isBooleanLiteral(path.node.init) ||
            t.isArrayExpression(path.node.init) ||
            t.isObjectExpression(path.node.init))
        ) {
          const item = this.extractConstant(path, context);
          if (item) context.items.push(item);
        }
      },

      ClassMethod: (path: any) => {
        if (t.isClassMethod(path.node)) {
          const item = this.extractClassMethod(path, context);
          if (item) context.items.push(item);
        }
      },
    });
  }

  private static findDocComment(path: any, node: any): string | undefined {
    let comment = extractDocComment(node);
    if (!comment && path.parent) {
      comment = extractDocComment(path.parent);
    }
    if (!comment && path.parentPath?.parent) {
      comment = extractDocComment(path.parentPath.parent);
    }
    return comment;
  }

  private static extractFunctionDeclaration(
    path: any,
    context: ASTAnalysisContext
  ): AnalyzedCodeItem | null {
    try {
      const node = path.node as t.FunctionDeclaration;
      const name = node.id?.name || 'anonymous';
      
      // Extract code AND correctly synchronized line numbers
      const extraction = this.extractRawCodeAndLines(path, context.sourceCode);
      if (!extraction) return null;
      const { code, startLine, endLine, lineCount } = extraction;

      const params = extractParameters(node);
      const returnType = extractReturnType(node);
      const docComment = this.findDocComment(path, node);
      const complexity = calculateCyclomaticComplexity(code);

      const metadata: CodeItemMetadata = {
        parameters: params,
        returnType,
        isAsync: node.async || false,
        isArrow: false,
        isExported: context.exports.has(name),
        docComment,
      };

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

  private static extractArrowOrExpressionFunction(
    path: any,
    context: ASTAnalysisContext
  ): AnalyzedCodeItem | null {
    try {
      const node = path.node as t.VariableDeclarator;
      const name = t.isIdentifier(node.id) ? node.id.name : 'anonymous';
      const func = node.init as t.ArrowFunctionExpression | t.FunctionExpression;
      
      const extraction = this.extractRawCodeAndLines(path, context.sourceCode);
      if (!extraction) return null;
      const { code, startLine, endLine, lineCount } = extraction;

      const params = extractParameters(func);
      const returnType = extractReturnType(func);
      const docComment = this.findDocComment(path, node);
      const complexity = calculateCyclomaticComplexity(code);

      const metadata: CodeItemMetadata = {
        parameters: params,
        returnType,
        isAsync: func.async || false,
        isArrow: t.isArrowFunctionExpression(func),
        isExported: context.exports.has(name),
        docComment,
      };

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

  private static extractClassMethod(
    path: any,
    context: ASTAnalysisContext
  ): AnalyzedCodeItem | null {
    try {
      const node = path.node as t.ClassMethod;
      const name = t.isIdentifier(node.key)
        ? node.key.name
        : t.isStringLiteral(node.key)
          ? node.key.value
          : 'method';
      
      const extraction = this.extractRawCodeAndLines(path, context.sourceCode);
      if (!extraction) return null;
      const { code, startLine, endLine, lineCount } = extraction;

      const params = extractParameters(node);
      const returnType = extractReturnType(node);
      const docComment = this.findDocComment(path, node);
      const complexity = calculateCyclomaticComplexity(code);

      const metadata: CodeItemMetadata = {
        parameters: params,
        returnType,
        isAsync: node.async || false,
        isArrow: false,
        isExported: false,
        docComment,
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

  private static extractConstant(
    path: any,
    context: ASTAnalysisContext
  ): AnalyzedCodeItem | null {
    try {
      const node = path.node as t.VariableDeclarator;
      if (!t.isIdentifier(node.id)) return null;

      const name = node.id.name;
      
      if (!/^[A-Z_]+$/.test(name) && !context.exports.has(name)) {
        return null;
      }
      
      const extraction = this.extractRawCodeAndLines(path, context.sourceCode);
      if (!extraction) return null;
      const { code, startLine, endLine, lineCount } = extraction;

      const type = extractVariableType(node);
      const docComment = this.findDocComment(path, node);

      const metadata: CodeItemMetadata = {
        parameters: [],
        returnType: type,
        isAsync: false,
        isArrow: false,
        isExported: context.exports.has(name),
        docComment,
      };

      return {
        id: randomUUID(),
        name,
        type: 'constant',
        code,
        startLine,
        endLine,
        lineCount,
        complexity: 'simple',
        metadata,
        confidence: 0.95,
      };
    } catch (error) {
      logger.warn(`Failed to extract constant: ${error}`);
      return null;
    }
  }

  static filterResults(items: AnalyzedCodeItem[]): AnalyzedCodeItem[] {
    const seen = new Set<string>();
    return items.filter((item) => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return item.confidence >= 0.7;
    });
  }

  static sortByRelevance(items: AnalyzedCodeItem[]): AnalyzedCodeItem[] {
    return items.sort((a, b) => {
      const typeScore = { component: 4, function: 3, utility: 2, constant: 1 };

      if (typeScore[a.type as keyof typeof typeScore] !== 
          typeScore[b.type as keyof typeof typeScore]) {
        return typeScore[b.type as keyof typeof typeScore] - 
               typeScore[a.type as keyof typeof typeScore];
      }
      if (a.confidence !== b.confidence) return b.confidence - a.confidence;
      return a.startLine - b.startLine;
    });
  }
}

export default CodeExtractorService;