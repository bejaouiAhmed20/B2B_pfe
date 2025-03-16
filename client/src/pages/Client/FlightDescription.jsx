import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  AttachMoney,
  AirlineSeatReclineNormal,
  EventSeat,
  CalendarMonth,
  AirplaneTicket,
  ArrowBack
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const FlightDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reservation, setReservation] = useState({
    nombre_passagers: 1,
    prix_total: 0
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchFlightDetails();
  }, [id]);

  useEffect(() => {
    if (flight) {
      setReservation(prev => ({
        ...prev,
        prix_total: flight.prix * prev.nombre_passagers
      }));
    }
  }, [flight, reservation.nombre_passagers]);

  const fetchFlightDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/flights/${id}`);
      setFlight(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching flight details:', error);
      setError('Impossible de charger les détails du vol. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handlePassengerChange = (e) => {
    const value = parseInt(e.target.value);
    setReservation(prev => ({
      ...prev,
      nombre_passagers: value
    }));
  };

  const handleReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login', { state: { redirectTo: `/client/flights/${id}` } });
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user'));
      
      const reservationData = {
        flight_id: id,
        user_id: userData.id,
        date_reservation: new Date().toISOString().split('T')[0],
        nombre_passagers: reservation.nombre_passagers,
        prix_total: reservation.prix_total,
        statut: 'En attente'
      };

      await axios.post('http://localhost:5000/api/reservations', reservationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSnackbar({
        open: true,
        message: 'Réservation effectuée avec succès!',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/client/reservations');
      }, 2000);
    } catch (error) {
      console.error('Error making reservation:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la réservation: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/client/flights')}
          sx={{ mt: 2 }}
        >
          Retour aux vols
        </Button>
      </Container>
    );
  }

  if (!flight) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Vol non trouvé</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/client/flights')}
          sx={{ mt: 2 }}
        >
          Retour aux vols
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/client/flights')}
        sx={{ mb: 3 }}
      >
        Retour aux vols
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {flight.titre}
        </Typography>
        
        <Chip 
          label={flight.est_disponible ? "Disponible" : "Complet"} 
          color={flight.est_disponible ? "success" : "error"}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Détails du vol
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FlightTakeoff sx={{ mr: 2, color: '#CC0A2B' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      Départ
                    </Typography>
                    <Typography variant="body1">
                      {flight.airport_depart?.nom || 'N/A'}, {flight.airport_depart?.ville || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(flight.date_depart)}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FlightLand sx={{ mr: 2, color: '#1976d2' }} />
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      Arrivée
                    </Typography>
                    <Typography variant="body1">
                      {flight.airport_arrivee?.nom || 'N/A'}, {flight.airport_arrivee?.ville || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(flight.date_retour)}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <AccessTime color="primary" />
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        Durée
                      </Typography>
                      <Typography variant="body1" align="center">
                        {flight.duree || 'N/A'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <AirlineSeatReclineNormal color="primary" />
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        Compagnie
                      </Typography>
                      <Typography variant="body1" align="center">
                        {flight.compagnie_aerienne}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <EventSeat color="primary" />
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        Classe
                      </Typography>
                      <Typography variant="body1" align="center">
                        {flight.classe || 'Économique'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <CalendarMonth color="primary" />
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        Type
                      </Typography>
                      <Typography variant="body1" align="center">
                        {flight.date_retour ? 'Aller-retour' : 'Aller simple'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            
            {flight.description && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {flight.description}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Réservation
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Typography variant="h4" color="primary">
                    <AttachMoney sx={{ verticalAlign: 'top', fontSize: '1.5rem' }} />
                    {flight.prix} € <Typography component="span" variant="body2">/ personne</Typography>
                  </Typography>
                </Box>
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Nombre de passagers</InputLabel>
                  <Select
                    value={reservation.nombre_passagers}
                    onChange={handlePassengerChange}
                    label="Nombre de passagers"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <MenuItem key={num} value={num}>{num}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 1, mb: 3 }}>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Prix unitaire:</span>
                    <span>{flight.prix} €</span>
                  </Typography>
                  <Typography variant="body1" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Nombre de passagers:</span>
                    <span>{reservation.nombre_passagers}</span>
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total:</span>
                    <span>{reservation.prix_total} €</span>
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<AirplaneTicket />}
                  onClick={handleReservation}
                  disabled={!flight.est_disponible}
                  sx={{ 
                    backgroundColor: '#CC0A2B',
                    '&:hover': {
                      backgroundColor: '#A00823',
                    }
                  }}
                >
                  Réserver maintenant
                </Button>
                
                {!flight.est_disponible && (
                  <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
                    Ce vol n'est plus disponible à la réservation
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
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
    </Container>
  );
};

export default FlightDescription;