import React, { useState } from 'react';
import { Button, TextField, Typography, Paper, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
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
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate to admin dashboard
      navigate('/admin');
    } catch (error) {
      setError(error.response?.data?.message || 'Une erreur est survenue');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Paper elevation={3} className="p-8 w-full max-w-md">
        <Typography variant="h5" component="h1" gutterBottom>
          Connexion Tunisair
        </Typography>
        
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <TextField 
            label="Email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            variant="outlined" 
            fullWidth 
            required 
          />
          <TextField 
            label="Mot de passe" 
            name="mot_de_passe"
            value={formData.mot_de_passe}
            onChange={handleChange}
            type="password" 
            variant="outlined" 
            fullWidth 
            required 
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth
            style={{ backgroundColor: '#CC0A2B' }}
          >
            Se connecter
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Login;
