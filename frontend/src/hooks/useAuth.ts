/**
 * Custom hook for authentication
 * Provides auth state and methods
 */

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, logout } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      // TODO: Fetch user profile from API when token exists
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    logout,
  };
};