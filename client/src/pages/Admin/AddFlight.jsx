import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddFlight = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    titre: '',
    prix: '',
    date_depart: '',
    date_retour: '',
    compagnie_aerienne: '',
    duree: '',
    airport_depart_id: '',
    airport_arrivee_id: ''
  });

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/airports');
      setAirports(response.data);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Erreur lors du chargement des aéroports', 
        severity: 'error' 
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/flights', formData);
      setSnackbar({ open: true, message: 'Vol ajouté avec succès', severity: 'success' });
      setTimeout(() => navigate('/admin/flights'), 2000);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Une erreur est survenue', 
        severity: 'error' 
      });
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Ajouter un Vol
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="titre"
              label="Titre"
              value={formData.titre}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              placeholder="Ex: Paris - New York"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="prix"
              label="Prix"
              type="number"
              value={formData.prix}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputProps={{
                startAdornment: <span>€</span>,
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="duree"
              label="Durée"
              value={formData.duree}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              placeholder="Ex: 8h 15m"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="date_depart"
              label="Date et heure de départ"
              type="datetime-local"
              value={formData.date_depart}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="date_retour"
              label="Date et heure de retour"
              type="datetime-local"
              value={formData.date_retour}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="airport_depart_id"
              label="Aéroport de départ"
              select
              value={formData.airport_depart_id}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.nom} ({airport.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="airport_arrivee_id"
              label="Aéroport d'arrivée"
              select
              value={formData.airport_arrivee_id}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.nom} ({airport.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="compagnie_aerienne"
              label="Compagnie aérienne"
              value={formData.compagnie_aerienne}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
        </Grid>
        
        <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/admin/flights')}>
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

export default AddFlight;