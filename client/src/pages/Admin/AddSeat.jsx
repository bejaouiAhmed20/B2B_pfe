import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Grid,
  FormControlLabel,
  Switch
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddSeat = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    seatNumber: '',
    classType: 'economy',
    availability: true,
    idPlane: ''
  });

  useEffect(() => {
    fetchPlanes();
  }, []);

  const fetchPlanes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/planes');
      setPlanes(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des avions', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/seats', formData);
      showSnackbar('Siège ajouté avec succès', 'success');
      setTimeout(() => navigate('/admin/seats'), 2000);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Ajouter un Siège
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              name="seatNumber"
              label="Numéro de Siège"
              value={formData.seatNumber}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              helperText="Ex: 12A, 15B"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Classe</InputLabel>
              <Select
                name="classType"
                value={formData.classType}
                onChange={handleChange}
                label="Classe"
              >
                <MenuItem value="economy">Économique</MenuItem>
                <MenuItem value="business">Affaires</MenuItem>
                <MenuItem value="first">Première</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.availability}
                  onChange={handleChange}
                  name="availability"
                  color="primary"
                />
              }
              label="Disponible"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Avion</InputLabel>
              <Select
                name="idPlane"
                value={formData.idPlane}
                onChange={handleChange}
                label="Avion"
              >
                {planes.map((plane) => (
                  <MenuItem key={plane.idPlane} value={plane.idPlane}>
                    {plane.planeModel} (ID: {plane.idPlane})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default AddSeat;