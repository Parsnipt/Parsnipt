/**
 * Upload page E2E tests
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Upload from './Upload';

// Intercept the API call to prevent Axios Network Errors during testing
vi.mock('../services/extractions', () => ({
  default: {
    getExtractions: vi.fn().mockResolvedValue([]),
  }
}));

// Wipe the simulated browser and reset mocks between tests
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Upload Page', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render upload page with form and recent uploads section', async () => {
    renderWithRouter(<Upload />);

    // Use findByText (async) for the first element to let the mocked useEffect resolve
    expect(await screen.findByText(/upload your code/i)).toBeInTheDocument();
    expect(screen.getByText(/recent uploads/i)).toBeInTheDocument();
  });

  it('should show empty state when no uploads', async () => {
    renderWithRouter(<Upload />);

    expect(await screen.findByText(/no uploads yet/i)).toBeInTheDocument();
    expect(screen.getByText(/upload a file above/i)).toBeInTheDocument();
  });

  it('should show upload form section with instructions', async () => {
    renderWithRouter(<Upload />);

    expect(
      await screen.findByText(/upload your javascript or typescript files/i)
    ).toBeInTheDocument();
  });
});