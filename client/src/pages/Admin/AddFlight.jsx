import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddFlight = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [planes, setPlanes] = useState([]); // Add state for planes
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    titre: '',
    prix: '',
    date_depart: '',
    date_retour: '',
    duree: '',
    airport_depart_id: '',
    airport_arrivee_id: '',
    plane_id: '' // Changed from compagnie_aerienne
  });

  useEffect(() => {
    fetchAirports();
    fetchPlanes(); // Add function to fetch planes
  }, []);

  const fetchAirports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/airports');
      setAirports(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des aéroports', 'error');
    }
  };

  // Add function to fetch planes
  const fetchPlanes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/planes');
      console.log('Planes data:', response.data); // Add this to debug
      setPlanes(response.data);
    } catch (error) {
      console.error('Error fetching planes:', error);
      showSnackbar('Erreur lors du chargement des avions', 'error');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/flights', formData);
      showSnackbar('Vol ajouté avec succès');
      setTimeout(() => {
        navigate('/admin/flights');
      }, 2000);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ajouter un Vol
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              name="titre"
              label="Titre"
              value={formData.titre}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
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
                endAdornment: <InputAdornment position="end">DT</InputAdornment>,
              }}
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
              <MenuItem value="">Sélectionner un aéroport</MenuItem>
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
              <MenuItem value="">Sélectionner un aéroport</MenuItem>
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.nom} ({airport.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Replace compagnie_aerienne with plane selection */}
          <Grid item xs={12} md={6}>
            <TextField
              name="plane_id"
              label="Avion"
              select
              value={formData.plane_id}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="">Sélectionner un avion</MenuItem>
              {planes.length > 0 ? (
                planes.map((plane) => (
                  <MenuItem key={plane.idPlane} value={plane.idPlane}>
                    {plane.planeModel || 'Avion'} ({plane.totalSeats} sièges)
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Aucun avion disponible</MenuItem>
              )}
            </TextField>
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
              placeholder="Ex: 2h 30m"
            />
          </Grid>
          <Grid item xs={12}>
            <Button 
              type="submit" 
              variant="contained" 
              style={{ backgroundColor: '#CC0A2B', marginTop: 20 }}
              fullWidth
            >
              Ajouter
            </Button>
          </Grid>
        </Grid>
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