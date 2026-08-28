/**
 * Login form tests
 */

import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from './LoginForm';

afterEach(cleanup);

describe('LoginForm', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render login form with email and password fields', () => {
    renderWithRouter(<LoginForm />);

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('should show error when email is empty', () => {
    renderWithRouter(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });

  it('should show error when email is invalid', () => {
    renderWithRouter(<LoginForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
  });

  it('should show error when password is empty', () => {
    renderWithRouter(<LoginForm />);

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it('should clear error when user starts typing', () => {
    renderWithRouter(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.focus(emailInput);

    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });
});