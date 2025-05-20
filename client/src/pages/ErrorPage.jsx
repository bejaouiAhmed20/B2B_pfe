import React from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import { useNavigate, useRouteError } from 'react-router-dom';
import { ErrorOutline, Home, ArrowBack } from '@mui/icons-material';
import logo from '../assets/Tunisair-Logo.png';

const ErrorPage = () => {
  const navigate = useNavigate();
  const error = useRouteError();
  
  // Determine if it's an authentication error
  const isAuthError = error?.status === 401 || error?.statusText === 'Unauthorized';
  
  // Get error details
  const errorStatus = error?.status || 500;
  const errorMessage = error?.statusText || error?.message || 'Une erreur inattendue est survenue';
  
  const getErrorTitle = () => {
    switch (errorStatus) {
      case 401:
        return 'Non autorisé';
      case 403:
        return 'Accès refusé';
      case 404:
        return 'Page non trouvée';
      case 500:
        return 'Erreur serveur';
      default:
        return 'Erreur';
    }
  };
  
  const getErrorDescription = () => {
    switch (errorStatus) {
      case 401:
        return 'Vous devez être connecté pour accéder à cette page.';
      case 403:
        return 'Vous n\'avez pas les droits nécessaires pour accéder à cette page.';
      case 404:
        return 'La page que vous recherchez n\'existe pas ou a été déplacée.';
      case 500:
        return 'Le serveur a rencontré une erreur. Veuillez réessayer plus tard.';
      default:
        return 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.';
    }
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleGoHome = () => {
    navigate('/');
  };
  
  const handleLogin = () => {
    navigate('/login-client');
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f5f5',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          py: 2,
          px: 3,
          bgcolor: 'white',
          boxShadow: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <img
          src={logo}
          alt="Tunisair Logo"
          style={{ height: 40, cursor: 'pointer' }}
          onClick={handleGoHome}
        />
      </Box>
      
      {/* Content */}
      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', alignItems: 'center', py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <ErrorOutline sx={{ fontSize: 80, color: '#CC0A2B', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            {getErrorTitle()}
          </Typography>
          
          <Typography variant="h6" color="text.secondary" paragraph>
            {getErrorDescription()}
          </Typography>
          
          {errorStatus !== 404 && (
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 3 }}>
              Détails: {errorMessage}
            </Typography>
          )}
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBack />}
              onClick={handleGoBack}
            >
              Retour
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<Home />}
              onClick={handleGoHome}
              sx={{ bgcolor: '#CC0A2B', '&:hover': { bgcolor: '#a00823' } }}
            >
              Accueil
            </Button>
            
            {isAuthError && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                sx={{ bgcolor: '#1A2B4A', '&:hover': { bgcolor: '#0f1a2d' } }}
              >
                Se connecter
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: '#1A2B4A',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">
          © {new Date().getFullYear()} Tunisair. Tous droits réservés.
        </Typography>
      </Box>
    </Box>
  );
};

export default ErrorPage;
