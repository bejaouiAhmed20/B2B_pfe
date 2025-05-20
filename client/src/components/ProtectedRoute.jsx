import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import api from '../services/api';

/**
 * Composant pour protéger les routes qui nécessitent une authentification
 * @param {Object} props - Les propriétés du composant
 * @param {React.ReactNode} props.children - Les composants enfants à rendre si l'utilisateur est authentifié
 * @param {boolean} props.requireAdmin - Si true, l'utilisateur doit être un administrateur
 * @returns {React.ReactNode} - Le composant enfant ou une redirection
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Vérification de l\'authentification...');

        // Vérifier si le token existe (vérifier les deux noms possibles)
        const token = localStorage.getItem('accessToken');
        const userStr = localStorage.getItem('user');

        console.log('Token existe:', !!token);
        console.log('User existe:', !!userStr);

        if (!token || !userStr) {
          console.log('Token ou user manquant, authentification échouée');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Vérifier si l'utilisateur est un admin si nécessaire
        try {
          const user = JSON.parse(userStr);
          console.log('User est admin:', user.est_admin === true);
          setIsAdmin(user.est_admin === true);

          // Si on requiert un admin mais que l'utilisateur n'en est pas un, on échoue directement
          if (requireAdmin && !user.est_admin) {
            console.log('Admin requis mais utilisateur non admin');
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error('Erreur lors du parsing des données utilisateur:', e);
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        try {
          // Vérifier la validité du token avec une requête au serveur
          console.log('Envoi de la requête de vérification...');

          // Ajouter un timeout pour éviter que la requête ne bloque indéfiniment
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          try {
            const response = await api.get('/users/me/verify', {
              signal: controller.signal,
              headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache'
              }
            });

            clearTimeout(timeoutId);
            console.log('Réponse de vérification:', response.data);

            // Si la requête réussit, l'utilisateur est authentifié
            if (response.data.success) {
              console.log('Authentification réussie');
              setIsAuthenticated(true);

              // Mettre à jour les informations de l'utilisateur si nécessaire
              if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setIsAdmin(response.data.user.est_admin === true);
              }
            } else {
              console.log('Échec de l\'authentification:', response.data.message);
              throw new Error(response.data.message || 'Authentication failed');
            }
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
              console.error('La requête de vérification a expiré');
              // Si la requête a expiré, on considère que l'utilisateur est authentifié
              // basé sur la présence du token et des données utilisateur
              console.log('Authentification basée sur les données locales');
              setIsAuthenticated(true);
            } else {
              throw error; // Relancer l'erreur pour qu'elle soit traitée par le bloc catch externe
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification du token:', error);

          // Si l'erreur est 401 (Unauthorized), on essaie de rafraîchir le token
          if (error.response && error.response.status === 401) {
            console.log('Tentative de rafraîchissement du token...');
            try {
              // Essayer de rafraîchir le token
              const refreshResponse = await api.post('/auth/refresh-token');

              if (refreshResponse.data && refreshResponse.data.accessToken) {
                console.log('Token rafraîchi avec succès');
                localStorage.setItem('accessToken', refreshResponse.data.accessToken);

                if (refreshResponse.data.user) {
                  localStorage.setItem('user', JSON.stringify(refreshResponse.data.user));
                }

                setIsAuthenticated(true);
                setIsAdmin(refreshResponse.data.user?.est_admin === true);
                setIsLoading(false);
                return;
              }
            } catch (refreshError) {
              console.error('Échec du rafraîchissement du token:', refreshError);
            }
          }

          setIsAuthenticated(false);

          // Supprimer les tokens invalides
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Erreur générale de vérification d\'authentification:', error);
        setIsAuthenticated(false);

        // Supprimer les tokens invalides
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [requireAdmin]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: '#f5f5f5'
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de connexion appropriée
    const loginPath = requireAdmin ? '/login' : '/login-client';

    // Stocker le chemin actuel pour rediriger après la connexion
    localStorage.setItem('redirectAfterLogin', location.pathname);

    return <Navigate to={loginPath} replace />;
  }

  // Vérifier si l'utilisateur est admin quand c'est requis
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur est authentifié et a les droits nécessaires, afficher le contenu
  return children;
};

export default ProtectedRoute;
