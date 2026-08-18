import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import ResultsDisplay from './ResultsDisplay';
import { Extraction } from '../../types';

// Wipe the fake browser clean after each test
afterEach(cleanup);

// Mock the Monaco Editor so it doesn't crash jsdom
vi.mock('@monaco-editor/react', () => ({
  default: () => <div data-testid="monaco-editor">Mocked Code Editor</div>,
}));

// Mock the Clipboard API so the "Copy" button doesn't throw errors
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Create fake data to test the filters
const mockExtraction: Extraction = {
  id: 'ext-123',
  userId: 'user-1',
  status: 'completed',
  createdAt: '2023-01-01',
  extractionResults: {
    functions: [
      { id: 'f1', name: 'calculateTotal', type: 'function', code: 'const calc = () => {}', lineCount: 5, complexity: 'O(1)', startLine: 1, endLine: 5 }
    ],
    components: [
      { id: 'c1', name: 'SubmitButton', type: 'component', code: 'export const btn = () => <button/>', lineCount: 10, complexity: 'O(1)', startLine: 6, endLine: 15 }
    ],
    utilities: [],
    constants: []
  }
};

describe('ResultsDisplay Component', () => {
  it('renders the processing state', () => {
    render(<ResultsDisplay extraction={{ ...mockExtraction, status: 'processing' }} />);
    expect(screen.getByText(/Processing your code/i)).toBeDefined();
  });

  it('renders the list of extracted items', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);
    expect(screen.getByText('calculateTotal')).toBeDefined();
    expect(screen.getByText('SubmitButton')).toBeDefined();
  });

  it('filters items by search term', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);
    
    // Type into the search bar
    const searchInput = screen.getByPlaceholderText(/Search components/i);
    fireEvent.change(searchInput, { target: { value: 'calculate' } });
    
    // The function should be visible, the component should disappear
    expect(screen.getByText('calculateTotal')).toBeDefined();
    expect(screen.queryByText('SubmitButton')).toBeNull(); 
  });

  it('filters items by category dropdown', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);
    
    // Change the dropdown
    const selectDropdown = screen.getByRole('combobox');
    fireEvent.change(selectDropdown, { target: { value: 'component' } });
    
    // The function should disappear, the component should be visible
    expect(screen.queryByText('calculateTotal')).toBeNull(); 
    expect(screen.getByText('SubmitButton')).toBeDefined();
  });

  it('expands the code preview to show the Monaco editor', () => {
    render(<ResultsDisplay extraction={mockExtraction} />);
    
    // Click the row to expand it
    const functionRow = screen.getByText('calculateTotal');
    fireEvent.click(functionRow);
    
    // A mocked Monaco editor should now be visible
    expect(screen.getByTestId('monaco-editor')).toBeDefined();
    // The complexity metadata should also appear
    expect(screen.getByText('Complexity:')).toBeDefined();
  });
});