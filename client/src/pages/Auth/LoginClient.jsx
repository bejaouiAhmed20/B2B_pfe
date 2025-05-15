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
  Divider,
  Link as MuiLink,
  CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import logo from '../../assets/Tunisair-Logo.png';

const LoginClient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/auth/loginClient', {
        email: formData.email,
        mot_de_passe: formData.mot_de_passe
      });
      
      // Check if token exists in response
      if (!response.data.token) {
        throw new Error('No token received from server');
      }
      
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      console.log('Login successful, token stored');
      
      // Check if there's a redirect path stored
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      if (redirectPath) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectPath);
      } else {
        // Default redirect to client dashboard
        navigate('/client');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Une erreur est survenue lors de la connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('https://images.unsplash.com/photo-1569154941061-e231b4725ef1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: 2,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 2 }}>
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
          
          <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 1, fontWeight: 500 }}>
            Espace Client Professionnel
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Connectez-vous pour accéder à votre espace client
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
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
              disabled={loading}
              sx={{ 
                py: 1.2, 
                backgroundColor: '#CC0A2B',
                '&:hover': { backgroundColor: '#a00823' },
                fontWeight: 'bold',
                mb: 2
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Se connecter'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Options
              </Typography>
            </Divider>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                <MuiLink component="span" underline="hover" sx={{ color: '#CC0A2B' }}>
                  Mot de passe oublié ?
                </MuiLink>
              </Link>
              <Link to="/contact" style={{ textDecoration: 'none' }}>
    <MuiLink component="span" underline="hover" sx={{ color: '#CC0A2B' }}>
      Besoin d'aide ?
    </MuiLink>
  </Link>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginClient;
