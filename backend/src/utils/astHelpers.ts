/**
 * AST helper functions for Babel analysis
 */

import * as t from '@babel/types';

/**
 * Extract JSDoc comment from a node
 */
export function extractDocComment(node: any): string | undefined {
  if (!node.leadingComments) return undefined;

  const lastComment = node.leadingComments[node.leadingComments.length - 1];
  if (lastComment?.type === 'CommentBlock') {
    return lastComment.value.trim();
  }
  return undefined;
}

/**
 * Extract function/method parameters
 */
export function extractParameters(node: any): Array<{ name: string; type?: string; hasDefault: boolean }> {
  const params: Array<{ name: string; type?: string; hasDefault: boolean }> = [];

  if (t.isFunction(node)) {
    node.params.forEach((param: any) => {
      let name = '';

      if (t.isIdentifier(param)) {
        name = param.name;
      } else if (t.isAssignmentPattern(param)) {
        name = (param.left as any).name || '';
      } else if (t.isRestElement(param)) {
        name = `...${(param.argument as any).name || ''}`;
      } else if (t.isObjectPattern(param)) {
        name = '{destructured}';
      }

      params.push({
        name,
        type: (param as any).typeAnnotation?.typeAnnotation?.type,
        hasDefault: t.isAssignmentPattern(param),
      });
    });
  }

  return params;
}

/**
 * Extract return type annotation
 */
export function extractReturnType(node: any): string | undefined {
  if (!t.isFunction(node)) return undefined;

  if ((node as any).returnType?.typeAnnotation) {
    const annotation = (node as any).returnType.typeAnnotation;
    if (t.isIdentifier(annotation)) {
      return annotation.name;
    }
    if (t.isTSTypeReference(annotation)) {
      return (annotation.typeName as any).name || 'unknown';
    }
  }

  return undefined;
}

/**
 * Detect if function is React component
 */
export function isReactComponent(
  name: string,
  code: string,
  _params: Array<{ name: string }> = [] // Prefixed with _ to ignore unused warning
): boolean {
  // Component name starts with uppercase
  if (!name[0]?.match(/[A-Z]/)) return false;

  // Check for JSX in code
  if (/<[A-Z]|<[a-z]+\s|return\s*\(/.test(code)) {
    return true;
  }

  // Check for React.FC or similar patterns
  if (/React\.(FC|FunctionComponent)|JSX\.Element|ReactNode/.test(code)) {
    return true;
  }

  return false;
}

/**
 * Detect if function is a utility (not component, lowercase name)
 */
export function isUtilityFunction(name: string, _code: string): boolean { // Prefixed with _ to ignore unused warning
  // Utility functions start with lowercase
  if (name[0]?.match(/[A-Z]/)) return false;

  // Common utility patterns
  const utilityPatterns = [
    /^(get|set|is|has|check|validate|parse|format|convert|transform|calculate|compute)/,
    /^(utils_|helper_|tool_)/,
  ];

  return utilityPatterns.some((pattern) => pattern.test(name));
}

/**
 * Calculate cyclomatic complexity
 */
export function calculateCyclomaticComplexity(code: string): number {
  // Simple heuristic: count control flow statements
  const patterns = [
    /\bif\b/g,
    /\belse if\b/g,
    /\bswitch\b/g,
    /\bcase\b/g,
    /\bfor\b/g,
    /\bwhile\b/g,
    /\bcatch\b/g,
    /\s\?\s/g, // ternary operator
  ];

  let count = 1; // Base complexity
  patterns.forEach((pattern) => {
    const matches = code.match(pattern);
    count += matches ? matches.length : 0;
  });

  return count;
}

/**
 * Determine complexity level
 */
export function getComplexityLevel(
  cyclomaticComplexity: number,
  lineCount: number
): 'simple' | 'moderate' | 'complex' {
  if (cyclomaticComplexity <= 2 && lineCount <= 10) {
    return 'simple';
  }
  if (cyclomaticComplexity <= 5 && lineCount <= 30) {
    return 'moderate';
  }
  return 'complex';
}

/**
 * Extract variable type annotation
 */
export function extractVariableType(node: any): string | undefined {
  if (t.isVariableDeclarator(node) && (node.id as any)?.typeAnnotation) {
    const annotation = (node.id as any).typeAnnotation.typeAnnotation;
    if (t.isIdentifier(annotation)) {
      return annotation.name;
    }
    if (t.isStringTypeAnnotation(annotation)) {
      return 'string';
    }
    if (t.isNumberTypeAnnotation(annotation)) {
      return 'number';
    }
    if (t.isBooleanTypeAnnotation(annotation)) {
      return 'boolean';
    }
  }
  return undefined;
}