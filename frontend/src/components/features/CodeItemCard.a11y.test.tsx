import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeItemCard from './CodeItemCard';
import { Artifact } from '../../types/extraction';

afterEach(cleanup);

describe('CodeItemCard Accessibility', () => {
  const mockArtifact: Artifact = {
    id: '1',
    name: 'greet',
    kind: 'function',
    role: 'data-processing',
    code: 'function greet(name) { return `Hello, ${name}`; }',
    fingerprint: 'hash1',
    source: { startLine: 1, endLine: 3 },
    parent: null,
    scopeDepth: 0,
    syntax: { isAsync: false, isGenerator: false, isArrow: false, visibility: 'public', exportType: 'none' },
    parameters: [{ name: 'name', type: 'string', hasDefault: false }],
    returns: { present: true, count: 1, expressions: ['`Hello, ${name}`'], isAsync: false, isGenerator: false },
    documentation: { leading: [], inline: [], trailing: [] },
    analysis: { complexity: 'low', cyclomaticComplexity: 1, nestingDepth: 1, branchCount: 0, loopCount: 0, callCount: 0, documentationCoverage: 0 },
    relationships: { calls: [], calledBy: [], references: [], referencedBy: [], imports: [], exports: [], children: [] },
    confidence: { overall: 0.95, classification: 1, location: 1, parameters: 1, returns: 1, analysis: 1 }
  };

  it('should have proper ARIA attributes', () => {
    render(<CodeItemCard item={mockArtifact} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded');
  });

  it('should be keyboard navigable', async () => {
    const user = userEvent.setup();
    render(<CodeItemCard item={mockArtifact} />);

    const button = screen.getByRole('button');
    
    await user.tab();
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('should announce expanded state to screen readers', async () => {
    const user = userEvent.setup();
    render(<CodeItemCard item={mockArtifact} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('copy button should be accessible', async () => {
    const user = userEvent.setup();
    render(<CodeItemCard item={mockArtifact} />);

    const expandButton = screen.getByRole('button');
    await user.click(expandButton);

    const copyButtons = screen.getAllByRole('button', { name: /copy/i });
    expect(copyButtons[0]).toBeInTheDocument();
  });
});