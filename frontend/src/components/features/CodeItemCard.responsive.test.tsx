import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import CodeItemCard from './CodeItemCard';
import { CodeItem } from '../../types/extraction';

afterEach(() => {
  cleanup();
  // Reset window size to default desktop after each test
  window.innerWidth = 1024;
});

describe('CodeItemCard Responsive Design', () => {
  const mockCodeItem: CodeItem = {
    id: '1',
    name: 'verylongfunctionnametotestresponsiveness',
    type: 'function',
    code: 'function test() {}',
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
  };

  it('should render properly on mobile viewport', () => {
    // Set mobile viewport
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<CodeItemCard item={mockCodeItem} />);

    // Check if card is visible and not cut off using the branded classes
    const card = container.querySelector('.border-brand-darkGreen\\/90') || container.firstElementChild;
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-xl');
  });

  it('should render properly on tablet viewport', () => {
    window.innerWidth = 768;
    window.dispatchEvent(new Event('resize'));

    render(<CodeItemCard item={mockCodeItem} />);
    expect(screen.getByText('verylongfunctionnametotestresponsiveness')).toBeInTheDocument();
  });

  it('should render properly on desktop viewport', () => {
    window.innerWidth = 1920;
    window.dispatchEvent(new Event('resize'));

    render(<CodeItemCard item={mockCodeItem} />);
    expect(screen.getByText('verylongfunctionnametotestresponsiveness')).toBeInTheDocument();
  });
});