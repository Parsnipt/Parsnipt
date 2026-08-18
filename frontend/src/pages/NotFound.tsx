/**
 * 404 Not Found page
 */

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-narrow py-12 text-center">
      <h1 className="text-5xl font-bold mb-4 text-brand-darkGreen">404</h1>
      <p className="text-xl text-brand-brown mb-8">Oops! Page not found.</p>
      <Link to="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  );
}