/**
 * 404 Not Found page
 */

import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-narrow py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-8">Page not found</p>
      <Link to="/" className="btn-primary">
        Go Home
      </Link>
    </div>
  );
}