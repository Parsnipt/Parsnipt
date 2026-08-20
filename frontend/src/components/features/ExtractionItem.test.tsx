/**
 * Extraction item tests
 */

import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExtractionItem from './ExtractionItem';
import { Extraction } from '../../types/extraction';

afterEach(cleanup);

describe('ExtractionItem', () => {
  const mockExtraction: Extraction = {
    id: '123',
    userId: 'user-123',
    fileName: 'test.js',
    fileSizeBytes: 1024,
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    extractionResults: {
      functions: [],
      components: [],
      utilities: [],
      constants: [],
      summary: {
        totalItems: 5,
        processingTimeMs: 150,
      },
    },
  };

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render extraction item with file name', () => {
    renderWithRouter(<ExtractionItem extraction={mockExtraction} />);

    expect(screen.getByText('test.js')).toBeInTheDocument();
  });

  it('should show completed status badge', () => {
    renderWithRouter(<ExtractionItem extraction={mockExtraction} />);

    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it('should show item count for completed extractions', () => {
    renderWithRouter(<ExtractionItem extraction={mockExtraction} />);

    expect(screen.getByText(/5 items extracted/i)).toBeInTheDocument();
  });

  it('should show processing status for processing extraction', () => {
    const processingExtraction: Extraction = {
      ...mockExtraction,
      status: 'processing',
    };

    renderWithRouter(<ExtractionItem extraction={processingExtraction} />);

    // FIXED: Use getAllByText because both the badge and the button say "Processing"
    const processingElements = screen.getAllByText(/processing/i);
    expect(processingElements.length).toBeGreaterThan(0);
  });

  it('should disable view button for non-completed extractions', () => {
    const processingExtraction: Extraction = {
      ...mockExtraction,
      status: 'processing',
    };

    renderWithRouter(<ExtractionItem extraction={processingExtraction} />);

    const viewButton = screen.getByRole('button', { name: /processing/i });
    expect(viewButton).toBeDisabled();
  });

  it('should show delete confirmation dialog when delete clicked', () => {
    renderWithRouter(<ExtractionItem extraction={mockExtraction} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(screen.getByText(/delete extraction/i)).toBeInTheDocument();
  });
});