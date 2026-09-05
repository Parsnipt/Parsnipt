/**
 * Extraction item tests
 */

import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExtractionItem from './ExtractionItem';
import { DbExtraction } from '../../types/extraction';

afterEach(cleanup);

describe('ExtractionItem', () => {
  const mockExtraction: DbExtraction = {
    id: '123',
    user_id: 'user-123',
    name: 'TestComponent',
    code: 'const TestComponent = () => <div>Hello</div>;',
    kind: 'component',
    role: 'rendering',
    fingerprint: 'abcdef1234567890abcdef',
    created_at: new Date().toISOString(),
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render extraction item with artifact name', () => {
    renderWithRouter(<ExtractionItem extraction={mockExtraction} />);

    expect(screen.getByText('TestComponent')).toBeInTheDocument();
  });

  it('should show kind and role badges', () => {
    renderWithRouter(<ExtractionItem extraction={mockExtraction} />);

    expect(screen.getByText('component')).toBeInTheDocument();
    expect(screen.getByText('rendering')).toBeInTheDocument();
  });

  it('should show partial fingerprint', () => {
    renderWithRouter(<ExtractionItem extraction={mockExtraction} />);

    expect(screen.getByText(/abcdef1234567890/)).toBeInTheDocument();
  });

  it('should have an enabled View button', () => {
    renderWithRouter(<ExtractionItem extraction={mockExtraction} />);
    
    const viewButton = screen.getByRole('button', { name: /view/i });
    expect(viewButton).toBeInTheDocument();
    expect(viewButton).not.toBeDisabled();
  });

  it('should show delete confirmation dialog when delete clicked', () => {
    renderWithRouter(<ExtractionItem extraction={mockExtraction} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText(/delete artifact/i)).toBeInTheDocument();
  });
});