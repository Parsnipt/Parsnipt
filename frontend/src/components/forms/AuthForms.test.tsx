import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Authentication Forms', () => {
  it('renders the login form correctly', () => {
    renderWithRouter(<LoginForm />);
    
    // Check that all fields and the submit button exist
    expect(screen.getByLabelText(/Email/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Login/i })).toBeDefined();
  });

  it('renders the register form correctly', () => {
    renderWithRouter(<RegisterForm />);
    
    // Check that all registration fields exist
    expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Email/i)).toBeDefined();
    expect(screen.getByLabelText(/^Password/i)).toBeDefined();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Register/i })).toBeDefined();
  });
});