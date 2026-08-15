import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import RegisterForm from '../components/forms/RegisterForm';

export default function Register() {
  const { error, clearError } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-600 to-secondary-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-secondary-900">
          Parsnipt
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Join the code extraction revolution
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={clearError}
              className="float-right font-bold"
            >
              ×
            </button>
          </div>
        )}

        <RegisterForm />

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary-600 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}