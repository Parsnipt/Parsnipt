/**
 * Login form component
 * Handles user login with email and password
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/auth';
import { LoginRequest } from '../../types/auth';

export default function LoginForm() {
  const navigate = useNavigate();
  const { setUser, setLoading, setError, clearError } = useAuthStore();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  /**
   * Validate email format
   */
  const validateEmail = (emailToCheck: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToCheck);
  };

  /**
   * Validate form inputs before submission
   */
  const validateForm = (): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }

    if (!validateEmail(email)) {
      return 'Please enter a valid email address';
    }

    if (!password) {
      return 'Password is required';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return null;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
      // Call login API
      const loginData: LoginRequest = {
        email: email.trim(),
        password,
      };

      const result = await authService.login(loginData);

      // Store user in state
      setUser(result.user);

      // Clear form
      setEmail('');
      setPassword('');
      setLocalError(null);

      // Redirect to home page
      navigate('/', { replace: true });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error alert */}
      {localError && (
        <div 
          id="form-error" 
          role="alert" 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center"
        >
          <span>{localError}</span>
          <button
            type="button"
            onClick={() => setLocalError(null)}
            className="font-bold text-xl leading-none"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-bold text-brand-darkGreen/90 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setLocalError(null)}
          className="input-base"
          placeholder="your@email.com"
          disabled={isSubmitting}
          required
          aria-label="Email address input"
          aria-describedby={localError ? "form-error" : "email-help"}
        />
        <p id="email-help" className="text-xs text-brand-brown/80 mt-1">
          We'll never share your email with anyone else.
        </p>
      </div>

      {/* Password field */}
      <div>
        <label htmlFor="password" className="block text-sm font-bold text-brand-darkGreen/90 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setLocalError(null)}
          className="input-base"
          placeholder="••••••••"
          disabled={isSubmitting}
          required
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`btn-primary w-full ${isSubmitting ? 'opacity-90 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⟳</span>
            Logging in...
          </span>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
}