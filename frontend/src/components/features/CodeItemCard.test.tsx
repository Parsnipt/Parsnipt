/**
 * CodeItemCard tests
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CodeItemCard from './CodeItemCard';
import { Artifact } from '../../types/extraction';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock clipboard for the copy button
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
  },
});

describe('CodeItemCard', () => {
  const mockArtifact: Artifact = {
    id: '1',
    name: 'calculateTotal',
    kind: 'function',
    role: 'data-processing',
    code: 'function calculateTotal(a, b) { return a + b; }',
    fingerprint: 'hash1',
    source: { startLine: 1, endLine: 3 },
    parent: null,
    scopeDepth: 0,
    syntax: { isAsync: false, isGenerator: false, isArrow: false, visibility: 'public', exportType: 'none' },
    parameters: [
      { name: 'a', type: 'number', hasDefault: false },
      { name: 'b', type: 'number', hasDefault: false }
    ],
    returns: { present: true, count: 1, expressions: ['a + b'], isAsync: false, isGenerator: false },
    documentation: {
      leading: [],
      inline: [],
      trailing: [],
      jsdoc: { description: 'Adds two numbers together.', tags: [] }
    },
    analysis: { complexity: 'low', cyclomaticComplexity: 1, nestingDepth: 1, branchCount: 0, loopCount: 0, callCount: 0, documentationCoverage: 1 },
    relationships: { calls: [], calledBy: [], references: [], referencedBy: [], imports: [], exports: [], children: [] },
    confidence: { overall: 0.99, classification: 1, location: 1, parameters: 1, returns: 1, analysis: 1 }
  };

  it('renders collapsed state correctly with badges', () => {
    render(<CodeItemCard item={mockArtifact} />);
    expect(screen.getByText('calculateTotal')).toBeInTheDocument();
    expect(screen.getByText(/Function/i)).toBeInTheDocument();
    expect(screen.getByText(/Data Processing/i)).toBeInTheDocument();
  });

  it('expands to show detailed AST analysis when clicked', () => {
    render(<CodeItemCard item={mockArtifact} />);
    
    const button = screen.getByRole('button', { expanded: false });
    fireEvent.click(button);
    
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument();
    expect(screen.getByText('Parameters')).toBeInTheDocument();
    expect(screen.getByText('Source Code')).toBeInTheDocument();
  });

  it('copies code to clipboard', async () => {
    render(<CodeItemCard item={mockArtifact} />);
    fireEvent.click(screen.getByRole('button', { expanded: false }));
    
    const copyButton = screen.getByText('📋 Copy');
    fireEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockArtifact.code);
    
    // FIX: Using findByText handles the asynchronous state update!
    expect(await screen.findByText('✓ Copied!')).toBeInTheDocument();
  });
});