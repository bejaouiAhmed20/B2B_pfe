import React from 'react';
import { Button, TextField, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  
  const handleLogin = (e) => {
    e.preventDefault();
    // Add your authentication logic here
    navigate('/admin'); // Navigate to admin dashboard after login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Paper elevation={3} className="p-8 w-full max-w-md">
        <Typography variant="h5" component="h1" gutterBottom>
          Connexion Tunisair
        </Typography>
        <form onSubmit={handleLogin} className="space-y-4">
          <TextField 
            label="Email" 
            variant="outlined" 
            fullWidth 
            required 
          />
          <TextField 
            label="Mot de passe" 
            type="password" 
            variant="outlined" 
            fullWidth 
            required 
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Se connecter
          </Button>
        </form>
      </Paper>
    </div>
  );
};

export default Login;
