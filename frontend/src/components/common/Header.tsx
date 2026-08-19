/**
 * Application header
 * Shows logo, navigation, and user info/logout
 */

import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/auth';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold hover:text-primary-100 transition">
            Parsnipt
          </Link>

          {/* Navigation and user area */}
          <nav className="flex items-center space-x-6">
            {/* Documentation link */}
            <a
              href="https://github.com/parsnipt/parsnipt"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-100 transition text-sm"
            >
              Docs
            </a>

            {/* Authenticated user section */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-primary-400">
                <div className="text-sm">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-primary-100 text-xs">{user.tier} tier</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-primary-700 hover:bg-primary-800 rounded transition text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              /* Unauthenticated user section */
              <div className="flex items-center space-x-4 pl-4 border-l border-primary-400">
                <Link
                  to="/login"
                  className="hover:text-primary-100 transition text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary-700 hover:bg-primary-800 rounded transition text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}