import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Snackbar, 
  Alert 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddReservation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date_reservation: new Date().toISOString().split('T')[0],
    statut: 'En attente',
    prix_total: 0,
    nombre_passagers: 1,
    user_id: '',
    flight_id: ''
  });

  const [users, setUsers] = useState([]);
  const [flights, setFlights] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUsers();
    fetchFlights();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Erreur lors du chargement des utilisateurs', 'error');
    }
  };

  const fetchFlights = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/flights');
      setFlights(response.data);
    } catch (error) {
      console.error('Error fetching flights:', error);
      showSnackbar('Erreur lors du chargement des vols', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If changing flight, update price based on flight price and number of passengers
    if (name === 'flight_id' || name === 'nombre_passagers') {
      const updatedFormData = {
        ...formData,
        [name]: value
      };
      
      if (name === 'flight_id' && value) {
        const selectedFlight = flights.find(flight => flight.id === value);
        if (selectedFlight) {
          updatedFormData.prix_total = selectedFlight.prix * updatedFormData.nombre_passagers;
        }
      } else if (name === 'nombre_passagers' && formData.flight_id) {
        const selectedFlight = flights.find(flight => flight.id === formData.flight_id);
        if (selectedFlight) {
          updatedFormData.prix_total = selectedFlight.prix * value;
        }
      }
      
      setFormData(updatedFormData);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('http://localhost:5000/api/reservations', formData);
      showSnackbar('Réservation ajoutée avec succès');
      setTimeout(() => {
        navigate('/admin/reservations');
      }, 2000);
    } catch (error) {
      console.error('Error adding reservation:', error);
      showSnackbar('Erreur lors de l\'ajout de la réservation: ' + 
        (error.response?.data?.message || error.message), 'error');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Ajouter une Réservation
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              name="date_reservation"
              label="Date de réservation"
              type="date"
              value={formData.date_reservation}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Statut</InputLabel>
              <Select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
              >
                <MenuItem value="Confirmée">Confirmée</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Annulée">Annulée</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Client</InputLabel>
              <Select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.nom} ({user.email})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth required>
              <InputLabel>Vol</InputLabel>
              <Select
                name="flight_id"
                value={formData.flight_id}
                onChange={handleChange}
              >
                {flights.map(flight => (
                  <MenuItem key={flight.id} value={flight.id}>
                    {flight.titre} ({flight.compagnie_aerienne})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="nombre_passagers"
              label="Nombre de passagers"
              type="number"
              value={formData.nombre_passagers}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              name="prix_total"
              label="Prix Total (€)"
              type="number"
              value={formData.prix_total}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{
                readOnly: formData.flight_id !== '',
              }}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button 
              type="submit" 
              variant="contained" 
              sx={{ 
                mr: 2,
                backgroundColor: '#CC0A2B',
                '&:hover': {
                  backgroundColor: '#A00823',
                }
              }}
            >
              Ajouter
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/admin/reservations')}
            >
              Annuler
            </Button>
          </Grid>
        </Grid>
      </form>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddReservation;