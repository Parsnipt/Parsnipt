import { describe, it, expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CodeItemCard from './CodeItemCard';
import { CodeItem } from '../../types/extraction';

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  },
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CodeItemCard', () => {
  const mockCodeItem: CodeItem = {
    id: '1',
    name: 'greet',
    type: 'function',
    code: 'function greet(name) { return `Hello, ${name}`; }',
    startLine: 1,
    endLine: 3,
    lineCount: 3,
    complexity: 'simple',
    confidence: 0.95,
    metadata: {
      parameters: [{ name: 'name', type: 'string', hasDefault: false }],
      returnType: 'string',
      isAsync: false,
      isArrow: false,
      isExported: false,
    },
  };

  it('should render code item card', () => {
    render(<CodeItemCard item={mockCodeItem} />);

    expect(screen.getByText('greet')).toBeInTheDocument();
    expect(screen.getByText(/Function/i)).toBeInTheDocument();
  });

  it('should show metadata on card', () => {
    render(<CodeItemCard item={mockCodeItem} />);

    expect(document.body.textContent).toContain('Lines:1-3');
    expect(document.body.textContent).toContain('Complexity:Simple');
    expect(document.body.textContent).toContain('Parameters:1');
  });

  it('should expand and show full code', () => {
    render(<CodeItemCard item={mockCodeItem} />);

    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    const codeHeaders = screen.getAllByText(/Code/);
    expect(codeHeaders.length).toBeGreaterThan(0);
    
    const parameterHeaders = screen.getAllByText(/Parameters/);
    expect(parameterHeaders.length).toBeGreaterThan(0);
  });

  it('should copy code to clipboard when button is clicked', async () => {
    render(<CodeItemCard item={mockCodeItem} />);

    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    const copyButtons = screen.getAllByRole('button', { name: /Copy/i });
    fireEvent.click(copyButtons[0]);

    const copiedText = await screen.findAllByText(/Copied!/);
    expect(copiedText[0]).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockCodeItem.code);
  });

  it('should show complexity badge with correct styling', () => {
    render(<CodeItemCard item={mockCodeItem} />);

    expect(screen.getByText(/Simple/i)).toBeInTheDocument();
  });

  it('should display parameters in expanded view', () => {
    render(<CodeItemCard item={mockCodeItem} />);

    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    const nameElements = screen.getAllByText('name');
    expect(nameElements[0]).toBeInTheDocument();
    
    const stringElements = screen.getAllByText('string');
    expect(stringElements[0]).toBeInTheDocument();
  });
});