import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useAsyncError } from '../../hooks/useAsyncError';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error, reset: () => void) => React.ReactNode;
}

export default function ErrorBoundary({
  children,
  fallback,
}: ErrorBoundaryProps) {
  useAsyncError();

  return (
    <ReactErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        const safeError = error instanceof Error ? error : new Error(String(error));

        if (fallback) {
          return fallback(safeError, resetErrorBoundary);
        }

        return (
          <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <div className="mb-4 flex justify-center">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 text-center mb-4">
                We're sorry for the inconvenience. Please try refreshing the page.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-red-50 border border-red-300 rounded p-3 mb-4">
                  <p className="text-xs font-mono text-red-800 break-words">
                    {safeError.message}
                  </p>
                </div>
              )}
              <button
                onClick={resetErrorBoundary}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition"
              >
                Try Again
              </button>
              <a
                href="/"
                className="w-full mt-3 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded font-medium transition text-center block"
              >
                Go Home
              </a>
            </div>
          </div>
        );
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}