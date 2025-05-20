import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
  Pagination
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  Event,
  People,
  AttachMoney,
  Cancel,
  Info,
  PictureAsPdf
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
dayjs.locale('fr');

// Import logo
import logo from '../../assets/Tunisair-Logo.png'; // Make sure this path is correct

const formatDateTime = (date) => dayjs(date).format('dddd D MMMM YYYY [à] HH:mm');


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
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('user'));

      if (!token || !userData) {
        setError('Vous devez être connecté pour accéder à cette page');
        setLoading(false);
        return;
      }

      // Get all reservations with flight data in a single request using the API service
      const response = await api.get(`/reservations/user/${userData.id}`);

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

      // Use the cancelReservation endpoint with the API service
      await api.put(`/reservations/${reservation.id}/cancel`, {
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

  // Add function to generate PDF - Fixed to be async and handle logo properly
  const generatePDF = async (reservation) => {
    try {
      console.log('Starting PDF generation for reservation:', reservation.id);

      // Create a new jsPDF instance with portrait orientation
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Change background color to white instead of red
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 30, 'F');

      // Add a thin red line at the bottom of the header for visual separation
      doc.setDrawColor(204, 10, 43);
      doc.setLineWidth(1);
      doc.line(0, 30, 210, 30);

      // Logo - Handle with proper error checking
      try {
        const logoImg = new Image();
        logoImg.src = logo;
        await new Promise((resolve, reject) => {
          logoImg.onload = () => {
            // Adjust logo position and size for better layout
            // Reduced height to 15mm (from 20mm) and adjusted width proportionally
            doc.addImage(logoImg, 'PNG', 20, 8, 25, 15);
            resolve();
          };
          logoImg.onerror = () => {
            console.warn('Logo could not be loaded, continuing without it');
            resolve();
          };
          // Set a timeout in case the image never loads or errors
          setTimeout(resolve, 3000);
        });
      } catch (logoError) {
        console.warn('Error loading logo:', logoError);
        // Continue without the logo
      }

      // Title - Change text color to red instead of white
      doc.setTextColor(204, 10, 43);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text('FACTURE DE RÉSERVATION', 130, 18, { align: 'center' });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);

      // Détails Réservation
      doc.setFont(undefined, 'bold');
      doc.text('Détails de la Réservation', 14, 40);
      doc.setFont(undefined, 'normal');
      doc.setLineWidth(0.5);
      doc.setDrawColor(204, 10, 43);
      doc.line(14, 42, 196, 42);
      doc.setFontSize(10);
      doc.text(`Numéro: ${reservation.id}`, 14, 48);
      doc.text(`Date: ${formatDate(reservation.date_reservation)}`, 14, 54);
      doc.text(`Statut: ${reservation.statut}`, 14, 60);
      doc.text(`Passagers: ${reservation.nombre_passagers}`, 14, 66);
      doc.text(`Classe: ${reservation.class_type}`, 14, 72);
      doc.text(`Type de Tarif: ${reservation.fare_type}`, 14, 78);

      // Total Box
      doc.setFillColor(245, 245, 245);
      doc.rect(120, 48, 76, 22, 'F');
      doc.setDrawColor(204, 10, 43);
      doc.setLineWidth(0.8);
      doc.rect(120, 48, 76, 22);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('TOTAL:', 125, 56);
      doc.setFontSize(16);
      doc.setTextColor(204, 10, 43);
      doc.text(`${reservation.prix_total} DT`, 190, 63, { align: 'right' });
      doc.setTextColor(0, 0, 0);

      // Vol
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Détails du Vol', 14, 90);
      doc.setFont(undefined, 'normal');
      doc.setLineWidth(0.5);
      doc.line(14, 92, 196, 92);
      doc.setFontSize(10);
      doc.text(`Titre: ${reservation.flight?.titre || 'N/A'}`, 14, 98);
      doc.text(`Départ: ${formatDate(reservation.flight?.date_depart) || 'N/A'}`, 14, 104);
      doc.text(`Retour: ${formatDate(reservation.flight?.date_retour) || 'N/A'}`, 14, 110);
      doc.text(`Durée: ${reservation.flight?.duree || 'N/A'}`, 14, 116);
      doc.text(`Statut: ${reservation.flight?.status || 'N/A'}`, 14, 122);

      // Passager
      doc.setFont(undefined, 'bold');
      doc.text('Informations du Passager', 14, 135);
      doc.setFont(undefined, 'normal');
      doc.line(14, 137, 196, 137);
      const user = reservation.user || {};
      doc.setFontSize(10);
      doc.text(`Nom: ${user.nom || 'N/A'}`, 14, 143);
      doc.text(`Email: ${user.email || 'N/A'}`, 14, 149);
      doc.text(`Téléphone: ${user.numero_telephone || 'N/A'}`, 14, 155);
      doc.text(`Adresse: ${user.adresse || 'N/A'}`, 14, 161);
      doc.text(`Pays: ${user.pays || 'N/A'}`, 14, 167);

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text('Ce document est généré automatiquement par Tunisair B2B.', 105, 285, { align: 'center' });
      doc.text('Pour toute question, contactez-nous à contact@tunisair.com', 105, 290, { align: 'center' });

      doc.save(`Facture_${reservation.id}.pdf`);
      setSnackbar({
        open: true,
        message: 'Facture téléchargée avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la génération de la facture',
        severity: 'error'
      });
    }
  };

  // If loading, show loading indicator
  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <Container>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Se connecter
          </Button>
        </Paper>
      </Container>
    );
  }

  // Add Snackbar component to show messages
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom>
        Mes Réservations
      </Typography>

      <Grid container spacing={3}>
        {reservations.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Vous n'avez aucune réservation pour le moment.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          reservations.map((reservation) => (
            <Grid item xs={12} md={6} key={reservation.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {reservation.flight?.titre || 'Vol'}
                    </Typography>
                    <Chip
                      label={reservation.statut}
                      color={getStatusColor(reservation.statut)}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FlightTakeoff sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Départ
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {reservation.flight?.date_depart ? formatDate(reservation.flight.date_depart) : 'N/A'}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FlightLand sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Arrivée
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {reservation.flight?.date_retour ? formatDate(reservation.flight.date_retour) : 'N/A'}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <People sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Passagers
                        </Typography>
                      </Box>
                      <Typography variant="body2">
                        {reservation.nombre_passagers || 1}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AttachMoney sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                        <Typography variant="body2" color="text.secondary">
                          Prix Total
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {reservation.prix_total} DT
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Classe: <Chip size="small" label={reservation.class_type === 'economy' ? 'Économique' : 'Affaires'} />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Type de tarif: <Chip size="small" label={reservation.fare_type} />
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<Info />}
                    onClick={() => handleViewFlightDetails(reservation.flight)}
                  >
                    Détails
                  </Button>

                  <Button
                    size="small"
                    startIcon={<PictureAsPdf />}
                    onClick={() => generatePDF(reservation)}
                  >
                    Facture
                  </Button>

                  {reservation.statut !== 'Annulée' && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => setCancelDialog({ open: true, reservationId: reservation.id })}
                      sx={{ ml: 'auto' }}
                    >
                      Annuler
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add pagination at the bottom */}
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Reservations;
