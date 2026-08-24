import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeItemCard from './CodeItemCard';
import { CodeItem } from '../../types/extraction';

afterEach(cleanup);

describe('CodeItemCard Accessibility', () => {
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

  it('should have proper ARIA labels', () => {
    render(<CodeItemCard item={mockCodeItem} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded');
    expect(button).toHaveAttribute('aria-label');
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<CodeItemCard item={mockCodeItem} />);

    const button = screen.getByRole('button');
    
    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should announce expanded state to screen readers', async () => {
    const user = userEvent.setup();
    render(<CodeItemCard item={mockCodeItem} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('copy button should have descriptive label', async () => {
    const user = userEvent.setup();
    render(<CodeItemCard item={mockCodeItem} />);

    const expandButton = screen.getByRole('button');
    await user.click(expandButton);

    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    expect(copyButtons[0]).toHaveAttribute('aria-label');
  });
});