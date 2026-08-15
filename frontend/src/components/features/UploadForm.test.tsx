import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import UploadForm from './UploadForm';

vi.mock('../../store/extractionStore', () => ({
  useExtractionStore: () => ({
    addExtraction: vi.fn(),
    setLoading: vi.fn(),
  })
}));

afterEach(cleanup);

describe('UploadForm Component', () => {
  it('renders the drag-and-drop zone and upload button', () => {
    render(<UploadForm />);
    expect(screen.getByText(/Drag and drop your file here/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Choose File/i })).toBeDefined();
  });

  it('displays the allowed file types and size limits', () => {
    render(<UploadForm />);
    expect(screen.getByText(/Allowed types:/i)).toBeDefined();
    expect(screen.getByText(/Max size: 50KB/i)).toBeDefined();
  });
});