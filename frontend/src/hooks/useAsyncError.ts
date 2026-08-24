import { useEffect, useState } from 'react';

export function useAsyncError() {
  const [, setError] = useState();

  useEffect(() => {
    const handleError = (event: PromiseRejectionEvent) => {
      setError(() => {
        throw event.reason;
      });
    };

    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);
}

export default useAsyncError;