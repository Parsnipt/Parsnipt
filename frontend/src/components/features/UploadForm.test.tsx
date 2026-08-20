/**
 * Upload form tests
 */

import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UploadForm from './UploadForm';

afterEach(cleanup);

describe('UploadForm', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render upload form with drag-and-drop area', () => {
    renderWithRouter(<UploadForm />);

    expect(screen.getByText(/upload your code/i)).toBeInTheDocument();
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /choose file/i })).toBeInTheDocument();
  });

  it('should show supported file types', () => {
    renderWithRouter(<UploadForm />);

    expect(screen.getByText(/supported formats/i)).toBeInTheDocument();
    expect(screen.getByText(/\.js, \.jsx, \.ts, \.tsx/)).toBeInTheDocument();
  });

  it('should show file size limit based on tier', () => {
    renderWithRouter(<UploadForm />);

    expect(screen.getByText(/max file size/i)).toBeInTheDocument();
  });

  it('should show error for invalid file type', async () => {
    renderWithRouter(<UploadForm />);

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement;
    
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });

  it('should show error for empty file', async () => {
    renderWithRouter(<UploadForm />);

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement;
    
    const emptyFile = new File([], 'test.js', { type: 'application/javascript' });
    fireEvent.change(fileInput, { target: { files: [emptyFile] } });

    await waitFor(() => {
      expect(screen.getByText(/file is empty/i)).toBeInTheDocument();
    });
  });

  it('should clear error when close button is clicked', async () => {
    renderWithRouter(<UploadForm />);

    const fileInput = screen.getByLabelText(/file input/i) as HTMLInputElement;
    
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    expect(screen.queryByText(/invalid file type/i)).not.toBeInTheDocument();
  });
});