import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/auth';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-brand-darkGreen text-brand-cream shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">        
        <Link to="/" className="flex items-center text-2xl font-bold tracking-tight text-brand-cream hover:text-brand-cream/80 transition-colors">
          <img src="/logo.png" alt="Parsnipt Logo" className="h-8 w-auto mr-3 rounded-full" />
          Parsnipt
        </Link>
        <nav className="space-x-6 flex items-center font-medium">
          <a href="#" className="text-brand-cream hover:text-brand-mediumGreen transition-colors uppercase text-sm tracking-wide">
            Docs
          </a>
          {isAuthenticated ? (
            <>
              <span className="text-brand-cream uppercase text-sm tracking-wide">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-brand-cream hover:text-brand-mediumGreen transition-colors uppercase text-sm tracking-wide"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-brand-cream hover:text-brand-mediumGreen transition-colors uppercase text-sm tracking-wide">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm uppercase tracking-wide">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}