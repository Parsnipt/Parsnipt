import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component', () => {
  it('redirects unauthenticated users to the login page', () => {
    render(<App />);
    
    // Expects to see the Login page subtitle
    expect(screen.getByText(/Extract code smarter/i)).toBeDefined();
  });

  it('renders header with logo', () => {
    render(<App />);
    expect(screen.getByText(/Parsnipt/i)).toBeDefined();
  });
});