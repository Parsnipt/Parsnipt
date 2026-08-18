import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LoginForm from '../components/forms/LoginForm';

export default function Login() {
  const { error, clearError } = useAuthStore();

  return (    
    <div className="min-h-screen bg-brand-cream flex items-center justify-center px-4">      
      <div className="bg-white rounded-2xl shadow-xl border-2 border-brand-brown/50 p-8 w-full max-w-md">
                
        <h1 className="text-4xl font-bold mb-2 text-center text-brand-darkGreen tracking-tight">
          Parsnipt
        </h1>
                
        <p className="text-brand-brown text-center mb-8 text-lg">
          Extract code smarter
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={clearError}
              className="float-right font-bold text-red-500 hover:text-red-700 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        <LoginForm />

        <p className="text-center mt-6 text-brand-darkGreen/80">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-mediumGreen font-semibold hover:text-brand-darkGreen hover:underline transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}