/**
 * Code highlight component tests
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CodeHighlight from './CodeHighlight';

// Mock the clipboard so the test doesn't crash in JSDOM
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  },
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CodeHighlight', () => {
  const testCode = `function greet(name) {
  console.log('Hello, ' + name);
}`;

  it('should render code with syntax highlighting', () => {
    render(<CodeHighlight code={testCode} language="javascript" />);

    // Syntax highlighters split code into multiple spans, so this checks the document body text content.
    expect(document.body.textContent).toContain('function greet');
  });

  it('should have copy button that copies code', async () => {
    render(<CodeHighlight code={testCode} language="javascript" />);

    const copyButton = screen.getByRole('button');
    fireEvent.click(copyButton);

    // Uses findByText because the copy function is asynchronous
    expect(await screen.findByText(/Copied!/)).toBeInTheDocument();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testCode);
  });

  it('should support different languages', () => {
    const { rerender } = render(
      <CodeHighlight code={testCode} language="javascript" />
    );

    expect(document.body.textContent).toContain('function greet');

    rerender(<CodeHighlight code={testCode} language="typescript" />);

    expect(document.body.textContent).toContain('function greet');
  });
});