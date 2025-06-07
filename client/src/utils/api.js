import axios from 'axios';

// Configuration for API calls
export const API_BASE_URL = 'http://localhost:5000/api';

// Utility functions for token management
export const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

export const setAuthToken = (token) => {
  localStorage.setItem('accessToken', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

// Utility function to get axios config with auth headers
export const getAxiosConfig = () => {
  const token = getAuthToken();
  return {
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    withCredentials: true
  };
};

// Utility function for handling authentication errors
export const handleAuthError = (error) => {
  if (error.response && error.response.status === 401) {
    // Clear tokens and redirect to login
    removeAuthToken();
    
    const currentPath = window.location.pathname;
    const isAdminRoute = currentPath.includes('/admin');
    const loginPath = isAdminRoute ? '/login' : '/login-client';
    
    // Store the current location for redirect after login
    localStorage.setItem('redirectAfterLogin', currentPath);
    
    // Only redirect if not already on login page
    if (!currentPath.includes('/login')) {
      setTimeout(() => {
        window.location.href = loginPath;
      }, 100);
    }
  } else if (error.response && error.response.status === 403) {
    // Handle forbidden errors
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin')) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.est_admin) {
        setTimeout(() => {
          window.location.href = '/client';
        }, 100);
      }
    }
  }
  
  return Promise.reject(error);
};

// Utility function to refresh token
export const refreshToken = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
      withCredentials: true
    });
    
    const { accessToken } = response.data;
    if (accessToken) {
      setAuthToken(accessToken);
      return accessToken;
    }
    throw new Error('No access token received');
  } catch (error) {
    removeAuthToken();
    throw error;
  }
};

// Create a configured axios instance for easy use
export const createApiInstance = () => {
  const instance = axios.create(getAxiosConfig());
  
  // Add response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => handleAuthError(error)
  );
  
  return instance;
};
