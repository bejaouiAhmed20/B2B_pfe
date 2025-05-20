import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';

/**
 * Composant qui redirige automatiquement vers la page appropriée en fonction de l'état d'authentification
 * Si l'utilisateur est déjà connecté, il est redirigé vers son tableau de bord
 * Sinon, il est redirigé vers la page de connexion client
 */
const HomeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    
    console.log('HomeRedirect - Vérification de l\'authentification');
    console.log('Token existe:', !!token);
    console.log('User existe:', !!userStr);

    if (token && userStr) {
      try {
        // Analyser les données utilisateur
        const user = JSON.parse(userStr);
        console.log('User est admin:', user.est_admin === true);
        
        // Rediriger vers le tableau de bord approprié
        if (user.est_admin) {
          console.log('Redirection vers /admin');
          navigate('/admin');
        } else {
          console.log('Redirection vers /client');
          navigate('/client');
        }
      } catch (e) {
        console.error('Erreur lors du parsing des données utilisateur:', e);
        // En cas d'erreur, supprimer les données corrompues et rediriger vers la connexion client
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        navigate('/login-client');
      }
    } else {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion client
      console.log('Utilisateur non connecté, redirection vers /login-client');
      navigate('/login-client');
    }
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        bgcolor: '#f5f5f5'
      }}
    >
      <CircularProgress color="primary" size={60} />
      <Typography variant="h6" sx={{ mt: 3 }}>
        Redirection en cours...
      </Typography>
    </Box>
  );
};

export default HomeRedirect;
