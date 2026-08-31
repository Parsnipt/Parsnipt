/**
 * Axios API client configuration
 * Handles authentication and base configuration
 */

import axios, { AxiosInstance, AxiosError } from 'axios';


const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://parsnipt-api.onrender.com/api/v1',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Keeps the trigger from redirecting if the 401 came from the login route
    if (error.response?.status === 401 && error.config?.url !== '/auth/login') {
      // Token expired - redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;