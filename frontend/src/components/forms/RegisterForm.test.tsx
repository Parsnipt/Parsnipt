/**
 * Register form tests
 */

import { describe, it, expect, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterForm from './RegisterForm';

afterEach(cleanup);

describe('RegisterForm', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('should render register form with all fields', () => {
    renderWithRouter(<RegisterForm />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should show password strength indicator when typing password', () => {
    renderWithRouter(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    fireEvent.change(passwordInput, { target: { value: 'Test' } });

    expect(screen.getByText(/password strength/i)).toBeInTheDocument();
  });

  it('should show password requirements', () => {
    renderWithRouter(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    fireEvent.change(passwordInput, { target: { value: 'Test123' } });

    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one number/i)).toBeInTheDocument();
  });

  it('should show match status for confirm password', () => {
    renderWithRouter(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Test123!' } });

    expect(screen.getByText(/passwords match/i)).toBeInTheDocument();
  });

  it('should show error when passwords do not match', () => {
    renderWithRouter(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: 'Test123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Different123!' } });

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });
});