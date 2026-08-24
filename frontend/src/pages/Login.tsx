/**
 * Login page
 * Full page for user login
 */

import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoginForm from '../components/forms/LoginForm';

export default function Login() {
  const { error: globalError, clearError } = useAuthStore();

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card container */}
        <div className="bg-white rounded-lg shadow-xl shadow-brand-darkBrown/30 border-2 border-brand-brown/80 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-brand-darkGreen/90 mb-2">
              Parsnipt
            </h1>
            <p className="text-brand-brown/80 text-lg">
              Extract code smarter, faster, better
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

          {/* Login form */}
          <LoginForm />

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border border-brand-darkGreen/90"></div>
            <span className="px-3 text-brand-brown/80 text-sm">OR</span>
            <div className="flex-1 border border-brand-darkGreen/90"></div>
          </div>

          {/* Register link */}
          <p className="text-center text-brand-brown/80">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-brand-darkGreen/90 font-bold hover:text-brand-mediumGreen transition-colors underline"
            >
              Create one now
            </Link>
          </p>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-brand-cream border border-brand-mediumGreen rounded">
            <p className="text-xs font-bold text-brand-darkGreen mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-brand-brown">
              Email: <code className="bg-white border border-brand-mediumGreen px-1 rounded text-brand-darkGreen">test@example.com</code>
            </p>
            <p className="text-xs text-brand-brown mt-1">
              Password: <code className="bg-white border border-brand-mediumGreen px-1 rounded text-brand-darkGreen">password123</code>
            </p>
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-6 text-center">
          <a href="#" className="text-brand-darkGreen/90 hover:text-brand-mediumGreen transition-colors text-sm underline">
            Need help? Contact support
          </a>
        </div>
      </div>
    </div>
  );
}