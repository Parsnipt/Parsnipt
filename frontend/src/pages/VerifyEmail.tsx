import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Ref to prevent React 18 Strict Mode from double-firing the API call
  const hasAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided.');
      return;
    }

    if (hasAttempted.current) return;
    hasAttempted.current = true;

    const verifyAccount = async () => {
      try {
        // Dynamically point to the backend URL
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        await axios.get(`${apiUrl}/api/v1/auth/verify/${token}`);
        
        setStatus('success');
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.response?.data?.error?.message || 'Verification failed. The link may have expired.');
      }
    };

    verifyAccount();
  }, [token]);

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-xl shadow-brand-darkBrown/10 border-2 border-brand-brown/60 text-center">
      
      {status === 'verifying' && (
        <>
          <div className="w-12 h-12 border-4 border-brand-mediumGreen border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-darkGreen/90 mb-2">Verifying your email...</h2>
          <p className="text-brand-brown/80">Please wait while we confirm your account.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brand-darkGreen/90 mb-2">Account Verified!</h2>
          <p className="text-brand-brown/80 mb-8">Your email has been successfully confirmed. You can now log in and start extracting code artifacts.</p>
          <Link to="/login" className="btn-primary w-full inline-block">
            Go to Login
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Verification Failed</h2>
          <p className="text-red-700 mb-8">{errorMessage}</p>
          <Link to="/login" className="px-4 py-2 bg-brand-cream/50 text-brand-darkGreen/90 border-2 border-brand-brown/30 hover:border-brand-brown/80 rounded-lg font-bold transition-colors inline-block w-full">
            Return to Login
          </Link>
        </>
      )}
    </div>
  );
}