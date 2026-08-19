/**
 * Authentication state management with Zustand
 * Manages user state, loading states, and error messages
 */

import { create } from 'zustand';
import { AuthUser } from '../types/auth.js';

interface AuthStore {
  // User data
  user: AuthUser | null;
  
  // Loading and error states
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // User actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  // Actions
  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      error: null, // Clear error when user is set
    });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  logout: () => {
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Reset state
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      isLoading: false,
    });
  },
}));