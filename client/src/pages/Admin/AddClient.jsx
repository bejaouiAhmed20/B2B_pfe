import React, { useState } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddClient = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    numero_telephone: '',
    pays: '',
    adresse: '',
    mot_de_passe: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users', formData);
      setSnackbar({ open: true, message: 'Client ajouté avec succès', severity: 'success' });
      setTimeout(() => navigate('/admin/clients'), 2000);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Une erreur est survenue', 
        severity: 'error' 
      });
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Ajouter un Client
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          name="nom"
          label="Nom"
          value={formData.nom}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="numero_telephone"
          label="Téléphone"
          value={formData.numero_telephone}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="pays"
          label="Pays"
          value={formData.pays}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="adresse"
          label="Adresse"
          value={formData.adresse}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          name="mot_de_passe"
          label="Mot de passe"
          type="password"
          value={formData.mot_de_passe}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        
        <div style={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/admin/clients')}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            style={{ backgroundColor: '#CC0A2B' }}
          >
            Ajouter
          </Button>
        </div>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddClient;