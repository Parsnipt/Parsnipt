import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ResultsDisplay from './ResultsDisplay';
import { Extraction, ExtractionResults } from '../../types/extraction';

afterEach(cleanup);

describe('ResultsDisplay', () => {
  const mockResults: ExtractionResults = {
    functions: [
      {
        id: '1',
        name: 'testFunc',
        type: 'function',
        code: 'function testFunc() {}',
        startLine: 1,
        endLine: 2,
        lineCount: 2,
        complexity: 'simple',
        confidence: 0.95,
        metadata: {
          parameters: [],
          returnType: 'void',
          isAsync: false,
          isArrow: false,
          isExported: false,
        },
      },
    ],
    components: [
      {
        id: '2',
        name: 'TestComponent',
        type: 'component',
        code: 'function TestComponent() { return <div>Test</div>; }',
        startLine: 4,
        endLine: 6,
        lineCount: 3,
        complexity: 'simple',
        confidence: 0.95,
        metadata: {
          parameters: [],
          isAsync: false,
          isArrow: false,
          isExported: false,
        },
      },
    ],
    utilities: [],
    constants: [],
    summary: {
      totalItems: 2,
      processingTimeMs: 150,
    },
  };

  const mockExtraction: Extraction = {
    id: '123',
    userId: 'user-123',
    fileName: 'test.js',
    fileSizeBytes: 1024,
    status: 'completed',
    extractionResults: mockResults,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should render results display with summary', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);

    expect(screen.getByText(/Extraction Results/i)).toBeInTheDocument();
    expect(screen.getByText(/test.js/)).toBeInTheDocument();
  });

  it('should show processing state', () => {
    const processingExtraction: Extraction = {
      ...mockExtraction,
      status: 'processing',
    };

    render(<ResultsDisplay extraction={processingExtraction} />);

    expect(screen.getByText(/Processing your code/i)).toBeInTheDocument();
  });

  it('should show error state', () => {
    const failedExtraction: Extraction = {
      ...mockExtraction,
      status: 'failed',
      error: 'Syntax error in code',
    };

    render(<ResultsDisplay extraction={failedExtraction} />);

    expect(screen.getByText(/Extraction Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Syntax error/)).toBeInTheDocument();
  });

  it('should filter results by type', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);

    const functionFilter = screen.getByRole('button', { name: /Functions/ });
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

    expect(screen.getByText(/No items found/i)).toBeInTheDocument();
  });

  it('should display summary statistics', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);

    const statElements = screen.getAllByText('1');
    expect(statElements[0]).toBeInTheDocument();
  });
});