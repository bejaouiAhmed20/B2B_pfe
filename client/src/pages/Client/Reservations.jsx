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

  // Add function to generate PDF
  const generatePDF = (reservation) => {
    try {
      console.log('Starting PDF generation for reservation:', reservation.id);
      
      // Create a new jsPDF instance with portrait orientation
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add Tunisair logo/header with improved styling
      doc.setFillColor(204, 10, 43); // Tunisair red color
      doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('TUNISAIR B2B - FACTURE', 105, 16, { align: 'center' });
      doc.setFont(undefined, 'normal');
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Add a subtle background for the main content area
      doc.setFillColor(250, 250, 250);
      doc.rect(0, 25, 210, 252, 'F');
      
      // Reservation details with improved styling
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Détails de la Réservation', 14, 35);
      doc.setFont(undefined, 'normal');
      
      // Add a subtle divider line
      doc.setDrawColor(204, 10, 43);
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);
      
      doc.setFontSize(11);
      doc.text(`Numéro de Réservation: ${reservation.id}`, 14, 45);
      doc.text(`Date de Réservation: ${formatDate(reservation.date_reservation)}`, 14, 53);
      doc.text(`Statut: ${reservation.statut || 'Confirmée'}`, 14, 61);
      doc.text(`Nombre de Passagers: ${reservation.nombre_passagers || 1}`, 14, 69);
      
      // Make the price more prominent with a box around it
      doc.setFillColor(240, 240, 240);
      doc.rect(120, 65, 76, 20, 'F');
      doc.setDrawColor(204, 10, 43);
      doc.setLineWidth(1);
      doc.rect(120, 65, 76, 20, 'S'); // Add a red border
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('MONTANT TOTAL:', 125, 73);
      doc.setFontSize(16);
      doc.setTextColor(204, 10, 43);
      doc.text(`${reservation.prix_total || 0} DT`, 185, 78, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.setLineWidth(0.5);
      
      // Flight details with improved styling
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Détails du Vol', 14, 95);
      doc.setFont(undefined, 'normal');
      
      // Add a subtle divider line
      doc.line(14, 98, 196, 98);
      
      if (reservation.flight) {
        doc.setFontSize(11);
        doc.text(`Vol: ${reservation.flight.titre || 'Tunis - Paris'}`, 14, 105);
        doc.text(`Départ: ${reservation.flight.ville_depart || 'Tunis'}`, 14, 113);
        doc.text(`Arrivée: ${reservation.flight.ville_arrivee || 'Paris'}`, 14, 121);
        
        // Handle potential date formatting issues
        let departDate = 'N/A';
        let arriveDate = 'N/A';
        
        try {
          departDate = formatDate(reservation.flight.date_depart);
        } catch (e) {
          console.error('Error formatting departure date:', e);
        }
        
        try {
          arriveDate = formatDate(reservation.flight.date_arrivee);
        } catch (e) {
          console.error('Error formatting arrival date:', e);
        }
        
        doc.text(`Date de Départ: ${departDate}`, 14, 129);
        doc.text(`Date d'Arrivée: ${arriveDate}`, 14, 137);
        doc.text(`Compagnie: Tunisair`, 14, 145);
      } else {
        doc.setFontSize(11);
        doc.text('Vol: Tunis - Paris', 14, 105);
        doc.text('Départ: Tunis', 14, 113);
        doc.text('Arrivée: Paris', 14, 121);
        doc.text(`Date de Départ: ${formatDate(new Date())}`, 14, 129);
        doc.text(`Date d'Arrivée: ${formatDate(new Date())}`, 14, 137);
        doc.text('Compagnie: Tunisair', 14, 145);
      }
      
      // Add passenger information with improved styling
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Information Passager', 14, 163);
      doc.setFont(undefined, 'normal');
      
      // Add a subtle divider line
      doc.line(14, 166, 196, 166);
      
      const userData = JSON.parse(localStorage.getItem('user'));
      doc.setFontSize(11);
      doc.text(`Nom: ${userData?.nom || 'N/A'}`, 14, 173);
      doc.text(`Email: ${userData?.email || 'N/A'}`, 14, 181);
      doc.text(`Téléphone: ${userData?.telephone || userData?.numero_telephone || 'N/A'}`, 14, 189);
      
      // Add footer with terms and conditions
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Ce document est une facture électronique émise par Tunisair B2B. Pour toute question, veuillez contacter notre service client.', 105, 270, { align: 'center', maxWidth: 180 });
      
      // Save the PDF
      doc.save(`Reservation_${reservation.id}.pdf`);
      
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
        {reservations.map((reservation) => (
        <Grid item xs={12} key={reservation.id}>
        <Card 
          sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'visible',
            position: 'relative',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 24px rgba(0,0,0,0.12)'
            }
          }}
        >
          {/* Vertical status indicator */}
          <Box 
            sx={{ 
              position: 'absolute', 
              left: 0,
              top: 0,
              bottom: 0,
              width: '6px',
              bgcolor: 
                reservation.statut === 'Confirmée' ? 'success.main' : 
                reservation.statut === 'En attente' ? 'warning.main' : 
                'error.main',
              borderTopLeftRadius: 8
            }}
          />
          
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  mb: 3 
                }}>
                  <Typography variant="h5" component="div" sx={{ 
                    fontWeight: 700,
                    color: 'text.primary',
                    letterSpacing: -0.2
                  }}>
                    {reservation.flight?.titre || 'Vol'}
                  </Typography>
                  <Chip 
                    label={reservation.statut || 'Confirmée'} 
                    color={getStatusColor(reservation.statut || 'Confirmée')} 
                    size="small" 
                    sx={{ 
                      ml: 2,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    {[
                      { icon: <FlightTakeoff />, text: reservation.flight?.date_depart || 'Départ' },
                      { icon: <FlightLand />, text: reservation.flight?.date_retour.toLocaleString("en-US") || 'Arrivée' }
                    ].map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <Box sx={{
                          bgcolor: 'primary.light',
                          p: 1,
                          borderRadius: '50%',
                          mr: 2,
                          lineHeight: 0
                        }}>
                          {React.cloneElement(item.icon, { 
                            sx: { 
                              fontSize: 20,
                              color: 'primary.main' 
                            } 
                          })}
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.text}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    {[
                      { icon: <Event />, text: reservation.flight?.date_depart.toLocaleString() ? formatDate(reservation.flight.date_depart) : 'Date de départ' },
                      { icon: <People />, text: `${reservation.nombre_passagers || 1} passager(s)` }
                    ].map((item, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <Box sx={{
                          bgcolor: 'primary.light',
                          p: 1,
                          borderRadius: '50%',
                          mr: 2,
                          lineHeight: 0
                        }}>
                          {React.cloneElement(item.icon, { 
                            sx: { 
                              fontSize: 20,
                              color: 'primary.main' 
                            } 
                          })}
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.text}
                        </Typography>
                      </Box>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%',
                  justifyContent: 'space-between',
                  borderLeft: { sm: '1px solid', xs: 'none' },
                  borderColor: { sm: 'divider' },
                  pl: { sm: 3 },
                  mt: { xs: 2, sm: 0 }
                }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Réservation #{reservation.id}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      display: 'block',
                      mt: 0.5 
                    }}>
                      {formatDate(reservation.date_reservation)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ 
                      fontWeight: 700,
                      lineHeight: 1.2
                    }}>
                      {reservation.prix_total} DT
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
          
          <Divider sx={{ my: 0 }} />
          
          <CardActions sx={{ 
            justifyContent: 'flex-end', 
            p: 2,
            gap: 1,
            flexWrap: 'wrap' 
          }}>
            <Button 
              startIcon={<Info />}
              onClick={() => handleViewFlightDetails(reservation.flight)}
              sx={{ 
                mr: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              Détails
            </Button>
            
            <Button
              startIcon={<PictureAsPdf />}
              onClick={() => generatePDF(reservation)}
              sx={{ 
                '&:hover': { bgcolor: 'error.light' },
                color: 'error.main'
              }}
            >
              PDF
            </Button>
            
            {reservation.statut !== 'Annulée' && (
              <Button 
                variant="outlined" 
                color="error"
                startIcon={<Cancel />}
                onClick={() => setCancelDialog({ open: true, reservationId: reservation.id })}
                sx={{ 
                  borderWidth: 2,
                  '&:hover': { borderWidth: 2 }
                }}
              >
                Annuler
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
        ))}
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

export default Reservations;
