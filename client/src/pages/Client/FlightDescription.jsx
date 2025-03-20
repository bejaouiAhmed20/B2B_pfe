import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

// Import our component modules
import FlightHeader from '../../components/flight/FlightHeader';
import FlightDetails from '../../components/flight/FlightDetails';
import FareOptions from '../../components/flight/FareOptions';
import ReservationForm from '../../components/flight/ReservationForm';

const FlightDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  
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

  // Fetch user balance
  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userData) {
        console.log('No token or user data found');
        return;
      }
      
      // Instead of fetching from /api/users/:id, fetch from /api/comptes/user/:userId
      const response = await axios.get(`http://localhost:5000/api/comptes/user/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // The compte endpoint returns the account with the solde property
      console.log('Account data from API:', response.data);
      // Convert the solde to a number explicitly
      setUserBalance(Number(response.data.solde) || 0);
      console.log('Set user balance to:', Number(response.data.solde) || 0);
    } catch (error) {
      console.error('Error fetching user balance:', error);
      // If there's an error (like no account found), set balance to 0
      setUserBalance(0);
    }
  };

  useEffect(() => {
    fetchFlightDetails();
    fetchUserBalance();
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
      coupon: e.target.checked ? prev.coupon : '',
      discountAmount: e.target.checked ? prev.discountAmount : 0
    }));
    
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
          severity: 'error'
        });
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/coupons/validate', {
        code: reservation.coupon
      });
      
      if (response.data.valid) {
        const coupon = response.data.coupon;
        setValidCoupon(coupon);
        
        // Calculate discount amount based on coupon type
        let discountAmount = 0;
        const basePrice = flight.prix * getCurrentFareMultiplier() * reservation.nombre_passagers;
        
        if (coupon.reduction_type === 'percentage') {
          discountAmount = (basePrice * coupon.reduction) / 100;
        } else {
          discountAmount = coupon.reduction;
        }
        
        setReservation(prev => ({
          ...prev,
          discountAmount
        }));
        
        setSnackbar({
          open: true,
          message: `Coupon appliqué avec succès! ${coupon.reduction_type === 'percentage' ? 
            `${coupon.reduction}% de réduction` : 
            `${coupon.reduction}€ de réduction`}`,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
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
      
      // Check if user has enough balance
      if (userBalance < finalPrice) {
        setShowBalanceWarning(true);
        setSnackbar({
          open: true,
          message: 'Solde insuffisant pour effectuer cette réservation.',
          severity: 'error'
        });
        return;
      }
  
      const reservationData = {
        flight_id: id,
        user_id: userData.id,
        date_reservation: new Date().toISOString().split('T')[0],
        nombre_passagers: reservation.nombre_passagers,
        prix_total: finalPrice > 0 ? finalPrice : 0,
        statut: 'Confirmée',
        coupon: validCoupon ? reservation.coupon : null,
        discount_amount: reservation.discountAmount,
        class_type: reservation.classType,
        fare_type: reservation.fareType
      };
  
      // Create the reservation
      const reservationResponse = await axios.post('http://localhost:5000/api/reservations', reservationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Get the user's account first
      const compteResponse = await axios.get(`http://localhost:5000/api/comptes/user/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const compteId = compteResponse.data.id;
      
      // Update account balance using the withdraw-funds endpoint
      await axios.post(`http://localhost:5000/api/comptes/${compteId}/withdraw-funds`, {
        amount: finalPrice
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Fetch the updated balance
      const updatedCompteResponse = await axios.get(`http://localhost:5000/api/comptes/user/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state with new balance
      setUserBalance(updatedCompteResponse.data.solde);
  
      setSnackbar({
        open: true,
        message: 'Réservation effectuée avec succès! Votre solde a été débité.',
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
      </Container>
    );
  }

  if (!flight) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Vol non trouvé</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <FlightHeader 
        flight={flight} 
        isFlightAvailable={isFlightAvailable} 
      />
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <FlightDetails 
            flight={flight} 
            formatDate={formatDate} 
          />
          
          <FareOptions 
            fareTypes={fareTypes} 
            reservation={reservation} 
            setReservation={setReservation} 
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <ReservationForm 
            flight={flight}
            reservation={reservation}
            handlePassengerChange={handlePassengerChange}
            handleCouponChange={handleCouponChange}
            handleCouponCheckboxChange={handleCouponCheckboxChange}
            applyCoupon={applyCoupon}
            handleReservation={handleReservation}
            isFlightAvailable={isFlightAvailable}
            fareTypes={fareTypes}
            getCurrentFareMultiplier={getCurrentFareMultiplier}
            validCoupon={validCoupon}
            userBalance={userBalance}
            showBalanceWarning={showBalanceWarning}
          />
        </Grid>
      </Grid>
      
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

export default FlightDescription;