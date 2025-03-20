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
  Snackbar,
  Checkbox,
  FormControlLabel
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
  ArrowBack,
  LocalOffer,
  CheckCircleOutline,
  HighlightOff
} from '@mui/icons-material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const FlightDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Define fare types and their price multipliers
  const fareTypes = {
    economy: [
      { 
        id: 'light', 
        name: 'LIGHT', 
        multiplier: 1.0, 
        description: 'Tarif de base sans bagages',
        features: [
          { text: 'Bagage de Cabine 08kg', included: true },
          { text: 'Repas inclus', included: true },
          { text: 'Payant', included: false },
          { text: 'Modifiable avec frais', included: false },
          { text: 'Non Remboursable', included: false }
        ]
      },
      { 
        id: 'classic', 
        name: 'CLASSIC', 
        multiplier: 1.2, 
        description: 'Inclut un bagage en soute',
        features: [
          { text: 'Bagage de Cabine 08kg', included: true },
          { text: 'Bagage en soute 1 pièce de 23 kg', included: true },
          { text: 'Repas inclus', included: true },
          { text: 'Les sièges standards sont gratuits', included: true },
          { text: 'Modifiable avec frais', included: false },
          { text: 'Non Remboursable', included: false }
        ]
      },
      { 
        id: 'flex', 
        name: 'FLEX', 
        multiplier: 1.5, 
        description: 'Modification et annulation gratuites',
        features: [
          { text: 'Bagage de Cabine 08kg', included: true },
          { text: 'Bagage en soute 1 pièce de 23 kg', included: true },
          { text: 'Repas inclus', included: true },
          { text: 'Les sièges standards et préférentiels sont gratuits', included: true },
          { text: 'Permis sans frais avant la date du départ du vol', included: true },
          { text: 'Remboursable avec frais si tout le voyage n\'est pas entamé', included: true }
        ]
      }
    ],
    business: [
      { 
        id: 'confort', 
        name: 'CONFORT', 
        multiplier: 2.0, 
        description: 'Siège plus spacieux et repas premium',
        features: [
          { text: 'Bagage de Cabine 10kg', included: true },
          { text: 'Bagage en soute 2 pièces de 23 kg chacune', included: true },
          { text: 'Repas inclus', included: true },
          { text: 'Sélection de siège Gratuite', included: true },
          { text: 'Lounge Gratuit si disponible', included: true },
          { text: 'Fast Track Gratuit si disponible', included: true },
          { text: 'Modifiable avec frais', included: false },
          { text: 'Remboursable avec frais si tout le voyage n\'est pas entamé', included: true }
        ]
      },
      { 
        id: 'privilege', 
        name: 'PRIVILEGE', 
        multiplier: 2.5, 
        description: 'Service VIP et accès au salon',
        features: [
          { text: 'Bagage de Cabine 10kg', included: true },
          { text: 'Bagage en soute 2 pièces de 23 kg chacune', included: true },
          { text: 'Repas inclus', included: true },
          { text: 'Sélection de siège Gratuite', included: true },
          { text: 'Lounge Gratuit si disponible', included: true },
          { text: 'Fast Track Gratuit si disponible', included: true },
          { text: 'Modifiable sans frais', included: true },
          { text: 'Remboursable sans frais', included: true }
        ]
      }
    ]
  };
  
  const [reservation, setReservation] = useState({
    nombre_passagers: 1,
    prix_total: 0,
    coupon: '',
    hasCoupon: false,
    discountAmount: 0,
    classType: 'economy', // Default to economy class
    fareType: 'light' // Default to light fare
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [validCoupon, setValidCoupon] = useState(null);

  // Get current fare multiplier based on selected class and fare type
  const getCurrentFareMultiplier = () => {
    const selectedFares = fareTypes[reservation.classType];
    const selectedFare = selectedFares.find(fare => fare.id === reservation.fareType);
    return selectedFare ? selectedFare.multiplier : 1.0;
  };

  // Add a function to check if flight is available based on departure date
  const isFlightAvailable = (departureDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const departure = new Date(departureDate);
    departure.setHours(0, 0, 0, 0);
    
    // Flight is available if departure date is in the future
    return departure > today;
  };

  useEffect(() => {
    fetchFlightDetails();
  }, [id]);

  useEffect(() => {
    if (flight) {
      // Calculate the base price with fare multiplier
      const basePrice = flight.prix * getCurrentFareMultiplier() * reservation.nombre_passagers;
      
      // Apply discount if there's a valid coupon
      let finalPrice = basePrice;
      if (validCoupon && reservation.discountAmount > 0) {
        finalPrice = basePrice - reservation.discountAmount;
      }
      
      setReservation(prev => ({
        ...prev,
        prix_total: finalPrice > 0 ? finalPrice : 0
      }));
    }
  }, [flight, reservation.nombre_passagers, reservation.discountAmount, reservation.classType, reservation.fareType, validCoupon]);

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

  // Add these two missing functions
  const handleClassTypeChange = (e) => {
    const newClassType = e.target.value;
    // When changing class type, select the first fare type of that class
    const firstFareType = fareTypes[newClassType][0].id;
    
    setReservation(prev => ({
      ...prev,
      classType: newClassType,
      fareType: firstFareType
    }));
  };

  const handleFareTypeChange = (e) => {
    setReservation(prev => ({
      ...prev,
      fareType: e.target.value
    }));
  };

  const handleCouponChange = (e) => {
    setReservation(prev => ({
      ...prev,
      coupon: e.target.value
    }));
    // Reset valid coupon when the code changes
    setValidCoupon(null);
  };

  const handleCouponCheckboxChange = (e) => {
    setReservation(prev => ({
      ...prev,
      hasCoupon: e.target.checked,
      // Reset coupon and discount if checkbox is unchecked
      ...(e.target.checked ? {} : { coupon: '', discountAmount: 0 })
    }));
    
    // Reset valid coupon when checkbox is unchecked
    if (!e.target.checked) {
      setValidCoupon(null);
    }
  };

  const applyCoupon = async () => {
    try {
      if (!reservation.coupon.trim()) {
        setSnackbar({
          open: true,
          message: 'Veuillez entrer un code coupon',
          severity: 'warning'
        });
        return;
      }

      // Call the API to validate the coupon
      const response = await axios.post('http://localhost:5000/api/coupons/validate', {
        code: reservation.coupon
      });

      if (response.data.valid) {
        // Store the valid coupon data
        setValidCoupon(response.data.coupon);
        
        // Calculate discount based on coupon type
        const basePrice = flight.prix * getCurrentFareMultiplier() * reservation.nombre_passagers;
        let discountAmount = 0;
        
        if (response.data.coupon.reduction_type === 'percentage') {
          // Calculate percentage discount
          discountAmount = (basePrice * response.data.coupon.reduction) / 100;
        } else {
          // Fixed amount discount
          discountAmount = response.data.coupon.reduction;
          // Make sure discount doesn't exceed the total price
          if (discountAmount > basePrice) {
            discountAmount = basePrice;
          }
        }
        
        setReservation(prev => ({
          ...prev,
          discountAmount: discountAmount
        }));
        
        setSnackbar({
          open: true,
          message: `Coupon appliqué ! ${response.data.coupon.reduction_type === 'percentage' ? 
            `Réduction de ${response.data.coupon.reduction}%` : 
            `Réduction de ${response.data.coupon.reduction}€`}`,
          severity: 'success'
        });
      } else {
        setValidCoupon(null);
        setReservation(prev => ({
          ...prev,
          discountAmount: 0
        }));
        
        setSnackbar({
          open: true,
          message: response.data.message || 'Code coupon invalide',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setValidCoupon(null);
      setReservation(prev => ({
        ...prev,
        discountAmount: 0
      }));
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Erreur lors de l\'application du coupon',
        severity: 'error'
      });
    }
  };

  const handleReservation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login-client', { state: { redirectTo: `/client/flights/${id}` } });
        return;
      }

      // Check if flight is available before proceeding
      if (!isFlightAvailable(flight.date_depart)) {
        setSnackbar({
          open: true,
          message: 'Ce vol n\'est plus disponible à la réservation.',
          severity: 'error'
        });
        return;
      }

      const userData = JSON.parse(localStorage.getItem('user'));
      
      // Calculate the final price with fare multiplier and discount
      const basePrice = flight.prix * getCurrentFareMultiplier() * reservation.nombre_passagers;
      const finalPrice = basePrice - reservation.discountAmount;
      
      const reservationData = {
        flight_id: id,
        user_id: userData.id,
        date_reservation: new Date().toISOString().split('T')[0],
        nombre_passagers: reservation.nombre_passagers,
        prix_total: finalPrice > 0 ? finalPrice : 0,
        statut: 'En attente',
        coupon: validCoupon ? reservation.coupon : null,
        discount_amount: reservation.discountAmount,
        class_type: reservation.classType,
        fare_type: reservation.fareType
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
          label={isFlightAvailable(flight.date_depart) ? "Disponible" : "Complet"} 
          color={isFlightAvailable(flight.date_depart) ? "success" : "error"}
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
            
            {/* Add class and fare type selection here */}
            <Card sx={{ mb: 3, mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Options de voyage
                </Typography>
                
                {/* Class type selection with visual tabs */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Choisissez votre classe
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1, 
                    overflow: 'hidden'
                  }}>
                    <Box 
                      onClick={() => setReservation(prev => ({ 
                        ...prev, 
                        classType: 'economy',
                        fareType: 'light' 
                      }))}
                      sx={{ 
                        flex: 1, 
                        p: 2, 
                        textAlign: 'center',
                        bgcolor: reservation.classType === 'economy' ? '#CC0A2B' : 'transparent',
                        color: reservation.classType === 'economy' ? 'white' : 'inherit',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: reservation.classType === 'economy' ? '#CC0A2B' : '#f5f5f5'
                        }
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={reservation.classType === 'economy' ? 'bold' : 'normal'}>
                        Économique
                      </Typography>
                    </Box>
                    <Box 
                      onClick={() => setReservation(prev => ({ 
                        ...prev, 
                        classType: 'business',
                        fareType: 'confort' 
                      }))}
                      sx={{ 
                        flex: 1, 
                        p: 2, 
                        textAlign: 'center',
                        bgcolor: reservation.classType === 'business' ? '#CC0A2B' : 'transparent',
                        color: reservation.classType === 'business' ? 'white' : 'inherit',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: reservation.classType === 'business' ? '#CC0A2B' : '#f5f5f5'
                        }
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={reservation.classType === 'business' ? 'bold' : 'normal'}>
                        Affaires
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                {/* Fare type selection with cards */}
                <Typography variant="subtitle2" gutterBottom>
                  Sélectionnez votre tarif en {reservation.classType === 'economy' ? 'Économique' : 'Affaires'}
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, overflowX: 'auto', pb: 1 }}>
                  {fareTypes[reservation.classType].map(fare => (
                    <Card 
                      key={fare.id} 
                      onClick={() => setReservation(prev => ({ ...prev, fareType: fare.id }))}
                      sx={{ 
                        minWidth: 180, 
                        cursor: 'pointer',
                        border: reservation.fareType === fare.id ? '2px solid #CC0A2B' : '1px solid #e0e0e0',
                        boxShadow: reservation.fareType === fare.id ? '0 4px 8px rgba(204, 10, 43, 0.2)' : 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
                        },
                        flex: '0 0 auto',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Box sx={{ 
                        bgcolor: reservation.fareType === fare.id ? '#CC0A2B' : 'grey.100', 
                        color: reservation.fareType === fare.id ? 'white' : 'text.primary',
                        p: 1.5,
                        textAlign: 'center'
                      }}>
                        <Typography variant="h6" fontWeight="bold">
                          {fare.name}
                        </Typography>
                      </Box>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {fare.description}
                        </Typography>
                        <Typography variant="h6" color="primary" align="center" sx={{ my: 1 }}>
                          {(flight.prix * fare.multiplier).toFixed(2)} €
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ mt: 1 }}>
                          {fare.features.slice(0, 3).map((feature, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                              {feature.included ? 
                                <CheckCircleOutline sx={{ mr: 1, fontSize: '0.9rem', color: 'success.main' }} /> : 
                                <HighlightOff sx={{ mr: 1, fontSize: '0.9rem', color: 'error.main' }} />
                              }
                              <Typography variant="body2" noWrap>
                                {feature.text}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                
                {/* Display selected fare features in detail */}
                <Box sx={{ 
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText', 
                  p: 2, 
                  borderRadius: 1, 
                  mt: 3,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AirplaneTicket sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Détails du tarif {fareTypes[reservation.classType].find(fare => fare.id === reservation.fareType)?.name}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: 'primary.contrastText', opacity: 0.3 }} />
                  <Grid container spacing={1}>
                    {fareTypes[reservation.classType]
                      .find(fare => fare.id === reservation.fareType)
                      ?.features.map((feature, index) => (
                        <Grid item xs={12} sm={6} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            {feature.included ? 
                              <CheckCircleOutline sx={{ mr: 1, fontSize: '1rem', color: '#8eff8e' }} /> : 
                              <HighlightOff sx={{ mr: 1, fontSize: '1rem', color: '#ff8e8e' }} />
                            }
                            <Typography variant="body2">
                              {feature.text}
                            </Typography>
                          </Box>
                        </Grid>
                      ))
                    }
                  </Grid>
                </Box>
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
                
                {/* Remove class type and fare type selection from here */}
                
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
                
                {/* Existing coupon section */}
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={reservation.hasCoupon}
                        onChange={handleCouponCheckboxChange}
                        color="primary"
                      />
                    }
                    label="J'ai un code promo"
                  />
                  
                  {reservation.hasCoupon && (
                    <Box sx={{ display: 'flex', mt: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Code promo"
                        value={reservation.coupon}
                        onChange={handleCouponChange}
                        placeholder="Entrez votre code"
                        InputProps={{
                          startAdornment: (
                            <LocalOffer sx={{ color: 'action.active', mr: 1, fontSize: '1.2rem' }} />
                          ),
                        }}
                      />
                      <Button 
                        variant="outlined" 
                        onClick={applyCoupon}
                        sx={{ ml: 1 }}
                      >
                        Appliquer
                      </Button>
                    </Box>
                  )}
                </Box>
                
                {/* Enhanced price summary box */}
                <Box sx={{ 
                  bgcolor: 'background.paper', 
                  p: 2, 
                  borderRadius: 1, 
                  mb: 3,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Résumé du prix
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Prix unitaire (base)</Typography>
                    <Typography variant="body2">{flight.prix} €</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Classe & Tarif
                    </Typography>
                    <Typography variant="body2">
                      {reservation.classType === 'economy' ? 'Économique' : 'Affaires'} - 
                      <span style={{ fontWeight: 'bold', color: '#CC0A2B' }}>
                        {fareTypes[reservation.classType].find(fare => fare.id === reservation.fareType)?.name}
                      </span>
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Prix unitaire (ajusté)</Typography>
                    <Typography variant="body2" fontWeight="medium">{(flight.prix * getCurrentFareMultiplier()).toFixed(2)} €</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Nombre de passagers</Typography>
                    <Typography variant="body2">{reservation.nombre_passagers}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pt: 1, borderTop: '1px dashed #e0e0e0' }}>
                    <Typography variant="body2" color="text.secondary">Sous-total</Typography>
                    <Typography variant="body2" fontWeight="medium">{(flight.prix * getCurrentFareMultiplier() * reservation.nombre_passagers).toFixed(2)} €</Typography>
                  </Box>
                  
                  {reservation.discountAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalOffer sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                        Réduction
                      </Typography>
                      <Typography variant="body2" color="success.main" fontWeight="medium">-{reservation.discountAmount.toFixed(2)} €</Typography>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mt: 2,
                    pt: 1.5,
                    borderTop: '2px solid #e0e0e0',
                    alignItems: 'center'
                  }}>
                    <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">{reservation.prix_total.toFixed(2)} €</Typography>
                  </Box>
                </Box>
                
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<AirplaneTicket />}
                  onClick={handleReservation}
                  disabled={!isFlightAvailable(flight.date_depart)}
                  sx={{ 
                    backgroundColor: '#CC0A2B',
                    '&:hover': {
                      backgroundColor: '#A00823',
                    },
                    py: 1.5,
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 12px rgba(204, 10, 43, 0.3)',
                    mb: 2
                  }}
                >
                  Réserver maintenant
                </Button>
                
                {!isFlightAvailable(flight.date_depart) && (
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