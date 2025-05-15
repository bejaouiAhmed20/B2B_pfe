import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Radio,
    RadioGroup,
    FormControlLabel,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Grid,
    Chip,
    Container,
    Stack,
    Avatar,
    LinearProgress,
    styled,
    Button,
    TextField,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Alert,
    Divider,
    Box,
    Paper,
    Skeleton
} from '@mui/material';
import {
    FlightTakeoff,
    FlightLand,
    AirplaneTicket,
    Schedule,
    AirlineSeatReclineNormal,
    BusinessCenter,
    Weekend,
    LocalOffer,
    CheckCircle,
    Error as ErrorIcon,
    ArrowForward,
    EventSeat
} from '@mui/icons-material';

const GradientContainer = styled('div')({
  background: 'linear-gradient(to right, #fff, #f9f9f9)',
  minHeight: '100vh',
  padding: '3rem 1rem',
  fontFamily: "'Roboto', sans-serif"
});

const GlassCard = styled(Card)(() => ({
  borderRadius: '20px',
  background: '#ffffffcc',
  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.07)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}));

const PriceChip = styled(Chip)(() => ({
  background: 'linear-gradient(90deg, #b71c1c, #d32f2f)',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: 'bold',
  padding: '0.4rem 1rem',
  borderRadius: '10px'
}));

// Add this component before the MakeReservation function
const AirportInfo = ({ airport }) => {
  if (!airport) return null;
  
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {airport.nom || 'N/A'} {airport.code ? `(${airport.code})` : ''}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {airport.location?.ville || 'N/A'}{airport.pays ? `, ${airport.pays}` : ''}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={100}
        sx={{
          height: 5,
          borderRadius: 5,
          mt: 1,
          background: 'rgba(0,0,0,0.1)',
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #b71c1c, #ef5350)'
          }
        }}
      />
    </Stack>
  );
};

// Add this component before the MakeReservation function
const InfoItem = ({ icon, title, value }) => (
  <Stack direction="row" spacing={2} alignItems="center">
    <Avatar sx={{ bgcolor: '#f5f5f5' }}>{icon}</Avatar>
    <Stack>
      <Typography variant="body2" color="text.secondary">{title}</Typography>
      <Typography variant="h6" fontWeight="bold">{value}</Typography>
    </Stack>
  </Stack>
);

function MakeReservation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userContract, setUserContract] = useState(null);
  const [contractCoupon, setContractCoupon] = useState(null);
  const [priceType, setPriceType] = useState('base'); // 'base' or 'fixed'
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Get available fare types based on selected class
  const getAvailableFareTypes = () => {
    return fareTypes[formData.class_type] || [];
  };

  // Get selected fare type details
  const getSelectedFareType = () => {
    const availableFares = getAvailableFareTypes();
    return availableFares.find(fare => fare.id === formData.fare_type) || null;
  };

  const [formData, setFormData] = useState({
    nombre_passagers: 1,
    class_type: 'economy',
    fare_type: 'light',
    coupon_code: ''
  });

  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState(false);

  const fetchUserContractAndBalance = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData) return;

      const accountRes = await axios.get(`http://localhost:5000/api/comptes/user/${userData.id}`);
      setUserBalance(Number(accountRes.data.solde) || 0);

      const contractRes = await axios.get(`http://localhost:5000/api/contracts/client/${userData.id}`);
      if (contractRes.data && contractRes.data.length > 0) {
        const activeContract = contractRes.data.find(c => c.isActive) || contractRes.data[0];
        setUserContract(activeContract);
        if (activeContract.coupon) {
          setContractCoupon(activeContract.coupon);
        }
      }
    } catch (err) {
      console.error('Error fetching user contract or balance:', err);
    }
  };

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/flights/${id}`);
        setFlight(response.data);
      } catch (err) {
        setError('An error occurred while fetching flight details.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
    fetchUserContractAndBalance();
  }, [id]);

  const handleReservation = async () => {
    try {
      setIsSubmitting(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setSubmitMessage("Utilisateur non connecté.");
        setSubmitError(true);
        return;
      }

      const selectedFare = getSelectedFareType();
      const multiplier = selectedFare ? selectedFare.multiplier : 1.0;
      
      const pricePerTicket = priceType === 'fixed' && userContract?.fixedTicketPrice
        ? parseFloat(userContract.fixedTicketPrice)
        : parseFloat(flight.prix) * multiplier;
      
      const total = pricePerTicket * parseInt(formData.nombre_passagers);
      
      if (userBalance < total) {
        setSubmitMessage("❌ Solde insuffisant pour cette réservation.");
        setSubmitError(true);
        return;
      }

      // Check if there are enough seats available
      const availableSeats = flight.availableSeats && 
        (formData.class_type === 'business' 
          ? (flight.availableSeats.business || 0) 
          : (flight.availableSeats.economy || 0));
          
      if (availableSeats < parseInt(formData.nombre_passagers)) {
        setSubmitMessage(`❌ Pas assez de sièges disponibles en classe ${formData.class_type === 'business' ? 'Affaires' : 'Économie'}.`);
        setSubmitError(true);
        return;
      }

      const payload = {
        user_id: user.id,
        flight_id: flight.id,
        date_reservation: new Date().toISOString(),
        statut: 'confirmed',
        prix_total: total,
        nombre_passagers: parseInt(formData.nombre_passagers),
        class_type: formData.class_type,
        fare_type: formData.fare_type,
        coupon: priceType === 'base' ? formData.coupon_code || null : null,
        discount_amount: 0,
        use_contract_price: priceType === 'fixed'
      };

      await axios.post('http://localhost:5000/api/reservations/', payload);
      setSubmitMessage("✅ Réservation réussie !");
      setSubmitError(false);
      
      // Redirect after successful reservation
      setTimeout(() => {
        navigate('/client/reservations');
      }, 2000);
    } catch (err) {
      setSubmitMessage(err.response?.data?.message || "❌ Erreur lors de la réservation.");
      setSubmitError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GradientContainer>
      <Container maxWidth="lg">
        {loading ? (
          <Stack height="80vh" justifyContent="center" alignItems="center">
            <CircularProgress size={60} sx={{ color: '#b71c1c' }} />
            <Typography variant="h6" color="text.secondary" mt={2}>
              Chargement des détails du vol...
            </Typography>
          </Stack>
        ) : error ? (
          <GlassCard sx={{ textAlign: 'center', p: 4 }}>
            <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/client/flights')}
            >
              Retour à la liste des vols
            </Button>
          </GlassCard>
        ) : (
          <Stack spacing={5}>
            {/* Breadcrumb Navigation */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'transparent' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'text.secondary'
                }}
              >
                Vols 
                <ArrowForward sx={{ mx: 1, fontSize: 16 }} /> 
                <Typography component="span" fontWeight="bold" color="primary">
                  {flight?.titre || 'Détails du vol'}
                </Typography>
              </Typography>
            </Paper>
            
            {/* Display Balance and Contract */}
            <GlassCard>
              <CardContent>
                <Typography variant="h6" color="primary" gutterBottom>
                  Informations utilisateur
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>Solde disponible:</strong> {userBalance} TND
                    </Typography>
                  </Grid>
                  {userContract && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1">
                        <strong>Contrat:</strong> {userContract.label || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Prix fixe: {userContract.fixedTicketPrice || '—'} TND
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Paiement différé: {userContract.payLater ? 'Oui' : 'Non'}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                
                {contractCoupon && (
                  <Box mt={2} p={1.5} bgcolor="rgba(245, 124, 0, 0.1)" borderRadius={1}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <LocalOffer sx={{ color: '#f57c00' }} />
                      <Typography variant="body2">
                        <strong>Coupon contrat:</strong> {contractCoupon.code} - 
                        {contractCoupon.reduction_type === 'percentage'
                          ? ` ${contractCoupon.reduction}% de réduction`
                          : ` ${contractCoupon.reduction} TND de réduction`}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </GlassCard>
            
            {/* Flight Title */}
            <GlassCard>
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} 
                  justifyContent="space-between" 
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  spacing={2}
                >
                  <Typography variant="h4" fontWeight={700} color="#212121">
                    {flight.titre}
                  </Typography>
                  <PriceChip label={`${flight.prix} TND`} />
                </Stack>

                {/* Schedule */}
                <Grid container spacing={4} sx={{ mt: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#b71c1c' }}>
                        <Schedule />
                      </Avatar>
                      <Stack>
                        <Typography variant="body2" color="text.secondary">Départ</Typography>
                        <Typography variant="h6">
                          {flight.date_depart ? new Date(flight.date_depart).toLocaleString() : 'N/A'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: '#c62828' }}>
                        <Schedule />
                      </Avatar>
                      <Stack>
                        <Typography variant="body2" color="text.secondary">Retour</Typography>
                        <Typography variant="h6">
                          {flight.date_retour ? new Date(flight.date_retour).toLocaleString() : 'N/A'}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </GlassCard>

            {/* Airports */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <GlassCard>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <FlightTakeoff sx={{ color: '#b71c1c', fontSize: 34 }} />
                      <Typography variant="h6">Départ</Typography>
                    </Stack>
                    {flight.airport_depart ? (
                      <AirportInfo airport={flight.airport_depart} />
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        Information non disponible
                      </Typography>
                    )}
                  </CardContent>
                </GlassCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <GlassCard>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                      <FlightLand sx={{ color: '#c62828', fontSize: 34 }} />
                      <Typography variant="h6">Arrivée</Typography>
                    </Stack>
                    {flight.arrival_airport ? (
                      <AirportInfo airport={flight.arrival_airport} />
                    ) : (
                      <Typography variant="body1" color="text.secondary">
                        Information non disponible
                      </Typography>
                    )}
                  </CardContent>
                </GlassCard>
              </Grid>
            </Grid>

            {/* Seats */}
            <GlassCard>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <AirplaneTicket sx={{ color: '#6a1b9a', fontSize: 34 }} />
                  <Typography variant="h6">Cabines</Typography>
                </Stack>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <InfoItem 
                      icon={<BusinessCenter sx={{ color: '#b71c1c' }} />} 
                      title="Affaires" 
                      value={flight.availableSeats?.business || 'N/A'} 
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoItem 
                      icon={<Weekend sx={{ color: '#388e3c' }} />} 
                      title="Économie" 
                      value={flight.availableSeats?.economy || 'N/A'} 
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <InfoItem 
                      icon={<AirlineSeatReclineNormal sx={{ color: '#6a1b9a' }} />} 
                      title="Sièges totaux" 
                      value={flight.plane?.totalSeats || 'N/A'} 
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </GlassCard>

            {/* Reservation Form */}
            <GlassCard>
              <CardContent>
                <Typography variant="h5" mb={3} fontWeight={600} color="#b71c1c">
                  Réserver ce vol
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Stack spacing={3}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Nombre de passagers"
                        type="number"
                        fullWidth
                        value={formData.nombre_passagers}
                        onChange={(e) => setFormData({ ...formData, nombre_passagers: e.target.value })}
                        inputProps={{ min: 1, max: 10 }}
                        helperText={`Maximum: ${formData.class_type === 'business' 
                          ? (flight.availableSeats?.business || 0) 
                          : (flight.availableSeats?.economy || 0)} sièges disponibles`}
                      />
                    </Grid>
                    
                    {userContract?.fixedTicketPrice && (
                      <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                          <FormControl component="fieldset">
                            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                              Choisissez le type de prix :
                            </Typography>
                            <RadioGroup
                              value={priceType}
                              onChange={(e) => setPriceType(e.target.value)}
                              row
                            >
                              <FormControlLabel 
                                value="base" 
                                control={<Radio />} 
                                label={`Prix de base (${flight.prix} TND)`} 
                              />
                              <FormControlLabel 
                                value="fixed" 
                                control={<Radio />} 
                                label={`Prix fixe du contrat (${userContract.fixedTicketPrice} TND)`} 
                              />
                            </RadioGroup>
                          </FormControl>
                        </Paper>
                      </Grid>
                    )}

                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Classe</InputLabel>
                        <Select
                          value={formData.class_type}
                          onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
                          label="Classe"
                        >
                          <MenuItem value="economy" disabled={!flight.availableSeats?.economy}>
                            Économie {!flight.availableSeats?.economy && "(Complet)"}
                          </MenuItem>
                          <MenuItem value="business" disabled={!flight.availableSeats?.business}>
                            Affaires {!flight.availableSeats?.business && "(Complet)"}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Type de tarif</InputLabel>
                        <Select
                          value={formData.fare_type}
                          onChange={(e) => setFormData({ ...formData, fare_type: e.target.value })}
                          label="Type de tarif"
                        >
                          {getAvailableFareTypes().map(fare => (
                            <MenuItem key={fare.id} value={fare.id}>
                              {fare.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {priceType === 'base' && (
                    <TextField
                      label="Code promo (optionnel)"
                      fullWidth
                      value={formData.coupon_code}
                      onChange={(e) => setFormData({ ...formData, coupon_code: e.target.value })}
                    />
                  )}

                  {/* Price Summary */}
                  <Box p={2} bgcolor="rgba(0,0,0,0.02)" borderRadius={2} mt={2}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Résumé du prix
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={8}>Prix par passager:</Grid>
                      <Grid item xs={4} textAlign="right">
                      {priceType === 'fixed' && userContract?.fixedTicketPrice
                        ? `${userContract.fixedTicketPrice} TND`
                        : `${(flight.prix * (getSelectedFareType()?.multiplier || 1)).toFixed(2)} TND`}
                      </Grid>
                      
                      <Grid item xs={8}>Nombre de passagers:</Grid>
                      <Grid item xs={4} textAlign="right">{formData.nombre_passagers}</Grid>
                      
                      <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                      
                      <Grid item xs={8}>
                        <Typography fontWeight="bold">Total:</Typography>
                      </Grid>
                      <Grid item xs={4} textAlign="right">
                        <Typography fontWeight="bold">
                          {((priceType === 'fixed' && userContract?.fixedTicketPrice
                            ? parseFloat(userContract.fixedTicketPrice)
                            : parseFloat(flight.prix) * (getSelectedFareType()?.multiplier || 1)) * parseInt(formData.nombre_passagers)).toFixed(2)} TND
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

                  <Button
                    variant="contained"
                    sx={{ 
                      backgroundColor: '#b71c1c', 
                      mt: 2,
                      py: 1.5,
                      '&:hover': {
                        backgroundColor: '#8f0000'
                      }
                    }}
                    onClick={handleReservation}
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                  >
                    {isSubmitting ? 'Traitement en cours...' : 'Confirmer la réservation'}
                  </Button>

                  {submitMessage && (
                    <Alert 
                      severity={submitError ? 'error' : 'success'}
                      variant="filled"
                      sx={{ mt: 2 }}
                    >
                      {submitMessage}
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </GlassCard>
          </Stack>
        )}
      </Container>
    </GradientContainer>
  );
}

export default MakeReservation;


{/* Fare Type Details */}
{getSelectedFareType() && (
  <Box mt={2} p={3} bgcolor="rgba(183, 28, 28, 0.05)" borderRadius={2}>
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      {getSelectedFareType().name} - {getSelectedFareType().description}
    </Typography>
    
    <Grid container spacing={2} mt={1}>
      {getSelectedFareType().features.map((feature, index) => (
        <Grid item xs={12} sm={6} key={index}>
          <Stack direction="row" spacing={1} alignItems="center">
            {feature.included ? (
              <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
            ) : (
              <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
            )}
            <Typography variant="body2">
              {feature.text}
            </Typography>
          </Stack>
        </Grid>
      ))}
    </Grid>
    
    {getSelectedFareType().multiplier !== 1.0 && (
      <Box mt={2} p={1} bgcolor="rgba(0,0,0,0.03)" borderRadius={1}>
        <Typography variant="body2" color="text.secondary">
          Multiplicateur de prix: x{getSelectedFareType().multiplier}
        </Typography>
      </Box>
    )}
  </Box>
)}
