import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies
});

// Track if we're currently refreshing the token
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

// Process the queue of failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    // Vérifier si la requête est pour le rafraîchissement du token
    const isRefreshRequest = config.url && config.url.includes('/auth/refresh-token');

    // Get token from localStorage
    const token = localStorage.getItem('accessToken');

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    } else {
      console.log('No token available for request:', config.url);

      // Ne pas rediriger si c'est une requête de rafraîchissement de token
      if (isRefreshRequest) {
        console.log('Requête de rafraîchissement de token, pas de redirection nécessaire');
        return config;
      }

      // Check if we're on a protected route and not already on a public page
      const currentPath = window.location.pathname;
      const publicPaths = [
        '/login',
        '/login-client',
        '/forgot-password',
        '/reset-password',
        '/reset-password/',
        '/contact'
      ];

      const isPublicPath = publicPaths.some(path => currentPath.includes(path));

      if (!isPublicPath) {
        console.log('Redirection depuis une route protégée:', currentPath);

        // Store the current location for redirect after login
        localStorage.setItem('redirectAfterLogin', currentPath);

        // Redirect to login page based on the route
        const isAdminRoute = currentPath.includes('/admin');
        const loginPath = isAdminRoute ? '/login' : '/login-client';

        console.log('Redirection vers:', loginPath);
        // Utiliser setTimeout pour éviter les redirections en boucle
        setTimeout(() => {
          window.location.href = loginPath;
        }, 100);
      } else {
        console.log('Déjà sur une page publique, pas de redirection nécessaire');
      }
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
  async (error) => {
    // Si la requête a été annulée, ne pas traiter l'erreur
    if (error.name === 'CanceledError' || error.name === 'AbortError') {
      console.log('Requête annulée:', error.message);
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    if (!originalRequest) {
      console.error('Configuration de requête originale manquante:', error);
      return Promise.reject(error);
    }

    console.log('API Error:', error.message);
    console.log('Status:', error.response?.status);
    console.log('Original request URL:', originalRequest?.url);

    // Si la requête est déjà une tentative de rafraîchissement, ne pas essayer à nouveau
    const isRefreshRequest = originalRequest.url && originalRequest.url.includes('/auth/refresh-token');
    if (isRefreshRequest) {
      console.log('Échec de la requête de rafraîchissement, pas de nouvelle tentative');
      return Promise.reject(error);
    }

    // If we get a 401 error and we haven't tried to refresh the token yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('Tentative de rafraîchissement du token...');

      if (isRefreshing) {
        // If we're already refreshing, add this request to the queue
        console.log('Déjà en train de rafraîchir, ajout à la file d\'attente');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        console.log('Envoi de la requête de rafraîchissement du token');

        // Utiliser axios directement pour éviter les intercepteurs
        const axiosInstance = axios.create({
          baseURL: 'http://localhost:5000/api',
          withCredentials: true
        });

        const response = await axiosInstance.post('/auth/refresh-token');
        console.log('Réponse de rafraîchissement:', response.data);

        const { accessToken } = response.data;

        if (accessToken) {
          console.log('Nouveau token obtenu');

          // Store the new token
          localStorage.setItem('accessToken', accessToken);

          // Update the authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          // Process any queued requests
          processQueue(null, accessToken);

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('No access token received');
        }
      } catch (refreshError) {
        console.error('Échec du rafraîchissement du token:', refreshError);

        // If refresh token fails, redirect to login
        processQueue(refreshError, null);

        // Determine which login page to redirect to
        const currentPath = window.location.pathname;
        const isAdminRoute = currentPath.includes('/admin');
        const loginPath = isAdminRoute ? '/login' : '/login-client';

        // Only redirect if not already on login page
        if (!currentPath.includes('/login')) {
          console.log(`Redirection vers ${loginPath}`);

          // Clear token and user data
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');

          // Store the current page to redirect back after login
          localStorage.setItem('redirectAfterLogin', currentPath);

          // Redirect to login page
          setTimeout(() => {
            window.location.href = loginPath;
          }, 100);
        }
      } finally {
        isRefreshing = false;
      }
    } else if (error.response && error.response.status === 403) {
      // Handle forbidden errors (e.g., trying to access admin resources as a regular user)
      console.error('Accès interdit (403):', error.response.data);

      // If on an admin route but not an admin, redirect to client home
      const currentPath = window.location.pathname;
      if (currentPath.includes('/admin')) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.est_admin) {
          console.log('Utilisateur non-admin tentant d\'accéder à une route admin, redirection...');
          setTimeout(() => {
            window.location.href = '/client';
          }, 100);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;