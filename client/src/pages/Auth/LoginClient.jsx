import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const LoginClient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // In your handleSubmit function, make sure you're using the correct endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Fixed: Using the correct field name from formData
      const response = await axios.post('http://localhost:5000/api/auth/loginClient', {
        email: formData.email,
        mot_de_passe: formData.mot_de_passe // Changed from password to mot_de_passe to match your form field
      });
      
      // Store token and user info in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect to client dashboard
      navigate('/client');  // Changed from /client/Home to /client to match your route structure
    } catch (error) {
      console.error('Login error:', error);
      setError('Une erreur est survenue lors de la connexion. Veuillez vérifier vos identifiants.');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Connexion Client
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          
          <TextField
            label="Mot de passe"
            type="password"
            name="mot_de_passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5, 
              backgroundColor: '#CC0A2B',
              '&:hover': {
                backgroundColor: '#A00823',
              }
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Se connecter'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Vous n'avez pas de compte ?{' '}
              <Link to="/register" style={{ color: '#CC0A2B', textDecoration: 'none' }}>
                S'inscrire
              </Link>
            </Typography>
          </Box>
          
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2">
              <Link to="/forgot-password" style={{ color: '#666', textDecoration: 'none' }}>
                Mot de passe oublié ?
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginClient;