/**
 * Basic app component tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  it('renders the application', () => {
    render(<App />);
    expect(screen.getByText(/Welcome to Parsnipt/i)).toBeDefined();
  });

  it('renders header with logo', () => {
    render(<App />);
    expect(screen.getByText('Parsnipt')).toBeDefined();
  });
});