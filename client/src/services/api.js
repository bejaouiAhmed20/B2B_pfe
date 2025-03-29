import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    } else {
      console.log('No token available for request:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If we get a 401 error, redirect to login
    if (error.response && error.response.status === 401) {
      console.log('Authentication error on:', error.config.url);
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        console.log('Redirecting to login page');
        // Clear token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Store the current page to redirect back after login
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        // Redirect to login page
        window.location.href = '/login-client';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;