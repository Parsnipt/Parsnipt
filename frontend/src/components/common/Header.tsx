/**
 * Application header
 */

import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Parsnipt
        </Link>
        <nav className="space-x-6">
          <Link to="/" className="hover:text-primary-100 transition">
            Home
          </Link>
          <a href="#" className="hover:text-primary-100 transition">
            Docs
          </a>
        </nav>
      </div>
    </header>
  );
}