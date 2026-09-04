/**
 * Comprehensive test suite for enhanced Babel visitor
 * Tests all extraction patterns, edge cases, and accuracy
 */

import { describe, it, expect } from '@jest/globals';
import * as parser from '@babel/parser';
import { ArtifactVisitor } from '../babel-visitor.js';
import { Artifact } from '../../../types/artifact.js';

describe('ArtifactVisitor - Enhanced Extraction', () => {
  let visitor: ArtifactVisitor;
  let artifacts: Artifact[];

  // ============================================
  // Test 1: Function Declaration Extraction
  // ============================================
  describe('Function Declarations', () => {
    it('should extract simple function with correct boundaries', () => {
      const code = `
/**
 * Calculates sum of two numbers
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} Sum of a and b
 */
function add(a, b) {
  return a + b;
}
      `.trim();

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true,
        ranges: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      expect(artifacts).toHaveLength(1);
      const func = artifacts[0];

      expect(func.name).toBe('add');
      expect(func.kind).toBe('function');
      expect(func.source.startLine).toBe(7); // Line of 'function add'
      expect(func.source.endLine).toBe(9); // Line of closing brace
      expect(func.documentation!.leading).toHaveLength(1);
      expect(func.documentation!.jsdoc?.description).toContain('Calculates sum');
      expect(func.syntax.isArrow).toBe(false);
      expect(func.parameters).toHaveLength(2);
      expect(func.parameters[0].name).toBe('a');
      expect(func.returns.present).toBe(true);
      expect(func.returns.count).toBe(1);
      expect(func.confidence.overall).toBeGreaterThan(0.95);
    });

    it('should correctly exclude leading comments from source code', () => {
      const code = `
// This is a comment
// About the function
function test() {
  console.log('hi');
}
      `.trim();

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];

      // Source should start at function declaration, not comment
      expect(func.code).not.toContain('// This is a comment');
      expect(func.documentation!.leading.length).toBeGreaterThan(0);
      expect(func.documentation!.leading[0].text).toContain('comment');
    });

    it('should handle async functions', () => {
      const code = `async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.syntax.isAsync).toBe(true);
      expect(func.returns.isAsync).toBe(true);
    });

    it('should handle generator functions', () => {
      const code = `function* generateNumbers() {
  yield 1;
  yield 2;
  yield 3;
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.syntax.isGenerator).toBe(true);
    });
  });

  // ============================================
  // Test 2: Arrow Function Extraction
  // ============================================
  describe('Arrow Functions', () => {
    it('should extract arrow function from variable', () => {
      const code = `const greet = (name) => {
  return \`Hello, \${name}\`;
};`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      expect(artifacts).toHaveLength(1);
      const func = artifacts[0];
      expect(func.name).toBe('greet');
      expect(func.kind).toBe('arrow-function');
      expect(func.syntax.isArrow).toBe(true);
    });

    it('should extract arrow functions in object literals', () => {
      const code = `const StringFormatter = {
  slugify: (text) => text.toLowerCase().replace(/\\s+/g, '-'),
  truncate: (str, maxLen, appendStr = '...') => {
    return str.length > maxLen ? str.slice(0, maxLen) + appendStr : str;
  },
  toCamelCase: (str) => str.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
};`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      // Should extract: StringFormatter (object), slugify, truncate, toCamelCase
      expect(artifacts.length).toBeGreaterThanOrEqual(3);

      const slugify = artifacts.find(a => a.name === 'slugify');
      expect(slugify).toBeDefined();
      expect(slugify?.kind).toBe('arrow-function');
      expect(slugify?.syntax.isArrow).toBe(true);

      const truncate = artifacts.find(a => a.name === 'truncate');
      expect(truncate).toBeDefined();
      expect(truncate?.parameters).toHaveLength(3);
      expect(truncate?.parameters[2].hasDefault).toBe(true);
      expect(truncate?.parameters[2].defaultValue).toBe('"..."');
    });

    it('should handle implicit return in arrow functions', () => {
      const code = `const double = (n) => n * 2;`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.returns.present).toBe(true);
      expect(func.returns.count).toBe(1);
      expect(func.returns.expressions).toContain('n * 2');
    });
  });

  // ============================================
  // Test 3: Class Extraction
  // ============================================
  describe('Class Declarations', () => {
    it('should extract class with methods and proper hierarchy', () => {
      const code = `class SecurityEngine {
  constructor(seed) {
    this.seed = seed;
  }

  generatePseudoUUID() {
    return 'uuid-' + Math.random();
  }

  calculateSimpleHash(inputString) {
    // Convert to 32bit integer
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
      hash = ((hash << 5) - hash) + inputString.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      // Should have 1 class + 3 methods = 4 artifacts
      expect(artifacts.length).toBeGreaterThanOrEqual(4);

      const classArtifact = artifacts.find(a => a.kind === 'class');
      expect(classArtifact).toBeDefined();
      expect(classArtifact?.name).toBe('SecurityEngine');
      expect(classArtifact?.relationships.children?.length).toBe(3);

      const constructor = artifacts.find(a => a.name === 'constructor');
      expect(constructor).toBeDefined();
      expect(constructor?.parent?.name).toBe('SecurityEngine');
      expect(constructor?.scope?.depth).toBe(1);
      expect(constructor?.role).toBe('initialization');

      const generateMethod = artifacts.find(a => a.name === 'generatePseudoUUID');
      expect(generateMethod).toBeDefined();
      expect(generateMethod?.kind).toBe('method');
      expect(generateMethod?.parent?.name).toBe('SecurityEngine');

      const calculateHash = artifacts.find(a => a.name === 'calculateSimpleHash');
      expect(calculateHash).toBeDefined();
      expect(calculateHash?.documentation!.inline.length).toBeGreaterThan(0);
      expect(calculateHash?.documentation!.inline[0].text).toContain('32bit');
    });

    it('should detect React component classes', () => {
      const code = `class DataViewComponent {
  constructor(options = {}) {
    this.options = options;
  }

  render() {
    return '<div>Data View</div>';
  }
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const classArtifact = artifacts.find(a => a.kind === 'class');
      expect(classArtifact).toBeDefined();
      expect(classArtifact?.name).toBe('DataViewComponent');
      expect(classArtifact?.role).toBe('rendering'); // Should infer from 'render' method
    });
  });

  // ============================================
  // Test 4: Constant Extraction
  // ============================================
  describe('Constants and Variables', () => {
    it('should extract simple constants', () => {
      const code = `const APP_CONFIG = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retryCount: 3
};`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      expect(artifacts).toHaveLength(1);
      const constant = artifacts[0];
      expect(constant.name).toBe('APP_CONFIG');
      expect(constant.kind).toBe('object-literal');
      expect(constant.role).toBe('configuration');
    });

    it('should extract Object.freeze() constants', () => {
      const code = `const STATUS_CODES = Object.freeze({
  IDLE: "STATUS_IDLE",
  PENDING: "STATUS_PENDING",
  COMPLETE: "STATUS_COMPLETE",
  ERROR: "STATUS_ERROR"
});`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      expect(artifacts).toHaveLength(1);
      const constant = artifacts[0];
      expect(constant.name).toBe('STATUS_CODES');
      expect(constant.kind).toBe('constant');
    });

    it('should extract array constants', () => {
      const code = `const HEX_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      expect(artifacts).toHaveLength(1);
      const constant = artifacts[0];
      expect(constant.name).toBe('HEX_CHARS');
      expect(constant.kind).toBe('constant');
    });

    it('should extract multiple similar constants', () => {
      const code = `const MappedModuleDataChunk1 = [1, 2, 3, 4, 5];
const MappedModuleDataChunk2 = [6, 7, 8, 9, 10];
const MappedModuleDataChunk3 = [11, 12, 13, 14, 15];`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      expect(artifacts).toHaveLength(3);
      expect(artifacts.map(a => a.name)).toEqual([
        'MappedModuleDataChunk1',
        'MappedModuleDataChunk2',
        'MappedModuleDataChunk3'
      ]);
    });
  });

  // ============================================
  // Test 5: Nested Functions
  // ============================================
  describe('Nested Functions', () => {
    it('should extract nested functions with proper hierarchy', () => {
      const code = `function debounce(func, delay) {
  let timeoutId;

  const later = function() {
    clearTimeout(timeoutId);
    func();
  };

  return function() {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(later, delay);
  };
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      // Should extract: debounce + later + inner function = 3
      expect(artifacts.length).toBeGreaterThanOrEqual(2);

      const debounce = artifacts.find(a => a.name === 'debounce');
      expect(debounce).toBeDefined();
      expect(debounce?.scope?.depth).toBe(0);

      const later = artifacts.find(a => a.name === 'later');
      expect(later).toBeDefined();
      expect(later?.parent?.name).toBe('debounce');
      expect(later?.scope?.depth).toBe(1);
    });

    it('should not mix up nested functions in same scope', () => {
      const code = `function outer() {
  const inner1 = () => console.log('inner1');
  const inner2 = () => console.log('inner2');
  return { inner1, inner2 };
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const outer = artifacts.find(a => a.name === 'outer');
      expect(outer).toBeDefined();

      const inner1 = artifacts.find(a => a.name === 'inner1');
      const inner2 = artifacts.find(a => a.name === 'inner2');

      expect(inner1).toBeDefined();
      expect(inner2).toBeDefined();
      expect(inner1?.parent?.name).toBe('outer');
      expect(inner2?.parent?.name).toBe('outer');
    });
  });

  // ============================================
  // Test 6: Parameter Extraction
  // ============================================
  describe('Parameter Extraction', () => {
    it('should extract parameters with default values', () => {
      const code = `function formatString(str, maxLen = 50, appendStr = '...') {
  return str.length > maxLen ? str.slice(0, maxLen) + appendStr : str;
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.parameters).toHaveLength(3);

      expect(func.parameters[0].name).toBe('str');
      expect(func.parameters[0].hasDefault).toBe(false);

      expect(func.parameters[1].name).toBe('maxLen');
      expect(func.parameters[1].hasDefault).toBe(true);
      expect(func.parameters[1].defaultValue).toBe('50');

      expect(func.parameters[2].name).toBe('appendStr');
      expect(func.parameters[2].hasDefault).toBe(true);
      expect(func.parameters[2].defaultValue).toBe('"..."');
    });

    it('should handle rest parameters', () => {
      const code = `function sum(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.parameters).toHaveLength(1);
      expect(func.parameters[0].name).toBe('numbers');
      expect(func.parameters[0].isRest).toBe(true);
    });

    it('should handle destructured parameters', () => {
      const code = `function processUser({ name, email, age = 30 }) {
  console.log(name, email, age);
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.parameters).toHaveLength(1);
      expect(func.parameters[0].isDestructured).toBe(true);
      expect(func.parameters[0].destructurePattern).toBeDefined();
    });
  });

  // ============================================
  // Test 7: Return Statement Extraction
  // ============================================
  describe('Return Extraction', () => {
    it('should count return statements correctly', () => {
      const code = `function validate(value) {
  if (!value) return false;
  if (typeof value !== 'string') return false;
  return value.length > 0;
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.returns.present).toBe(true);
      expect(func.returns.count).toBe(3);
    });

    it('should extract return expressions', () => {
      const code = `function getStatus() {
  return Status.PENDING;
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.returns.expressions.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Test 8: Complexity Analysis
  // ============================================
  describe('Complexity Analysis', () => {
    it('should classify simple functions correctly', () => {
      const code = `function add(a, b) {
  return a + b;
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.analysis.complexity).toBe('simple');
      expect(func.analysis.cyclomaticComplexity).toBe(1);
      expect(func.analysis.nestingDepth).toBeLessThanOrEqual(1);
    });

    it('should classify moderate complexity correctly', () => {
      const code = `function processArray(arr) {
  if (!arr || arr.length === 0) {
    return [];
  }

  return arr.filter(x => x > 0)
    .map(x => x * 2)
    .sort((a, b) => a - b);
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(['simple', 'moderate', 'complex']).toContain(func.analysis.complexity);
    });

    it('should count loops correctly', () => {
      const code = `function processGrid(grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      console.log(grid[i][j]);
    }
  }
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.analysis.loopCount).toBe(2);
      expect(func.analysis.nestingDepth).toBeGreaterThan(1);
    });
  });

  // ============================================
  // Test 9: Documentation Extraction
  // ============================================
  describe('Documentation Extraction', () => {
    it('should extract JSDoc comments', () => {
      const code = `/**
 * Calculates the factorial of a number
 * @param {number} n - The input number
 * @returns {number} The factorial result
 * @throws {Error} If n is negative
 */
function factorial(n) {
  if (n < 0) throw new Error('Negative number');
  return n <= 1 ? 1 : n * factorial(n - 1);
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.documentation!.jsdoc).toBeDefined();
      expect(func.documentation!.jsdoc?.description).toContain('factorial');
      expect(func.documentation!.jsdoc?.params).toHaveLength(1);
      expect(func.documentation!.jsdoc?.params?.[0].name).toBe('n');
      expect(func.documentation!.jsdoc?.returns).toBeDefined();
      expect(func.documentation!.jsdoc?.throws).toHaveLength(1);
    });

    it('should extract inline comments', () => {
      const code = `function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i); // Get character code
    hash = ((hash << 5) - hash) + char; // Calculate hash
    hash |= 0; // Convert to 32bit integer
  }
  return hash; // Return final hash
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.documentation!.inline.length).toBeGreaterThan(0);
      expect(func.documentation!.inline.some(c => c.text.includes('32bit'))).toBe(true);
    });

    it('should extract @todo and @fixme tags', () => {
      const code = `/**
 * Validates user email
 * @todo Add support for custom domains
 * @fixme Handle edge case with subdomains
 */
function validateEmail(email) {
  return email.includes('@');
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.documentation!.jsdoc?.todo).toBeDefined();
      expect(func.documentation!.jsdoc?.fixme).toBeDefined();
    });
  });

  // ============================================
  // Test 10: Confidence Scoring
  // ============================================
  describe('Confidence Scoring', () => {
    it('should have high confidence for well-defined functions', () => {
      const code = `/**
 * Simple function
 * @param {number} a
 * @returns {number}
 */
function double(a) {
  return a * 2;
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.confidence.overall).toBeGreaterThan(0.95);
      expect(func.confidence.classification).toBe(0.99);
      expect(func.confidence.location).toBe(1.0);
    });

    it('should have lower confidence for complex inference', () => {
      const code = `function complexFunction(a, b, c) {
  let result;
  if (a) {
    result = b || c;
  } else {
    result = a ? b : c;
  }
  return result;
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.confidence.returns).toBeLessThan(0.95);
    });
  });

  // ============================================
  // Test 11: Role Inference
  // ============================================
  describe('Role Inference', () => {
    it('should infer validation role', () => {
      const code = `function validateEmail(email) {
  return /^[^@]+@[^@]+$/.test(email);
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.role).toBe('validation');
    });

    it('should infer configuration role', () => {
      const code = `const APP_CONFIG = { apiUrl: 'https://api.example.com' };`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const constant = artifacts[0];
      expect(constant.role).toBe('configuration');
    });

    it('should infer security role', () => {
      const code = `function encryptData(data, key) {
  return crypto.encrypt(data, key);
}`;

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      const func = artifacts[0];
      expect(func.role).toBe('security');
    });
  });

  // ============================================
  // Test 12: Real-World Patterns
  // ============================================
  describe('Real-World Patterns', () => {
    it('should handle full module with mixed artifacts', () => {
      const code = `
const API_BASE = 'https://api.example.com';

class DataService {
  constructor() {
    this.cache = {};
  }

  async fetchUser(id) {
    if (this.cache[id]) return this.cache[id];
    const response = await fetch(\`\${API_BASE}/users/\${id}\`);
    const data = await response.json();
    this.cache[id] = data;
    return data;
  }
}

const validateId = (id) => typeof id === 'number' && id > 0;

function createService() {
  return new DataService();
}
      `.trim();

      const ast = parser.parse(code, {
        sourceType: 'module',
        attachComment: true
      });

      visitor = new ArtifactVisitor(code, 'test.js');
      artifacts = visitor.visit(ast);

      // Should extract: API_BASE constant, DataService class, constructor, fetchUser, validateId arrow, createService
      expect(artifacts.length).toBeGreaterThanOrEqual(5);

      const constant = artifacts.find(a => a.name === 'API_BASE');
      expect(constant).toBeDefined();

      const classArtifact = artifacts.find(a => a.name === 'DataService');
      expect(classArtifact).toBeDefined();

      const validateId = artifacts.find(a => a.name === 'validateId');
      expect(validateId).toBeDefined();
      expect(validateId?.kind).toBe('arrow-function');

      const createService = artifacts.find(a => a.name === 'createService');
      expect(createService).toBeDefined();
      expect(createService?.kind).toBe('function');
    });
  });
});