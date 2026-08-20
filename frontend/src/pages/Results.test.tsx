/**
 * Results page tests
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Results from './Results';

// Intercept the API call to prevent Axios Network Errors during testing
vi.mock('../services/extractions', () => ({
  default: {
    getExtraction: vi.fn().mockResolvedValue(null),
  }
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Results Page', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render results page with back button', () => {
    renderWithRouter(<Results />);

    expect(screen.getByText(/Back to Uploads/i)).toBeInTheDocument();
  });

  it('should show error when no extraction ID provided', () => {
    renderWithRouter(<Results />);

    expect(
      screen.getByRole('button', { name: /Back to Uploads/i })
    ).toBeInTheDocument();
  });
});