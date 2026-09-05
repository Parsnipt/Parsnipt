import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ResultsDisplay, { ExtractionProcessState } from './ResultsDisplay';
import { FileAnalysis } from '../../types/extraction';

afterEach(cleanup);

describe('ResultsDisplay', () => {
  const mockAnalysis: FileAnalysis = {
    schemaVersion: '1.5.0',
    generator: { name: 'Parsnipt', version: '1.5.0' },
    source: {
      fileName: 'test.js',
      language: 'javascript',
      lineCount: 10,
      characterCount: 200
    },
    processingTime: {
      parsingMs: 10,
      extractionMs: 20,
      analysisMs: 20,
      totalMs: 50
    },
    timestamp: new Date().toISOString(),
    summary: {
      totalArtifacts: 2,
      byKind: { function: 1, component: 1 },
      byRole: { utility: 1, rendering: 1 },
      overallConfidence: 0.95,
      documentationCoverage: 0.5
    },
    artifacts: [
      {
        id: '1',
        name: 'testFunc',
        kind: 'function',
        role: 'utility',
        code: 'function testFunc() {}',
        fingerprint: 'hash1',
        source: { startLine: 1, endLine: 2 },
        parent: null,
        scopeDepth: 0,
        syntax: { isAsync: false, isGenerator: false, isArrow: false, visibility: 'public', exportType: 'none' },
        parameters: [],
        returns: { present: true, count: 1, expressions: ['void'], isAsync: false, isGenerator: false },
        documentation: { leading: [], inline: [], trailing: [] },
        analysis: { complexity: 'low', cyclomaticComplexity: 1, nestingDepth: 1, branchCount: 0, loopCount: 0, callCount: 0, documentationCoverage: 0 },
        relationships: { calls: [], calledBy: [], references: [], referencedBy: [], imports: [], exports: [], children: [] },
        confidence: { overall: 0.95, classification: 1, location: 1, parameters: 1, returns: 1, analysis: 1 }
      },
      {
        id: '2',
        name: 'TestComponent',
        kind: 'component',
        role: 'rendering',
        code: 'function TestComponent() { return <div>Test</div>; }',
        fingerprint: 'hash2',
        source: { startLine: 4, endLine: 6 },
        parent: null,
        scopeDepth: 0,
        syntax: { isAsync: false, isGenerator: false, isArrow: false, visibility: 'public', exportType: 'none' },
        parameters: [],
        returns: { present: true, count: 1, expressions: ['JSX'], isAsync: false, isGenerator: false },
        documentation: { leading: [], inline: [], trailing: [] },
        analysis: { complexity: 'low', cyclomaticComplexity: 1, nestingDepth: 1, branchCount: 0, loopCount: 0, callCount: 0, documentationCoverage: 0 },
        relationships: { calls: [], calledBy: [], references: [], referencedBy: [], imports: [], exports: [], children: [] },
        confidence: { overall: 0.95, classification: 1, location: 1, parameters: 1, returns: 1, analysis: 1 }
      }
    ]
  };

  const mockExtraction: ExtractionProcessState = {
    status: 'completed',
    fileName: 'test.js',
    createdAt: new Date().toISOString(),
    fileAnalysis: mockAnalysis,
  };

  it('should render results display with summary', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);

    expect(screen.getByText(/Extraction Results/i)).toBeInTheDocument();
    expect(screen.getByText(/test.js/)).toBeInTheDocument();
  });

  it('should show processing state', () => {
    const processingExtraction: ExtractionProcessState = {
      ...mockExtraction,
      status: 'processing',
    };

    render(<ResultsDisplay extraction={processingExtraction} />);

    expect(screen.getByText(/Analyzing codebase structure/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    const failedExtraction: ExtractionProcessState = {
      ...mockExtraction,
      status: 'failed',
      error: 'Syntax error in code',
    };

    render(<ResultsDisplay extraction={failedExtraction} />);

    expect(screen.getByText(/Analysis Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Syntax error/)).toBeInTheDocument();
  });

  it('should filter results by type', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);

    const functionFilter = screen.getByRole('button', { name: /Functions & Methods/ });
    fireEvent.click(functionFilter);

    expect(screen.getByText('testFunc')).toBeInTheDocument();
  });

  it('should search code items', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);

    const searchInput = screen.getByPlaceholderText(/Search/);
    fireEvent.change(searchInput, { target: { value: 'TestComponent' } });

    const componentElements = screen.getAllByText('TestComponent');
    expect(componentElements[0]).toBeInTheDocument();
  });

  it('should show no results message when filtering returns nothing', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);

    const searchInput = screen.getByPlaceholderText(/Search/);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText(/No artifacts found/i)).toBeInTheDocument();
  });

  it('should display summary statistics', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);

    // Total artifacts is 2, functions is 1, components is 1
    const statElements = screen.getAllByText('2');
    expect(statElements.length).toBeGreaterThan(0);
  });
});