import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  DialogActions,
  Snackbar,
  Pagination // Add pagination component
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
import { useNavigate } from 'react-router-dom';

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    reservationId: null
  });
  
  // Add pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5; // Limit number of items per page

  useEffect(() => {
    fetchUserReservations();
  }, [page]); // Refetch when page changes

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

      // Get all reservations with flight data in a single request using axios instead of api service
      const response = await axios.get(`http://localhost:5000/api/reservations/user/${userData.id}`);
      
      // No need for additional flight fetching as the backend now includes this data
      const allReservations = response.data || [];
      
      // Calculate total pages
      setTotalPages(Math.ceil(allReservations.length / itemsPerPage));
      
      // Paginate the data client-side
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedReservations = allReservations.slice(startIndex, startIndex + itemsPerPage);
      
      setReservations(paginatedReservations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      if (error.response && error.response.status === 404) {
        setReservations([]);
      } else {
        setError('Impossible de charger vos réservations');
      }
      setLoading(false);
    }
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleCancelReservation = async (reservation) => {
    try {
      setLoading(true);
      
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData) {
        setSnackbar({
          open: true,
          message: 'Utilisateur non connecté',
          severity: 'error'
        });
        setLoading(false);
        return;
      }
      
      // Use the cancelReservation endpoint instead of manually updating status
      await axios.put(`http://localhost:5000/api/reservations/${reservation.id}/cancel`, {
        isRefundEligible: 
          (reservation.class_type === 'economy' && reservation.fare_type === 'light') || 
          (reservation.class_type === 'Affaires')
      });
      
      setSuccessMessage('Réservation annulée avec succès! Votre compte a été remboursé.');
      
      // Refresh the reservations list
      fetchUserReservations();
      
      setCancelDialog({ open: false, reservationId: null });
      setLoading(false);
    } catch (error) {
      console.error('Error canceling reservation:', error);
      setError('Une erreur est survenue lors de l\'annulation');
      setLoading(false);
      setCancelDialog({ open: false, reservationId: null });
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

  const [flightDetailsDialog, setFlightDetailsDialog] = useState({
    open: false,
    flight: null
  });
  
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

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
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
                          {reservation.prix_total} DT
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Add allocated seats section */}
                {reservation.allocatedSeats && reservation.allocatedSeats.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Sièges réservés
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {reservation.allocatedSeats.map((seat) => (
                        <Chip 
                          key={seat.id}
                          label={`${seat.seatNumber} (${seat.classType === 'economy' ? 'Économique' : 'Affaires'})`}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
              
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
                    variant="contained"
                    color="error"
                    onClick={() => {
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
      
      {/* Add pagination controls */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
          />
        </Box>
      )}
      
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
          <Button 
            onClick={() => {
              const reservation = reservations.find(r => r.id === cancelDialog.reservationId);
              if (reservation) {
                handleCancelReservation(reservation);
              }
            }} 
            color="error" 
            autoFocus
          >
            Oui, annuler ma réservation
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Flight Details Dialog */}
      <Dialog
        open={flightDetailsDialog.open}
        onClose={() => setFlightDetailsDialog({ open: false, flight: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Détails du Vol</DialogTitle>
        <DialogContent>
          {flightDetailsDialog.flight ? (
            <Box>
              <Typography variant="h5" gutterBottom color="primary">
                {flightDetailsDialog.flight.titre || 'Vol'}
              </Typography>
              
              <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FlightTakeoff sx={{ mr: 2, color: '#CC0A2B' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">Départ</Typography>
                        <Typography variant="body1">
                          {flightDetailsDialog.flight.date_depart ? formatDate(flightDetailsDialog.flight.date_depart) : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <FlightLand sx={{ mr: 2, color: '#1976d2' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">Arrivée</Typography>
                        <Typography variant="body1">
                          {flightDetailsDialog.flight.date_retour ? formatDate(flightDetailsDialog.flight.date_retour) : 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Informations sur l'avion</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Modèle</Typography>
                    <Typography variant="body1" gutterBottom>
                      {flightDetailsDialog.flight.plane?.planeModel || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Nombre total de sièges</Typography>
                    <Typography variant="body1" gutterBottom>
                      {flightDetailsDialog.flight.plane?.totalSeats || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Configuration des sièges</Typography>
                    <Typography variant="body1" gutterBottom>
                      {flightDetailsDialog.flight.plane?.seatConfiguration || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Durée du vol</Typography>
                    <Typography variant="body1" gutterBottom>
                      {flightDetailsDialog.flight.duree || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Informations tarifaires</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Prix de base</Typography>
                    <Typography variant="body1" gutterBottom>
                      {flightDetailsDialog.flight.prix} DT
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Statut du vol</Typography>
                    <Chip 
                      label={flightDetailsDialog.flight.status || 'N/A'} 
                      color={flightDetailsDialog.flight.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
              
              {/* If there are allocated seats for this reservation */}
              {reservations.find(r => r.flight?.id === flightDetailsDialog.flight.id)?.allocatedSeats?.length > 0 && (
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Sièges réservés</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {reservations.find(r => r.flight?.id === flightDetailsDialog.flight.id)?.allocatedSeats.map((seat) => (
                      <Chip 
                        key={seat.id}
                        label={`${seat.seatNumber} (${seat.classType === 'economy' ? 'Économique' : 'Affaires'})`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Paper>
              )}
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
      {/* Add Snackbar here, inside the return statement */}
<Snackbar
  open={snackbar.open}
  autoHideDuration={6000}
  onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert 
    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
    severity={snackbar.severity}
    variant="filled"
    sx={{ width: '100%' }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>
    </Container>
  );
};

export default Reservations;
