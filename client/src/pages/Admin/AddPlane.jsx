import React, { useState } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPlane = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    planeModel: '',
    totalSeats: '',
    seatConfiguration: ''
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
      await axios.post('http://localhost:5000/api/planes', formData);
      setSnackbar({ open: true, message: 'Avion ajouté avec succès', severity: 'success' });
      setTimeout(() => navigate('/admin/planes'), 2000);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Une erreur est survenue', 
        severity: 'error' 
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Ajouter un Avion
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="planeModel"
              label="Modèle d'Avion"
              value={formData.planeModel}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              helperText="Ex: Boeing 737, Airbus A320"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="totalSeats"
              label="Nombre Total de Sièges"
              type="number"
              value={formData.totalSeats}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="seatConfiguration"
              label="Configuration des Sièges"
              value={formData.seatConfiguration}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              helperText="Ex: 3-3, 2-2"
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              fullWidth
              sx={{ mt: 2 }}
            >
              Ajouter
            </Button>
          </Grid>
        </Grid>
      </form>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddPlane;