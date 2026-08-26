/**
 * Register form component
 * Handles new user registration with validation
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/auth';
import { RegisterRequest } from '../../types/auth';

interface PasswordStrength {
  score: number; // 0-4
  text: string;
  color: string;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
  };
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const { setLoading, setError, clearError } = useAuthStore();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // Success state to show the email confirmation message
  const [isSuccess, setIsSuccess] = useState(false); 

  /**
   * Validate email format
   */
  const validateEmail = (emailToCheck: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToCheck);
  };

  /**
   * Calculate password strength
   */
  const passwordStrength = useMemo((): PasswordStrength => {
    const requirements = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    const score = metRequirements;

    let text = 'Weak';
    let color = 'text-red-600';

    if (score === 2) {
      text = 'Fair';
      color = 'text-orange-600';
    } else if (score === 3) {
      text = 'Good';
      color = 'text-yellow-600';
    } else if (score === 4) {
      text = 'Strong';
      color = 'text-green-600';
    }

    return { score, text, color, requirements };
  }, [password]);

  /**
   * Validate form inputs before submission
   */
  const validateForm = (): string | null => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (!email.trim()) return 'Email is required';
    if (!validateEmail(email)) return 'Please enter a valid email address';
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (!agreedToTerms) return 'You must agree to the terms and conditions';

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
      // Call register API
      const registerData: RegisterRequest = {
        name: name.trim(),
        email: email.trim(),
        password,
      };

      await authService.register(registerData);

      // Show the success screen asking to check the email
      setIsSuccess(true);
      
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  // If registration was successful, shows the confirmation screen
  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-brand-darkGreen/90 mb-2">Check your email</h2>
        <p className="text-brand-brown/80 mb-6">
          We've sent a verification link to <span className="font-bold">{email}</span>. 
          Please click the link to activate your account.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary w-full"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Render the form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Error alert */}
      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
          <span>{localError}</span>
          <button
            type="button"
            onClick={() => setLocalError(null)}
            className="font-bold text-xl leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Full Name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-bold text-brand-darkGreen/90 mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setLocalError(null)}
          className="input-base"
          placeholder="John Doe"
          disabled={isSubmitting}
          required
        />
      </div>

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
        />
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

        {/* Password strength indicator */}
        {password && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-brand-brown/80">Password Strength:</span>
              <span className={`text-xs font-bold ${passwordStrength.color}`}>
                {passwordStrength.text}
              </span>
            </div>

            {/* Strength bar */}
            <div className="w-full bg-brand-cream border border-brand-brown/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  passwordStrength.score === 1
                    ? 'bg-red-500 w-1/4'
                    : passwordStrength.score === 2
                      ? 'bg-orange-500 w-2/4'
                      : passwordStrength.score === 3
                        ? 'bg-yellow-500 w-3/4'
                        : 'bg-green-500 w-full'
                }`}
              />
            </div>

            {/* Requirements checklist */}
            <div className="space-y-1 mt-2">
              <RequirementItem
                met={passwordStrength.requirements.minLength}
                text="At least 8 characters"
              />
              <RequirementItem
                met={passwordStrength.requirements.hasUppercase}
                text="One uppercase letter (A-Z)"
              />
              <RequirementItem
                met={passwordStrength.requirements.hasLowercase}
                text="One lowercase letter (a-z)"
              />
              <RequirementItem
                met={passwordStrength.requirements.hasNumber}
                text="One number (0-9)"
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirm Password field */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-bold text-brand-darkGreen/90 mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onFocus={() => setLocalError(null)}
          className="input-base"
          placeholder="••••••••"
          disabled={isSubmitting}
          required
        />
        {password && confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
        )}
        {password && confirmPassword && password === confirmPassword && (
          <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
        )}
      </div>

      {/* Terms agreement checkbox */}
      <div className="flex items-start mt-4">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className="mt-1 mr-2 accent-brand-mediumGreen"
          disabled={isSubmitting}
        />
        <label htmlFor="terms" className="text-xs text-brand-brown/80">
          I agree to the{' '}
          <a href="#" className="text-brand-darkGreen/90 hover:text-brand-mediumGreen font-bold underline transition-colors">
            Terms and Conditions
          </a>{' '}
          and{' '}
          <a href="#" className="text-brand-darkGreen/90 hover:text-brand-mediumGreen font-bold underline transition-colors">
            Privacy Policy
          </a>
        </label>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`btn-primary w-full mt-2 ${isSubmitting ? 'opacity-90 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⟳</span>
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
}

/**
 * Requirement checklist item component
 */
interface RequirementItemProps {
  met: boolean;
  text: string;
}

function RequirementItem({ met, text }: RequirementItemProps) {
  return (
    <div className="flex items-center text-xs">
      <span
        className={`mr-2 font-bold ${
          met ? 'text-green-600' : 'text-brand-brown/40'
        }`}
      >
        {met ? '✓' : '○'}
      </span>
      <span className={met ? 'text-brand-darkGreen/90' : 'text-brand-brown/80'}>
        {text}
      </span>
    </div>
  );
}