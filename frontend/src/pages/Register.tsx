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
    <div className="min-h-screen bg-gradient-to-br from-secondary-600 to-secondary-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card container */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-secondary-900 mb-2">
              Parsnipt
            </h1>
            <p className="text-gray-600 text-lg">
              Join the code extraction revolution
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

          {/* Registration form */}
          <RegisterForm />

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login link */}
          <p className="text-center text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-secondary-600 font-semibold hover:text-secondary-700 underline"
            >
              Log in here
            </Link>
          </p>

          {/* Benefits section */}
          <div className="mt-6 space-y-2">
            <div className="flex items-start text-xs">
              <span className="text-green-600 font-bold mr-2">✓</span>
              <span className="text-gray-700">50KB free file uploads</span>
            </div>
            <div className="flex items-start text-xs">
              <span className="text-green-600 font-bold mr-2">✓</span>
              <span className="text-gray-700">10 extractions per day</span>
            </div>
            <div className="flex items-start text-xs">
              <span className="text-green-600 font-bold mr-2">✓</span>
              <span className="text-gray-700">Syntax-highlighted code preview</span>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-6 text-center">
          <a href="#" className="text-white hover:text-secondary-100 text-sm underline">
            Read our Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}