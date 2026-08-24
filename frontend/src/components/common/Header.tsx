/**
 * Application header
 * Shows logo, navigation, and user info/logout
 */

import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/auth';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  /**
   * Check if a route is active
   */
  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

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
    <header className="bg-brand-darkGreen backdrop-blur-md text-brand-cream shadow-md border-b border-brand-brown/60 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          
          {/* Brand Logo & Name */}
          <Link            
            to="/" 
            className="flex items-center text-2xl font-bold text-brand-cream hover:text-brand-brown/80 transition-colors"
          >
            <img 
              src="/logo.png" 
              alt="Parsnipt Logo" 
              className="w-18 h-12 mr-3 rounded-md object-contain" 
            />
            Parsnipt
          </Link>

          {/* Navigation and user area */}
          <nav className="flex items-center space-x-6">
            {/* Authenticated user navigation */}
            {isAuthenticated && user ? (
              <>
                {/* Upload link */}
                <Link
                  to="/upload"
                  className={`transition-colors text-sm font-medium ${
                    isActive('/upload')
                      ? 'text-brand-cream border-b-2 border-brand-cream pb-1'
                      : 'text-brand-cream hover:text-brand-mediumGreen'
                  }`}
                >
                  Upload
                </Link>

                {/* Documentation link */}
                <a
                  href="https://github.com/parsnipt/parsnipt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-cream hover:text-brand-mediumGreen transition-colors text-sm font-medium"
                >
                  Docs
                </a>

                {/* User section */}
                <div className="flex items-center space-x-4 pl-4 border-l border-brand-mediumGreen/50">
                  <div className="text-sm">
                    <p className="font-bold text-brand-cream">{user.name}</p>
                    <p className="text-brand-cream text-xs capitalize">{user.tier} tier</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-1.5 bg-brand-brown/80 hover:bg-brand-mediumGreen text-brand-cream rounded-lg transition-colors text-sm font-bold"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              /* Unauthenticated user section */
              <div className="flex items-center space-x-4 pl-4 border-l border-brand-mediumGreen/50">
                <Link
                  to="/login"
                  className="text-brand-cream font-medium hover:text-brand-mediumGreen transition-colors text-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 bg-brand-mediumGreen hover:bg-brand-brown text-brand-cream rounded-lg transition-colors text-sm font-bold"
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