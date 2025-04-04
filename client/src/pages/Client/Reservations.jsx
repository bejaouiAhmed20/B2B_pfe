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
  const [successMessage, setSuccessMessage] = useState(''); // Moved inside component
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
              // Check if flight object exists and has an id
              if (reservation.flight && reservation.flight.id) {
                const flightResponse = await axios.get(`http://localhost:5000/api/flights/${reservation.flight.id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                return { ...reservation, flight: flightResponse.data };
              } else if (reservation.flight_id) {
                // Fallback to flight_id if it exists
                const flightResponse = await axios.get(`http://localhost:5000/api/flights/${reservation.flight_id}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                return { ...reservation, flight: flightResponse.data };
              } else {
                console.warn(`Reservation ${reservation.id} has no flight information`);
                return reservation;
              }
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

  // Update the handleCancelReservation function to handle refunds
  const handleCancelReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      const reservation = reservations.find(r => r.id === cancelDialog.reservationId);
      
      if (!reservation) {
        setError('Réservation introuvable');
        setCancelDialog({ open: false, reservationId: null });
        return;
      }
      
      console.log('Cancelling reservation ID:', cancelDialog.reservationId);
      
      // Check if refund is eligible based on class_type and fare_type
      const isRefundEligible = 
        (reservation.class_type === 'economy' && reservation.fare_type === 'light') || 
        (reservation.class_type === 'Affaires');
      
      console.log('Cancellation details:', {
        id: cancelDialog.reservationId,
        isRefundEligible: isRefundEligible,
        amount: reservation.prix_total
      });
      
      // Make the API call with proper error handling
      try {
        const response = await axios.put(
          `http://localhost:5000/api/reservations/${cancelDialog.reservationId}/cancel`, 
          { 
            isRefundEligible: isRefundEligible,
            amount: reservation.prix_total 
          }, 
          { headers: { Authorization: `Bearer ${token}` }}
        );
        
        console.log('Cancel response:', response.data);
  
        // Update the local state
        setReservations(reservations.map(res => 
          res.id === cancelDialog.reservationId 
            ? { ...res, statut: 'Annulée' } 
            : res
        ));
    
        setCancelDialog({ open: false, reservationId: null });
        
        // Show success message
        if (isRefundEligible) {
          setSuccessMessage(`Votre réservation a été annulée avec succès. Un remboursement de ${reservation.prix_total}€ sera effectué dans les prochains jours.`);
        } else {
          setSuccessMessage('Votre réservation a été annulée avec succès. Aucun remboursement n\'est applicable pour ce type de billet.');
        }
      } catch (apiError) {
        console.error('API Error:', apiError);
        if (apiError.response) {
          console.error('Response status:', apiError.response.status);
          console.error('Response data:', apiError.response.data);
        }
        setError('Erreur lors de l\'annulation: ' + (apiError.response?.data?.message || apiError.message));
      }
    } catch (error) {
      console.error('Error in handleCancelReservation:', error);
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

  // Add this new state for flight details dialog
  const [flightDetailsDialog, setFlightDetailsDialog] = useState({
    open: false,
    flight: null
  });
  
  // Replace the handleViewFlightDetails function with this
  const handleViewFlightDetails = (flight) => {
    if (flight) {
      setFlightDetailsDialog({
        open: true,
        flight: flight
      });
    } else {
      console.error('Flight information is missing');
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
      
      {/* Add success message alert here */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}
      
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
              
              // Update the cancel button in CardActions
              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button 
                  startIcon={<Info />}
                  onClick={() => handleViewFlightDetails(reservation.flight)}
                  disabled={!reservation.flight}
                >
                  Détails du vol
                </Button>
                
                {reservation.statut !== 'Annulée' && (
                  <Button 
                    startIcon={<Cancel />}
                    color="error"
                    onClick={() => {
                      console.log('Cancel button clicked for reservation:', reservation.id);
                      setCancelDialog({ open: true, reservationId: reservation.id });
                    }}
                    disabled={reservation.statut === 'Annulée'}
                  >
                    Annuler
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, reservationId: null })}
      >
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.
          </DialogContentText>
          {cancelDialog.reservationId && (
            <DialogContentText sx={{ mt: 2 }}>
              {(() => {
                const reservation = reservations.find(r => r.id === cancelDialog.reservationId);
                if (!reservation) return '';
                
                const isRefundEligible = 
                  (reservation.class_type === 'economy' && reservation.fare_type === 'light') || 
                  (reservation.class_type === 'Affaires');
                
                return isRefundEligible 
                  ? "Vous êtes éligible à un remboursement pour cette annulation."
                  : "Cette annulation ne donne pas droit à un remboursement selon nos conditions.";
              })()}
            </DialogContentText>
          )}
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
      
      {/* Flight Details Dialog - Move this inside the component return */}
      <Dialog
        open={flightDetailsDialog.open}
        onClose={() => setFlightDetailsDialog({ open: false, flight: null })}
        maxWidth="md"
      >
        <DialogTitle>Détails du Vol</DialogTitle>
        <DialogContent>
          {flightDetailsDialog.flight ? (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {flightDetailsDialog.flight.titre || 'Vol'}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <FlightTakeoff sx={{ mr: 2, color: '#CC0A2B' }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Départ
                      </Typography>
                      <Typography variant="body1">
                        {flightDetailsDialog.flight.airport_depart?.nom || 'N/A'}, 
                        {flightDetailsDialog.flight.airport_depart?.ville || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {flightDetailsDialog.flight.date_depart ? formatDate(flightDetailsDialog.flight.date_depart) : 'N/A'}
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
                        {flightDetailsDialog.flight.airport_arrivee?.nom || 'N/A'}, 
                        {flightDetailsDialog.flight.airport_arrivee?.ville || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {flightDetailsDialog.flight.date_retour ? formatDate(flightDetailsDialog.flight.date_retour) : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body1" paragraph>
                <strong>Compagnie:</strong> {flightDetailsDialog.flight.compagnie || 'N/A'}
              </Typography>
              
              <Typography variant="body1" paragraph>
                <strong>Type d'avion:</strong> {flightDetailsDialog.flight.plane?.model || 'N/A'}
              </Typography>
              
              <Typography variant="body1" paragraph>
                <strong>Durée:</strong> {flightDetailsDialog.flight.duree || 'N/A'}
              </Typography>
              
              <Typography variant="body1" paragraph>
                <strong>Prix:</strong> {flightDetailsDialog.flight.prix || 'N/A'} €
              </Typography>
            </Box>
          ) : (
            <Typography>Aucune information disponible</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlightDetailsDialog({ open: false, flight: null })}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

// Export with the correct name
export default Reservations;