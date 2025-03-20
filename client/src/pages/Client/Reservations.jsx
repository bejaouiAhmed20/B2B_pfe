import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  Event,
  People,
  AttachMoney,
  Cancel,
  Info
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Renamed to match the file name
const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    reservationId: null
  });

  useEffect(() => {
    fetchUserReservations();
  }, []);

  const fetchUserReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userData) {
        setError('Vous devez être connecté pour accéder à cette page');
        setLoading(false);
        return;
      }

      // Modified to handle 404 responses properly
      try {
        const response = await axios.get(`http://localhost:5000/api/reservations/user/${userData.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
                                                                                                                                                                                                             
        // Fetch flight details for each reservation
        const reservationsWithFlights = await Promise.all(
          response.data.map(async (reservation) => {
            try {
              const flightResponse = await axios.get(`http://localhost:5000/api/flights/${reservation.flight_id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return { ...reservation, flight: flightResponse.data };
            } catch (flightError) {
              console.error(`Error fetching flight details for reservation ${reservation.id}:`, flightError);
              return reservation;
            }
          })
        );
        
        setReservations(reservationsWithFlights);
      } catch (apiError) {
        if (apiError.response && apiError.response.status === 404) {
          // No reservations found - set empty array instead of error
          setReservations([]);
        } else {
          throw apiError; // Re-throw for the outer catch block
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Impossible de charger vos réservations');
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:5000/api/reservations/${cancelDialog.reservationId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local state to reflect the cancellation
      setReservations(reservations.map(reservation => 
        reservation.id === cancelDialog.reservationId 
          ? { ...reservation, statut: 'Annulée' } 
          : reservation
      ));

      setCancelDialog({ open: false, reservationId: null });
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      setError('Impossible d\'annuler la réservation');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmée':
        return 'success';
      case 'En attente':
        return 'warning';
      case 'Annulée':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleViewFlightDetails = (flightId) => {
    if (flightId) {
      navigate(`/client/flights/${flightId}`);
    } else {
      console.error('Flight ID is missing');
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
      </Container>
    );
  }

  if (reservations.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Vous n'avez aucune réservation
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Explorez nos vols disponibles et réservez votre prochain voyage dès maintenant.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/client/flights')}
            sx={{ 
              mt: 2,
              backgroundColor: '#CC0A2B',
              '&:hover': {
                backgroundColor: '#A00823',
              }
            }}
          >
            Voir les vols
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mes Réservations
      </Typography>
      
      <Grid container spacing={3}>
        {reservations.map((reservation) => (
          <Grid item xs={12} key={reservation.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {reservation.flight?.titre || 'Vol'}
                  </Typography>
                  <Chip 
                    label={reservation.statut} 
                    color={getStatusColor(reservation.statut)}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FlightTakeoff sx={{ mr: 2, color: '#CC0A2B' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Départ
                        </Typography>
                        <Typography variant="body1">
                          {reservation.flight?.airport_depart?.nom || 'N/A'}, {reservation.flight?.airport_depart?.ville || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reservation.flight?.date_depart ? formatDate(reservation.flight.date_depart) : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <FlightLand sx={{ mr: 2, color: '#1976d2' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Arrivée
                        </Typography>
                        <Typography variant="body1">
                          {reservation.flight?.airport_arrivee?.nom || 'N/A'}, {reservation.flight?.airport_arrivee?.ville || 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {reservation.flight?.date_retour ? formatDate(reservation.flight.date_retour) : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Event sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Date de réservation
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(reservation.date_reservation)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <People sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Passagers
                        </Typography>
                        <Typography variant="body1">
                          {reservation.nombre_passagers}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Prix total
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {reservation.prix_total} €
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button 
                  startIcon={<Info />}
                  onClick={() => handleViewFlightDetails(reservation.flight_id)}
                  disabled={!reservation.flight_id}
                >
                  Détails du vol
                </Button>
                
                {reservation.statut !== 'Annulée' && (
                  <Button 
                    startIcon={<Cancel />}
                    color="error"
                    onClick={() => setCancelDialog({ open: true, reservationId: reservation.id })}
                    disabled={reservation.statut === 'Annulée' || 
                             (reservation.flight?.date_depart && new Date(reservation.flight.date_depart) < new Date())}
                  >
                    Annuler
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, reservationId: null })}
      >
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog({ open: false, reservationId: null })}>
            Non, garder ma réservation
          </Button>
          <Button onClick={handleCancelReservation} color="error" autoFocus>
            Oui, annuler ma réservation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Export with the correct name
export default Reservations;