import { describe, it, expect, afterEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Results from './Results';

// Mock the store so it initializes without a currentAnalysis
vi.mock('../store/extractionStore', () => ({
  useExtractionStore: () => ({
    currentAnalysis: null,
  })
}));

afterEach(cleanup);

describe('Results Page', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render results page and fallback to error state when missing data', async () => {
    renderWithRouter(<Results />);

    // Wait for the async effect to resolve into the error state
    const errorHeading = await screen.findByText('Error Loading Results');
    expect(errorHeading).toBeInTheDocument();
    
    // Use getAllByText because the UI intentionally renders two back buttons in this view
    const backButtons = screen.getAllByText(/Back to Uploads/i);
    expect(backButtons.length).toBeGreaterThan(0);
  });
});