import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, afterEach } from 'vitest';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

afterEach(cleanup);

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Authentication Forms', () => {
  it('renders the login form correctly', () => {
    renderWithRouter(<LoginForm />);
    expect(screen.getByLabelText(/Email/i)).toBeDefined();
    expect(screen.getByLabelText(/Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Login/i })).toBeDefined();
  });

  it('renders the register form correctly', () => {
    renderWithRouter(<RegisterForm />);
    expect(screen.getByLabelText(/Full Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Email/i)).toBeDefined();
    expect(screen.getByLabelText(/^Password/i)).toBeDefined();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Register/i })).toBeDefined();
  });
});