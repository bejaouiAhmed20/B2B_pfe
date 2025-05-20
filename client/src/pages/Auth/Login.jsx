import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Box,
  Container,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import logo from '../../assets/Tunisair-Logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Effacer les erreurs précédentes

    try {
      console.log('Tentative de connexion avec:', { email: formData.email });

      const response = await axios.post('http://localhost:5000/api/auth/login', formData, {
        withCredentials: true // Important for cookies
      });

      console.log('Réponse du serveur:', response.data);

      // Vérifier si la réponse contient un token d'accès
      if (response.data.accessToken) {
        // Vérifier si l'utilisateur est un administrateur
        const user = response.data.user;

        if (!user.est_admin) {
          setError('Vous n\'avez pas les droits d\'administrateur nécessaires pour accéder à cette page.');
          return;
        }

        // Stocker le token et les informations utilisateur
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(user));

        console.log('Connexion réussie, redirection vers /admin');

        // Naviguer vers le tableau de bord administrateur
        navigate('/admin');
      } else {
        setError(response.data.message || 'Authentification échouée. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);

      // Afficher un message d'erreur détaillé
      if (error.response) {
        // Le serveur a répondu avec un statut d'erreur
        setError(error.response.data?.message || `Erreur ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        // La requête a été faite mais pas de réponse reçue
        setError('Aucune réponse du serveur. Veuillez vérifier votre connexion internet.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        setError(`Erreur: ${error.message}`);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for better readability
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <img
              onClick={() => navigate('/client')}
              src={logo}
              alt="Tunisair Logo"
              style={{ height: 50, marginRight: 10, cursor: 'pointer' }}
            />
          </Box>

          <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 3, fontWeight: 500 }}>
            Connexion Administrateur
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#CC0A2B' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Mot de passe"
              name="mot_de_passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#CC0A2B' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                py: 1.2,
                backgroundColor: '#CC0A2B',
                '&:hover': { backgroundColor: '#a00823' },
                fontWeight: 'bold',
                mb: 2
              }}
            >
              Se connecter
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Accès sécurisé
              </Typography>
            </Divider>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
              Portail réservé au personnel administratif de Tunisair
            </Typography>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
