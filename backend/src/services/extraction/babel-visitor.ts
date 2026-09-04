/**
 * Enhanced Babel visitor that traverses AST and extracts artifacts
 * with proper hierarchy, scope, and semantic information
 */
import _traverse, { NodePath } from '@babel/traverse';
import _generate from '@babel/generator';
import * as t from '@babel/types';
import { 
  Artifact, 
  ArtifactKind, 
  ArtifactRole, 
  Parameter,
  Documentation,
  JSDocBlock,
  ReturnInfo,
  AnalysisMetrics,
  ExportType,
  Visibility
} from '../../types/artifact.js';
import { generateUUID, sha256 } from '../../utils/crypto.js';

// Babel ESM/CJS interop fix to guarantee these are callable functions
const traverse = (typeof _traverse === 'function' ? _traverse : (_traverse as any).default) as any;
const generate = (typeof _generate === 'function' ? _generate : (_generate as any).default) as any;
interface Scope {
    depth: number;
    parentId?: string;
    parentName?: string;
    parentKind?: ArtifactKind;
  }

class ArtifactVisitor {
  private artifacts: Map<string, Artifact> = new Map();
  private code: string;
  private fileName: string;
  private currentScope: Scope = { depth: 0 };
  private visitedNodes = new Set<t.Node>();
  private scopeStack: Scope[] = [];

  constructor(code: string, fileName: string) {
    this.code = code;
    this.fileName = fileName;
  }

  /**
   * Main entry point: visit AST and extract all artifacts
   */
  visit(ast: t.File): Artifact[] {
    traverse(ast, {
      enter: (path: NodePath) => {
        this.visitNode(path);
      }
    });

    return Array.from(this.artifacts.values());
  }
  
  /**
   * Route nodes to appropriate handlers
   */
  private visitNode(path: NodePath): void {
    // Prevent double-processing
    if (this.visitedNodes.has(path.node)) return;
    this.visitedNodes.add(path.node);

    // Handle different node types
    if (t.isFunctionDeclaration(path.node)) {
      this.visitFunctionDeclaration(path as NodePath<t.FunctionDeclaration>);
    } else if (t.isVariableDeclaration(path.node)) {
      this.visitVariableDeclaration(path as NodePath<t.VariableDeclaration>);
    } else if (t.isClassDeclaration(path.node)) {
      this.visitClassDeclaration(path as NodePath<t.ClassDeclaration>);
    } else if (t.isFunctionExpression(path.node)) { 
      this.visitFunctionExpression(path as NodePath<t.FunctionExpression>);
    } else if (t.isArrowFunctionExpression(path.node)) { 
      this.visitArrowFunction(path as NodePath<t.ArrowFunctionExpression>);
    }
  }

  /**
   * Extract function declarations
   * Handles: function foo() {}
   */
  private visitFunctionDeclaration(path: NodePath<t.FunctionDeclaration>): void {
    const node = path.node;
    const id = generateUUID();
    const code = this.extractCode(node);

    const artifact: Artifact = {
      id,
      fingerprint: sha256(code),
      name: node.id?.name || 'anonymous',
      kind: 'function',
      role: this.inferRole(node.id?.name || 'anonymous', code),
      language: 'javascript',

      source: {
        file: this.fileName,
        startLine: node.loc?.start.line || 0,
        endLine: node.loc?.end.line || 0,
        lineCount: (node.loc?.end.line || 0) - (node.loc?.start.line || 0) + 1,
        startColumn: node.loc?.start.column,
        endColumn: node.loc?.end.column
      },

      documentation: this.extractDocumentation(path),

      parent: this.currentScope.parentId ? {
        id: this.currentScope.parentId,
        name: this.currentScope.parentName || 'unknown',
        kind: this.currentScope.parentKind || 'function'
      } : undefined,

      scope: {
        depth: this.currentScope.depth,
        parentId: this.currentScope.parentId,
        containedBy: this.currentScope.parentId
      },

      syntax: {
        isAsync: node.async || false,
        isArrow: false,
        isGenerator: node.generator || false,
        isExported: this.isExported(path),
        isImported: false,
        visibility: this.currentScope.depth === 0 ? 'module' : 'private',
        exportType: this.getExportType(path)
      },

      parameters: this.extractParameters(node.params),
      returns: this.extractReturns(path),

      analysis: this.analyzeComplexity(path),

      relationships: {
        calls: this.extractCalls(path),
        calledBy: [],
        references: [],
        referencedBy: [],
        imports: [],
        exports: [],
        children: []
      },

      confidence: {
        overall: 0.99,
        classification: 0.99,
        location: 1.0,
        parameters: 0.95,
        returns: 0.90,
        analysis: 0.85
      },

      code,
      createdAt: new Date().toISOString(),
      version: 1
    };

    this.artifacts.set(id, artifact);

    // Traverse children with updated scope
    const previousScope = this.currentScope;
    this.currentScope = {
      depth: previousScope.depth + 1,
      parentId: id,
      parentName: node.id?.name,
      parentKind: 'function'
    };
    this.scopeStack.push(this.currentScope);

    path.traverse({
      FunctionDeclaration: (childPath) => {
        if (!this.visitedNodes.has(childPath.node)) {
          this.visitedNodes.add(childPath.node);
          this.visitFunctionDeclaration(childPath as NodePath<t.FunctionDeclaration>);
        }
      },
      FunctionExpression: (childPath) => {
        if (!this.visitedNodes.has(childPath.node)) {
          this.visitedNodes.add(childPath.node);
          this.visitFunctionExpression(childPath as NodePath<t.FunctionExpression>);
        }
      },
      ArrowFunctionExpression: (childPath) => {
        if (!this.visitedNodes.has(childPath.node)) {
          this.visitedNodes.add(childPath.node);
          this.visitArrowFunction(childPath as NodePath<t.ArrowFunctionExpression>);
        }
      }
    });

    this.scopeStack.pop();
    this.currentScope = previousScope;
  }

  /**
   * Extract function expressions
   * Handles: const foo = function() {} or const obj = { foo: function() {} }
   */
  private visitFunctionExpression(path: NodePath<t.FunctionExpression>): void {
    const node = path.node;

    // Get name from parent context
    let name = node.id?.name || 'anonymous';

    // If inside variable declarator, use variable name
    if (t.isVariableDeclarator(path.parent)) {
      if (t.isIdentifier(path.parent.id)) {
        name = path.parent.id.name;
      }
    }
    
    // If inside object property, use property name
    if (t.isObjectProperty(path.parent)) {
      if (t.isIdentifier(path.parent.key)) {
        name = path.parent.key.name;
      }
    }

    const id = generateUUID();
    const code = this.extractCode(node);

    const artifact: Artifact = {
      id,
      fingerprint: sha256(code),
      name,
      kind: 'function',
      role: this.inferRole(name, code),
      language: 'javascript',

      source: {
        file: this.fileName,
        startLine: node.loc?.start.line || 0,
        endLine: node.loc?.end.line || 0,
        lineCount: (node.loc?.end.line || 0) - (node.loc?.start.line || 0) + 1
      },

      documentation: this.extractDocumentation(path),

      parent: this.currentScope.parentId ? {
        id: this.currentScope.parentId,
        name: this.currentScope.parentName || 'unknown',
        kind: this.currentScope.parentKind || 'variable'
      } : undefined,

      scope: {
        depth: this.currentScope.depth,
        parentId: this.currentScope.parentId
      },

      syntax: {
        isAsync: node.async || false,
        isArrow: false,
        isGenerator: node.generator || false,
        isExported: this.isExported(path),
        isImported: false,
        visibility: this.getVisibility(path),
        exportType: this.getExportType(path)
      },

      parameters: this.extractParameters(node.params),
      returns: this.extractReturns(path),

      analysis: this.analyzeComplexity(path),

      relationships: {
        calls: this.extractCalls(path),
        calledBy: [],
        references: [],
        referencedBy: [],
        imports: [],
        exports: [],
        children: []
      },

      confidence: {
        overall: 0.95,
        classification: 0.95,
        location: 0.99,
        parameters: 0.95,
        returns: 0.88,
        analysis: 0.85
      },

      code,
      createdAt: new Date().toISOString(),
      version: 1
    };

    this.artifacts.set(id, artifact);
  }

  /**
   * Extract arrow functions
   * Handles: const foo = () => {} or const obj = { foo: () => {} }
   */
  private visitArrowFunction(path: NodePath<t.ArrowFunctionExpression>): void {
    const node = path.node;

    let name = 'anonymous';
    
    // Try to get name from variable or property context
    if (t.isVariableDeclarator(path.parent)) {
      if (t.isIdentifier(path.parent.id)) {
        name = path.parent.id.name;
      }
    }

    if (t.isObjectProperty(path.parent)) {
      const prop = path.parent as t.ObjectProperty;
      if (t.isIdentifier(prop.key)) {
        name = prop.key.name;
      }
    }

    const id = generateUUID();
    const code = this.extractCode(node);

    const artifact: Artifact = {
      id,
      fingerprint: sha256(code),
      name,
      kind: 'arrow-function',
      role: this.inferRole(name, code),
      language: 'javascript',

      source: {
        file: this.fileName,
        startLine: node.loc?.start.line || 0,
        endLine: node.loc?.end.line || 0,
        lineCount: (node.loc?.end.line || 0) - (node.loc?.start.line || 0) + 1
      },

      documentation: this.extractDocumentation(path),

      parent: this.currentScope.parentId ? {
        id: this.currentScope.parentId,
        name: this.currentScope.parentName || 'unknown',
        kind: this.currentScope.parentKind || 'variable'
      } : undefined,

      scope: {
        depth: this.currentScope.depth,
        parentId: this.currentScope.parentId
      },

      syntax: {
        isAsync: node.async || false,
        isArrow: true,
        isGenerator: false,
        isExported: this.isExported(path),
        isImported: false,
        visibility: this.getVisibility(path),
        exportType: this.getExportType(path)
      },

      parameters: this.extractParameters(node.params),
      returns: this.extractReturns(path),

      analysis: this.analyzeComplexity(path),

      relationships: {
        calls: this.extractCalls(path),
        calledBy: [],
        references: [],
        referencedBy: [],
        imports: [],
        exports: [],
        children: []
      },

      confidence: {
        overall: 0.98,
        classification: 0.98,
        location: 1.0,
        parameters: 0.98,
        returns: 0.90,
        analysis: 0.85
      },

      code,
      createdAt: new Date().toISOString(),
      version: 1
    };

    this.artifacts.set(id, artifact);
  }

  /**
   * Extract class declarations
   * Handles: class Foo { constructor() {} method() {} }
   */
  private visitClassDeclaration(path: NodePath<t.ClassDeclaration>): void {
    const node = path.node;
    const classId = generateUUID();
    const code = this.extractCode(node);

    const classMethods: string[] = [];

    // Extract all methods
    node.body.body.forEach((method, index) => {
      if (t.isClassMethod(method) || t.isClassProperty(method)) {
        const methodName = t.isIdentifier(method.key) ? method.key.name : `method_${index}`;
        const methodId = generateUUID();
        classMethods.push(methodId);

        const methodKind = t.isClassMethod(method) && method.kind === 'constructor' ? 'constructor' : 'method';
        const methodCode = this.extractCode(method);

        const methodArtifact: Artifact = {
          id: methodId,
          fingerprint: sha256(methodCode),
          name: methodName,
          kind: methodKind === 'constructor' ? 'function' : 'method',
          role: methodKind === 'constructor' ? 'initialization' : this.inferRole(methodName, methodCode),
          language: 'javascript',

          source: {
            file: this.fileName,
            startLine: method.loc?.start.line || 0,
            endLine: method.loc?.end.line || 0,
            lineCount: (method.loc?.end.line || 0) - (method.loc?.start.line || 0) + 1
          },

          documentation: this.extractDocumentationFromClassMethod(method),

          parent: {
            id: classId,
            name: node.id?.name || 'UnknownClass',
            kind: 'class'
          },

          scope: {
            depth: 1,
            parentId: classId,
            containedBy: classId
          },

          syntax: {
            isAsync: (method as t.ClassMethod).async || false,
            isArrow: false,
            isGenerator: (method as t.ClassMethod).generator || false,
            isExported: false,
            isImported: false,
            visibility: this.getMethodVisibility(method),
            exportType: 'none'
          },

          parameters: t.isClassMethod(method) ? this.extractParameters((method as t.ClassMethod).params) : [],
          returns: t.isClassMethod(method) ? this.extractReturns(path) : { present: false, count: 0, expressions: [], isAsync: false, isGenerator: false },

          analysis: t.isClassMethod(method) ? this.analyzeComplexity(path) : {
            complexity: 'simple',
            cyclomaticComplexity: 1,
            nestingDepth: 1,
            branchCount: 0,
            loopCount: 0,
            callCount: 0,
            externalDependencies: 0,
            documentationCoverage: 0
          },

          relationships: {
            calls: t.isClassMethod(method) ? this.extractCalls(path) : [],
            calledBy: [],
            references: [],
            referencedBy: [],
            imports: [],
            exports: [],
            children: []
          },

          confidence: {
            overall: 0.98,
            classification: 0.99,
            location: 1.0,
            parameters: 0.98,
            returns: 0.85,
            analysis: 0.80
          },

          code: methodCode,
          createdAt: new Date().toISOString(),
          version: 1
        };

        this.artifacts.set(methodId, methodArtifact);
      }
    });

    // Create class artifact
    const classArtifact: Artifact = {
      id: classId,
      fingerprint: sha256(code),
      name: node.id?.name || 'UnknownClass',
      kind: 'class',
      role: this.inferRole(node.id?.name || 'UnknownClass', code),
      language: 'javascript',

      source: {
        file: this.fileName,
        startLine: node.loc?.start.line || 0,
        endLine: node.loc?.end.line || 0,
        lineCount: (node.loc?.end.line || 0) - (node.loc?.start.line || 0) + 1
      },

      documentation: this.extractDocumentation(path),

      scope: {
        depth: 0,
        parentId: undefined
      },

      syntax: {
        isAsync: false,
        isArrow: false,
        isGenerator: false,
        isExported: this.isExported(path),
        isImported: false,
        visibility: 'module',
        exportType: this.getExportType(path)
      },

      parameters: [],
      returns: { present: false, count: 0, expressions: [], isAsync: false, isGenerator: false },

      analysis: {
        complexity: 'simple',
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
        children: classMethods
      },

      confidence: {
        overall: 0.99,
        classification: 0.99,
        location: 1.0,
        parameters: 1.0,
        returns: 1.0,
        analysis: 0.85
      },

      code,
      createdAt: new Date().toISOString(),
      version: 1
    };

    this.artifacts.set(classId, classArtifact);
  }

  /**
   * Extract variable declarations (constants and variables)
   * Handles: const FOO = {...}, const status = Object.freeze({...})
   */
  private visitVariableDeclaration(path: NodePath<t.VariableDeclaration>): void {
    const node = path.node;

    node.declarations.forEach((decl) => {
      if (!t.isIdentifier(decl.id)) return;

      const name = decl.id.name;
      const id = generateUUID();

      // Skip if it's a function expression (handled separately)
      if (decl.init && (t.isFunctionExpression(decl.init) || t.isArrowFunctionExpression(decl.init))) {
        return;
      }

      // Determine if this should be extracted as a constant/variable
      if (this.shouldExtractVariable(decl, name)) {
        const code = this.extractCode(decl);

        const artifact: Artifact = {
          id,
          fingerprint: sha256(code),
          name,
          kind: this.getVariableKind(decl),
          role: this.inferRole(name, code),
          language: 'javascript',

          source: {
            file: this.fileName,
            startLine: decl.loc?.start.line || 0,
            endLine: decl.loc?.end.line || 0,
            lineCount: (decl.loc?.end.line || 0) - (decl.loc?.start.line || 0) + 1
          },

          documentation: this.extractDocumentation(path),

          parent: this.currentScope.parentId ? {
            id: this.currentScope.parentId,
            name: this.currentScope.parentName || 'unknown',
            kind: this.currentScope.parentKind || 'function'
          } : undefined,

          scope: {
            depth: this.currentScope.depth,
            parentId: this.currentScope.parentId
          },

          syntax: {
            isAsync: false,
            isArrow: false,
            isGenerator: false,
            isExported: this.isExported(path),
            isImported: false,
            visibility: this.getVisibility(path),
            exportType: this.getExportType(path)
          },

          parameters: [],
          returns: { present: false, count: 0, expressions: [], isAsync: false, isGenerator: false },

          analysis: {
            complexity: 'simple',
            cyclomaticComplexity: 1,
            nestingDepth: this.currentScope.depth,
            branchCount: 0,
            loopCount: 0,
            callCount: 0,
            externalDependencies: this.countExternalDependencies(decl.init),
            documentationCoverage: this.calculateDocCoverage(path)
          },

          relationships: {
            calls: [],
            calledBy: [],
            references: [],
            referencedBy: [],
            imports: this.extractImports(decl.init),
            exports: [],
            children: []
          },

          confidence: {
            overall: 0.95,
            classification: 0.95,
            location: 1.0,
            parameters: 1.0,
            returns: 1.0,
            analysis: 0.85
          },

          code,
          createdAt: new Date().toISOString(),
          version: 1
        };

        this.artifacts.set(id, artifact);
      }
    });
  }

  /**
   * Extract documentation from various sources
   */
  private extractDocumentation(path: NodePath): Documentation {
    const documentation: Documentation = {
      leading: [],
      inline: [],
      trailing: [],
      jsdoc: undefined
    };

    const node = path.node;

    // Look for leading comments
    if (node.leadingComments) {
      node.leadingComments.forEach((comment) => {
        if (comment.type === 'CommentBlock') {
          documentation.leading.push({
            startLine: comment.loc?.start.line || 0,
            endLine: comment.loc?.end.line || 0,
            text: comment.value,
            type: 'block'
          });

          // Parse JSDoc if present
          if (comment.value.includes('@')) {
            documentation.jsdoc = this.parseJSDoc(comment.value);
          }
        } else if (comment.type === 'CommentLine') {
          documentation.leading.push({
            startLine: comment.loc?.start.line || 0,
            endLine: comment.loc?.end.line || 0,
            text: comment.value,
            type: 'line'
          });
        }
      });
    }

    // Look for inline comments
    if (node.innerComments) {
      node.innerComments.forEach((comment) => {
        documentation.inline.push({
          line: comment.loc?.start.line || 0,
          column: comment.loc?.start.column || 0,
          text: comment.value
        });
      });
    }

    // Look for trailing comments
    if (node.trailingComments) {
      node.trailingComments.forEach((comment) => {
        documentation.trailing.push({
          startLine: comment.loc?.start.line || 0,
          endLine: comment.loc?.end.line || 0,
          text: comment.value,
          type: comment.type === 'CommentBlock' ? 'block' : 'line'
        });
      });
    }

    // Look for inline comments buried in the child nodes
    path.traverse({
      enter: (childPath) => {
        const childNode = childPath.node as any;
        if (childNode.trailingComments) {
          childNode.trailingComments.forEach((comment: any) => {
            if (comment.type === 'CommentLine') {
              documentation.inline.push({
                line: comment.loc?.start.line || 0,
                column: comment.loc?.start.column || 0,
                text: comment.value
              });
            }
          });
        }
      }
    });

    return documentation;
  }

  /**
   * Parse JSDoc block
   */
  private parseJSDoc(text: string): JSDocBlock | undefined{
    const jsdoc: JSDocBlock = {};

    // Extract description
    const descMatch = text.match(/^([\s\S]*?)(?=@|$)/);
    if (descMatch) {
      jsdoc.description = descMatch[1]
        .replace(/^\s*\*\s?/gm, '')
        .trim();
    }

    // Extract @param
    const paramMatches = text.matchAll(/@param\s+(?:\{([^}]+)\}\s+)?(\w+)\s*(?:-\s*(.*))?/g);
    jsdoc.params = Array.from(paramMatches).map((match) => ({
      name: match[2],
      type: match[1],
      description: match[3]?.trim()
    }));

    // Extract @returns
    const returnMatch = text.match(/@returns?\s+(?:\{([^}]+)\})?\s*([\s\S]*?)(?=@|$)/);
    if (returnMatch) {
      jsdoc.returns = {
        type: returnMatch[1],
        description: returnMatch[2]?.trim()
      };
    }

    // Extract @throws
    const throwMatches = text.matchAll(/@throws\s+(?:\{([^}]+)\})?\s*([\s\S]*?)(?=@|$)/g);
    jsdoc.throws = Array.from(throwMatches).map((match) => ({
      type: match[1] || 'Error',
      description: match[2]?.trim()
    }));

    // Extract @deprecated
    jsdoc.deprecated = /@deprecated/.test(text);

    // Extract @example
    const exampleMatch = text.match(/@example\s*([\s\S]*?)(?=@|$)/);
    if (exampleMatch) {
      jsdoc.example = exampleMatch[1].trim();
    }

    // Extract @todo, @fixme, @see
    const todoMatches = text.matchAll(/@todo\s+(.*?)(?=\n|@)/g);
    jsdoc.todo = Array.from(todoMatches).map((m) => m[1].trim());

    const fixmeMatches = text.matchAll(/@fixme\s+(.*?)(?=\n|@)/g);
    if (fixmeMatches) {
      jsdoc.fixme = Array.from(fixmeMatches).map((m) => m[1].trim());
    }

    const seeMatches = text.matchAll(/@see\s+(.*?)(?=\n|@)/g);
    jsdoc.see = Array.from(seeMatches).map((m) => m[1].trim());

    return Object.keys(jsdoc).length > 0 ? jsdoc : undefined;
  }

  /**
   * Extract parameter information
   */
  private extractParameters(params: any[]): Parameter[] {
    return params.map((param, index) => {
      let name = 'unknown';
      let hasDefault = false;
      let defaultValue: string | undefined;
      let isRest = false;
      let isDestructured = false;
      let destructurePattern: string | undefined;

      if (t.isIdentifier(param)) {
        name = param.name;
      } else if (t.isRestElement(param)) {
        isRest = true;
        if (t.isIdentifier(param.argument)) {
          name = param.argument.name;
        }
      } else if (t.isAssignmentPattern(param)) {
        hasDefault = true;
        if (t.isIdentifier(param.left)) {
          name = param.left.name;
        }
        // Extract default value as string
        defaultValue = this.extractNodeAsString(param.right);
      } else if (t.isObjectPattern(param)) {
        isDestructured = true;
        destructurePattern = this.extractNodeAsString(param);
      } else if (t.isArrayPattern(param)) {
        isDestructured = true;
        destructurePattern = this.extractNodeAsString(param);
      }

      return {
        name,
        position: index,
        hasDefault,
        defaultValue,
        isRest,
        isDestructured,
        destructurePattern,
        typeAnnotation: undefined
      };
    });
  }

  /**
   * Extract return statements
   */
  private extractReturns(path: NodePath): ReturnInfo {
    const returns: ReturnInfo = {
      present: false,
      count: 0,
      expressions: [],
      isAsync: false,
      isGenerator: false
    };

    let returnCount = 0;
    const expressions: string[] = [];

    path.traverse({
      ReturnStatement: (retPath) => {
        returns.present = true;
        returnCount++;

        if (retPath.node.argument) {
          const expr = this.extractNodeAsString(retPath.node.argument);
          expressions.push(expr);
        }
      }
    });

    // Check for async/generator
    const node = path.node as any;
    if (node.async) returns.isAsync = true;
    if (node.generator) returns.isGenerator = true;

    // Arrow functions with expression body (implicit return)
    if (t.isArrowFunctionExpression(node) && !t.isBlockStatement(node.body)) {
      returns.present = true;
      returns.count = 1;
      returns.expressions = [this.extractNodeAsString(node.body)];
    } else {
      returns.count = returnCount;
      returns.expressions = expressions;
    }

    return returns;
  }

  /**
   * Analyze complexity metrics
   */
  private analyzeComplexity(path: NodePath): AnalysisMetrics {
    const metrics: AnalysisMetrics = {
      complexity: 'simple',
      cyclomaticComplexity: 1,
      nestingDepth: 0,
      branchCount: 0,
      loopCount: 0,
      callCount: 0,
      externalDependencies: 0,
      documentationCoverage: 0
    };

    let maxDepth = 0;
    let currentDepth = 0;
    let branchCount = 0;
    let loopCount = 0;
    let callCount = 0;

    path.traverse({
      IfStatement: () => {
        branchCount++;
        metrics.cyclomaticComplexity++;
      },
      SwitchCase: () => {
        branchCount++;
        metrics.cyclomaticComplexity++;
      },
      WhileStatement: () => {
        loopCount++;
        metrics.cyclomaticComplexity++;
      },
      ForStatement: () => {
        loopCount++;
        metrics.cyclomaticComplexity++;
      },
      ForInStatement: () => {
        loopCount++;
        metrics.cyclomaticComplexity++;
      },
      ForOfStatement: () => {
        loopCount++;
        metrics.cyclomaticComplexity++;
      },
      CallExpression: () => {
        callCount++;
      },
      BlockStatement: (blockPath) => {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
        blockPath.traverse({
          BlockStatement: () => {
            currentDepth++;
            maxDepth = Math.max(maxDepth, currentDepth);
          }
        });
        currentDepth--;
      }
    });

    metrics.nestingDepth = maxDepth;
    metrics.branchCount = branchCount;
    metrics.loopCount = loopCount;
    metrics.callCount = callCount;

    // Classify complexity
    if (metrics.cyclomaticComplexity <= 3 && metrics.nestingDepth <= 2) {
      metrics.complexity = 'simple';
    } else if (metrics.cyclomaticComplexity <= 7 && metrics.nestingDepth <= 4) {
      metrics.complexity = 'moderate';
    } else {
      metrics.complexity = 'complex';
    }

    return metrics;
  }

  /**
   * Extract function calls
   */
  private extractCalls(path: NodePath): string[] {
    const calls: string[] = [];

    path.traverse({
      CallExpression: (callPath) => {
        if (t.isIdentifier(callPath.node.callee)) {
          calls.push(callPath.node.callee.name);
        } else if (t.isMemberExpression(callPath.node.callee)) {
          const memberExpr = this.extractNodeAsString(callPath.node.callee);
          calls.push(memberExpr);
        }
      }
    });

    // Remove duplicates
    return [...new Set(calls)];
  }

  /**
   * Utility: Extract node as string
   */
  private extractNodeAsString(node: t.Node | null | undefined): string {
    if (!node) return '';

    if (t.isIdentifier(node)) {
      return node.name;
    }

    if (t.isStringLiteral(node)) {
      return `"${node.value}"`;
    }

    if (t.isNumericLiteral(node)) {
      return node.value.toString();
    }

    if (t.isBooleanLiteral(node)) {
      return node.value.toString();
    }

    if (t.isObjectExpression(node)) {
      return '{...}';
    }

    if (t.isArrayExpression(node)) {
      return '[...]';
    }

    if (t.isFunctionExpression(node) || t.isArrowFunctionExpression(node)) {
      return '() => {...}';
    }

    if (t.isCallExpression(node)) {
      const callee = this.extractNodeAsString(node.callee);
      return `${callee}()`;
    }

    return generate(node as t.Node, { comments: false }).code;
  }

  /**
   * Utility: Extract raw code from AST node
   */
  private extractCode(node: t.Node): string {
    
    return generate(node, { comments: false }).code;
  }

  /**
   * Utility: Check if Parsnipt should extract variable
   */
  private shouldExtractVariable(decl: t.VariableDeclarator, _name: string): boolean {
    // Extract if:
    // It's a const (immutable)
    // It's uppercase (likely a constant)
    // It has a non-function initializer

    if (!decl.init) return false;

    // Skip function expressions (handled separately)
    if (t.isFunctionExpression(decl.init) || t.isArrowFunctionExpression(decl.init)) {
      return false;
    }

    // Extract Object.freeze() constants
    if (t.isCallExpression(decl.init)) {
      if (t.isMemberExpression(decl.init.callee)) {
        const memberExpr = decl.init.callee as t.MemberExpression;
        if (t.isIdentifier(memberExpr.object) && memberExpr.object.name === 'Object') {
          if (t.isIdentifier(memberExpr.property) && memberExpr.property.name === 'freeze') {
            return true;
          }
        }
      }
    }

    // Extract object literals
    if (t.isObjectExpression(decl.init)) {
      return true;
    }

    // Extract array literals
    if (t.isArrayExpression(decl.init)) {
      return true;
    }

    // Extract primitive constants
    if (t.isStringLiteral(decl.init) || t.isNumericLiteral(decl.init) || t.isBooleanLiteral(decl.init)) {
      return true;
    }

    return false;
  }

  /**
   * Utility: Determine variable kind
   */
  private getVariableKind(decl: t.VariableDeclarator): ArtifactKind {
    if (!decl.init) return 'variable';

    if (t.isObjectExpression(decl.init)) return 'object-literal';
    if (t.isArrayExpression(decl.init)) return 'constant';

    return 'constant';
  }

  /**
   * Utility: Infer role from name and code
   */
  private inferRole(name: string, code: string): ArtifactRole {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('component')) {
      return 'rendering';
    }
    if (lowerName.includes('validate') || lowerName.includes('check') || lowerName.includes('is')) {
      return 'validation';
    }
    if (lowerName.includes('config') || lowerName.includes('setting')) {
      return 'configuration';
    }
    if (lowerName.includes('render') || lowerName.includes('display')) {
      return 'rendering';
    }
    if (lowerName.includes('fetch') || lowerName.includes('request') || lowerName.includes('api')) {
      return 'networking';
    }
    if (lowerName.includes('encrypt') || lowerName.includes('hash') || lowerName.includes('secure')) {
      return 'security';
    }
    if (lowerName.includes('format') || lowerName.includes('parse') || lowerName.includes('transform')) {
      return 'data-processing';
    }
    if (lowerName.includes('test') || code.includes('assert') || code.includes('expect')) {
      return 'test';
    }
    if (lowerName.includes('init') || lowerName.includes('setup') || lowerName.includes('constructor')) {
      return 'initialization';
    }

    return 'utility';
  }

  /**
   * Utility: Check if exported
   */
  private isExported(path: NodePath): boolean {
    let node = path.node;

    // Check for export declaration
    if (t.isExportNamedDeclaration(path.parent as t.Node) ||
        t.isExportDefaultDeclaration(path.parent as t.Node)) {
      return true;
    }

    // Check for module.exports
    if (this.code.includes(`module.exports = ${(node as any).id?.name}`)) {
      return true;
    }

    return false;
  }

  /**
   * Utility: Get export type
   */
  private getExportType(path: NodePath): ExportType {
    if (t.isExportDefaultDeclaration(path.parent as t.Node)) {
      return 'default';
    }
    if (t.isExportNamedDeclaration(path.parent as t.Node)) {
      return 'named';
    }
    return 'none';
  }

  /**
   * Utility: Get visibility
   */
  private getVisibility(path: NodePath): Visibility {
    const node = path.node as any;
    const name = node.id?.name || node.name || '';

    // Private if starts with underscore
    if (name.startsWith('_')) return 'private';

    // Private if inside function
    if (this.currentScope.depth > 0) return 'private';

    return 'public';
  }

  /**
   * Utility: Get method visibility
   */
  private getMethodVisibility(_method: t.ClassMethod | t.ClassProperty): Visibility {
    // Check for private/protected keywords (TypeScript)
    return 'public';
  }

  /**
   * Utility: Count external dependencies
   */
  private countExternalDependencies(node: t.Node | null | undefined): number {
    let count = 0;
    if (!node) return 0;

    traverse(node, {
      noScope: true, 
      Identifier: () => {
        count++;
      }
    } as any);

    return Math.min(count, 10);
  }

  /**
   * Utility: Extract imports
   */
  private extractImports(node: t.Node | null | undefined): string[] {
    const imports: string[] = [];
    if (!node) return imports;

    traverse(node, {
      noScope: true, 
      Identifier: (path: NodePath<t.Identifier>) => {
        const name = path.node.name;
        if (!this.isBuiltIn(name)) {
          imports.push(name);
        }
      }
    } as any);

    return [...new Set(imports)];
  }

  /**
   * Utility: Check if identifier is built-in
   */
  private isBuiltIn(name: string): boolean {
    const builtIns = new Set([
      'undefined', 'null', 'true', 'false',
      'Object', 'Array', 'String', 'Number', 'Boolean', 'Date', 'Math', 'JSON',
      'console', 'window', 'document', 'navigator',
      'Error', 'RangeError', 'TypeError', 'SyntaxError',
      'Promise', 'async', 'await',
      'Symbol', 'Map', 'Set', 'WeakMap', 'WeakSet',
      'Proxy', 'Reflect', 'Intl'
    ]);

    return builtIns.has(name);
  }

  /**
   * Utility: Calculate documentation coverage
   */
  private calculateDocCoverage(path: NodePath): number {
    const node = path.node as any;
    if (!node.leadingComments || node.leadingComments.length === 0) {
      return 0;
    }

    let coverage = 0;
    const comment = node.leadingComments[0].value;

    if (comment.includes('description') || comment.includes('Description')) coverage += 25;
    if (comment.includes('@param') || comment.includes('parameters')) coverage += 25;
    if (comment.includes('@returns') || comment.includes('Returns')) coverage += 25;
    if (comment.includes('@throws') || comment.includes('Throws')) coverage += 25;

    return Math.min(coverage, 100);
  }

  /**
   * Utility: Extract documentation from class methods
   */
  private extractDocumentationFromClassMethod(method: t.ClassMethod | t.ClassProperty): Documentation {
    const documentation: Documentation = {
      leading: [],
      inline: [],
      trailing: [],
      jsdoc: undefined
    };

    if (method.leadingComments) {
      method.leadingComments.forEach((comment) => {
        if (comment.type === 'CommentBlock') {
          documentation.leading.push({
            startLine: comment.loc?.start.line || 0,
            endLine: comment.loc?.end.line || 0,
            text: comment.value,
            type: 'block'
          });
          if (comment.value.includes('@')) {
            documentation.jsdoc = this.parseJSDoc(comment.value);
          }
        } else if (comment.type === 'CommentLine') {
          documentation.leading.push({
            startLine: comment.loc?.start.line || 0,
            endLine: comment.loc?.end.line || 0,
            text: comment.value,
            type: 'line'
          });
        }
      });
    }

    if (method.innerComments) {
      method.innerComments.forEach((comment) => {
        documentation.inline.push({
          line: comment.loc?.start.line || 0,
          column: comment.loc?.start.column || 0,
          text: comment.value
        });
      });
    }

    // Capture comments inside the method body statements
    if (t.isClassMethod(method) && method.body && method.body.body) {
      method.body.body.forEach((stmt: any) => {
        if (stmt.leadingComments) {
          stmt.leadingComments.forEach((comment: any) => {
            if (comment.type === 'CommentLine') {
              documentation.inline.push({
                line: comment.loc?.start.line || 0,
                column: comment.loc?.start.column || 0,
                text: comment.value
              });
            }
          });
        }
      });
    }    
    return documentation;
  }
}

export { ArtifactVisitor };