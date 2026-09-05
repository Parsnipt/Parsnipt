import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import CodeItemCard from './CodeItemCard';
import { Artifact } from '../../types/extraction';

afterEach(() => {
  cleanup();
  // Reset window size to default desktop after each test
  window.innerWidth = 1024;
});

describe('CodeItemCard Responsive Design', () => {
  const mockArtifact: Artifact = {
    id: '1',
    name: 'verylongfunctionnametotestresponsiveness',
    kind: 'function',
    role: 'utility',
    code: 'function test() {}',
    fingerprint: 'hash1',
    source: { startLine: 1, endLine: 2 },
    parent: null,
    scopeDepth: 0,
    syntax: { isAsync: false, isGenerator: false, isArrow: false, visibility: 'public', exportType: 'none' },
    parameters: [],
    returns: { present: true, count: 1, expressions: ['void'], isAsync: false, isGenerator: false },
    documentation: { leading: [], inline: [], trailing: [] },
    analysis: { complexity: 'low', cyclomaticComplexity: 1, nestingDepth: 1, branchCount: 0, loopCount: 0, callCount: 0, documentationCoverage: 1 },
    relationships: { calls: [], calledBy: [], references: [], referencedBy: [], imports: [], exports: [], children: [] },
    confidence: { overall: 0.95, classification: 1, location: 1, parameters: 1, returns: 1, analysis: 1 }
  };

  it('should render properly on mobile viewport', () => {
    // Set mobile viewport
    window.innerWidth = 375;
    window.dispatchEvent(new Event('resize'));

    const { container } = render(<CodeItemCard item={mockArtifact} />);

    // Check if card is visible and not cut off using the branded classes
    const card = container.querySelector('.border-brand-darkGreen\\/90') || container.firstElementChild;
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('rounded-xl');
  });

  it('should render properly on tablet viewport', () => {
    window.innerWidth = 768;
    window.dispatchEvent(new Event('resize'));

    render(<CodeItemCard item={mockArtifact} />);
    expect(screen.getByText('verylongfunctionnametotestresponsiveness')).toBeInTheDocument();
  });

  it('should render properly on desktop viewport', () => {
    window.innerWidth = 1920;
    window.dispatchEvent(new Event('resize'));

    render(<CodeItemCard item={mockArtifact} />);
    expect(screen.getByText('verylongfunctionnametotestresponsiveness')).toBeInTheDocument();
  });
});