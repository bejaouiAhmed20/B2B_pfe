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

const AddAirport = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nom: '',
    code_iata: '',
    ville: '',
    pays: '',
    latitude: '',
    longitude: ''
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
      await axios.post('http://localhost:5000/api/airports', formData);
      setSnackbar({ open: true, message: 'Aéroport ajouté avec succès', severity: 'success' });
      setTimeout(() => navigate('/admin/airports'), 2000);
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
        Ajouter un Aéroport
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          name="nom"
          label="Nom de l'aéroport"
          value={formData.nom}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="code_iata"
          label="Code IATA"
          value={formData.code_iata}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="ville"
          label="Ville"
          value={formData.ville}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="pays"
          label="Pays"
          value={formData.pays}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="latitude"
          label="Latitude"
          type="number"
          value={formData.latitude}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          inputProps={{ step: "any" }}
        />
        <TextField
          name="longitude"
          label="Longitude"
          type="number"
          value={formData.longitude}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          inputProps={{ step: "any" }}
        />
        
        <div style={{ marginTop: 20, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/admin/airports')}>
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

export default AddAirport;