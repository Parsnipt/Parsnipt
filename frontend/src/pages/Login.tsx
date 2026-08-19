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
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card container */}
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary-900 mb-2">
              Parsnipt
            </h1>
            <p className="text-gray-600 text-lg">
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
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register link */}
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 font-semibold hover:text-primary-700 underline"
            >
              Create one now
            </Link>
          </p>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs font-semibold text-blue-900 mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-blue-700">
              Email: <code className="bg-white px-1 rounded">test@example.com</code>
            </p>
            <p className="text-xs text-blue-700">
              Password: <code className="bg-white px-1 rounded">password123</code>
            </p>
          </div>
        </div>

        {/* Footer link */}
        <div className="mt-6 text-center">
          <a href="#" className="text-white hover:text-primary-100 text-sm underline">
            Need help? Contact support
          </a>
        </div>
      </div>
    </div>
  );
}