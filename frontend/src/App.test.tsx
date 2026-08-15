import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import App from './App';

// Wipe the fake browser clean after each test
afterEach(cleanup);

describe('App Component', () => {
  it('redirects unauthenticated users to the login page', () => {
    render(<App />);
    expect(screen.getByText(/Extract code smarter/i)).toBeDefined();
  });

  it('renders header with logo', () => {
    render(<App />);
    expect(screen.getByText(/Parsnipt/i)).toBeDefined();
  });
});