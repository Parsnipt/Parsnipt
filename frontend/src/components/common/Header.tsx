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
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Parsnipt
        </Link>
        <nav className="space-x-6 flex items-center">
          <a href="#" className="hover:text-primary-100 transition">
            Docs
          </a>
          {isAuthenticated ? (
            <>
              <span className="text-primary-100">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="hover:text-primary-100 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary-100 transition">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}