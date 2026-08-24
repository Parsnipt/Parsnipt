/**
 * Register page
 * Full page for user registration
 */

import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import RegisterForm from '../components/forms/RegisterForm';

export default function Register() {
  const { error: globalError, clearError } = useAuthStore();

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card container matching Login */}
        <div className="bg-white rounded-lg shadow-xl shadow-brand-darkBrown/30 border-2 border-brand-brown/80 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-brand-darkGreen/90 mb-2">
              Create Account
            </h1>
            <p className="text-brand-brown/80 text-lg">
              Join Parsnipt and start extracting
            </p>
          </div>

          {/* Global error (if any) */}
          {globalError && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex justify-between items-center">
              <span>{globalError}</span>
              <button
                onClick={clearError}
                className="font-bold text-xl leading-none hover:text-red-900"
              >
                ×
              </button>
            </div>
          )}

          {/* Register form */}
          <RegisterForm />

          {/* Divider matching Login */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border border-brand-darkGreen/90"></div>
            <span className="px-3 text-brand-brown/80 text-sm">OR</span>
            <div className="flex-1 border border-brand-darkGreen/90"></div>
          </div>

          {/* Login link */}
          <p className="text-center text-brand-brown/80">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-darkGreen/90 font-bold hover:text-brand-mediumGreen transition-colors underline"
            >
              Login instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}