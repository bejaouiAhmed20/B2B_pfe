import React, { useState, useEffect } from 'react';
import {
  Typography ,
  Container,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import our component modules
import FlightHeader from '../../components/flight/FlightHeader';
import FlightDetails from '../../components/flight/FlightDetails';
import FareOptions from '../../components/flight/FareOptions';
import ReservationForm from '../../components/flight/ReservationForm';

// Import the API service instead of axios
import api from '../../services/api';

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
    fareType: 'light', // Default to light fare
    priceType: 'base', // Default to base price
    fixedPrice: null // For contract fixed price
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const [validCoupon, setValidCoupon] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationError, setReservationError] = useState(false);

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
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData) {
        console.log('No user data found');
        return;
      }
      
      // Use the api service instead of axios
      const response = await api.get(`/comptes/user/${userData.id}`);
      
      console.log('Account data from API:', response.data);
      setUserBalance(Number(response.data.solde) || 0);
      console.log('Set user balance to:', Number(response.data.solde) || 0);
    } catch (error) {
      console.error('Error fetching user balance:', error);
      setUserBalance(0);
    }
  };

  // Fetch available seats for the flight
  const fetchAvailableSeats = async () => {
    try {
      if (!id) return;
      
      const response = await axios.get(`http://localhost:5000/api/flights/${id}/seats`);
      
      if (response.data) {
        setFlight(prevFlight => ({
          ...prevFlight,
          availableSeats: response.data
        }));
      }
    } catch (error) {
      console.error('Error fetching available seats:', error);
    }
  };

  // Fetch flight details
  const fetchFlightDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching flight details for ID:', id);
      
      // Use direct axios call to ensure we're getting the right endpoint
      const response = await axios.get(`http://localhost:5000/api/flights/${id}`);
      
      console.log('Flight data received:', response.data);
      
      if (response.data) {
        // Set the flight data including availableSeats that comes directly from the API
        setFlight(response.data);
        
        // Update the reservation price based on the flight price
        setReservation(prev => ({
          ...prev,
          prix_total: response.data.prix * prev.nombre_passagers * getCurrentFareMultiplier()
        }));
        
        // No need to call fetchAvailableSeats() since the data is already included
        console.log('Available seats from API:', response.data.availableSeats);
      } else {
        setError('Aucune information de vol trouvée');
      }
    } catch (error) {
      console.error('Error fetching flight details:', error);
      setError('Erreur lors du chargement des détails du vol');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlightDetails();
    fetchUserBalance();
  }, [id]);

  useEffect(() => {
    if (flight) {
      // Calculate the base price based on price type
      let basePrice;
      
      if (reservation.priceType === 'fixed' && reservation.fixedPrice) {
        // Use fixed contract price
        basePrice = reservation.fixedPrice * reservation.nombre_passagers;
      } else {
        // Use regular base price with fare multiplier
        basePrice = flight.prix * getCurrentFareMultiplier() * reservation.nombre_passagers;
      }
      
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
  }, [flight, reservation.nombre_passagers, reservation.classType, reservation.fareType, reservation.priceType, reservation.fixedPrice, validCoupon, reservation.discountAmount]);

  // Handle passenger count change
  const handlePassengerChange = (e, classType = reservation.classType, fareType = reservation.fareType, customPrice = null) => {
    try {
      console.log("handlePassengerChange called with:", {
        passengers: e.target.value,
        classType,
        fareType,
        customPrice
      });
      
      // Safely parse the passenger count with fallback to 1
      const passengers = parseInt(e.target.value) || 1;
      
      // Validate against available seats
      const maxAvailable = classType === 'economy' 
        ? (flight?.availableSeats?.economy || 0) 
        : (flight?.availableSeats?.business || 0);
      
      // Limit passengers to available seats
      const validPassengers = Math.min(passengers, maxAvailable);
      
      // Get the correct fare multiplier
      const fareMultiplier = getCurrentFareMultiplier();
      
      // Calculate price based on provided custom price or standard calculation
      const calculatedPrice = customPrice !== null ? 
        customPrice : 
        (flight?.prix || 0) * validPassengers * fareMultiplier - (reservation.discountAmount || 0);
      
      // Create a new reservation object with updated values
      const updatedReservation = {
        ...reservation,
        nombre_passagers: validPassengers,
        classType: classType,
        fareType: fareType,
        prix_total: calculatedPrice > 0 ? calculatedPrice : 0
      };
      
      console.log("Updated reservation:", updatedReservation);
      setReservation(updatedReservation);
    } catch (error) {
      console.error("Error in handlePassengerChange:", error);
      // Keep the previous state in case of error
    }
  };

  // Handle coupon checkbox change
  const handleCouponCheckboxChange = (e) => {
    const checked = e.target.checked;
    
    setReservation(prev => ({
      ...prev,
      hasCoupon: checked,
      // Reset coupon and discount if unchecked
      ...(checked ? {} : { coupon: '', discountAmount: 0 })
    }));
    
    if (!checked) {
      setValidCoupon(null);
    }
  };

  // Handle coupon input change
  const handleCouponChange = (e) => {
    setReservation(prev => ({
      ...prev,
      coupon: e.target.value
    }));
  };

  // Apply coupon
  const applyCoupon = async (couponCode = reservation.coupon) => {
    try {
      if (!couponCode) {
        setSnackbar({
          open: true,
          message: 'Veuillez entrer un code coupon',
          severity: 'error'
        });
        return;
      }
      
      const response = await api.get(`/coupons/${couponCode}`);
      
      if (response.data) {
        const coupon = response.data;
        
        // Calculate discount amount - only apply to base price, not fixed price
        let discountAmount = 0;
        if (reservation.priceType !== 'fixed') {
          if (coupon.reduction_type === 'percentage') {
            discountAmount = (flight.prix * reservation.nombre_passagers * getCurrentFareMultiplier()) * (coupon.reduction / 100);
          } else {
            discountAmount = Math.min(coupon.reduction, flight.prix * reservation.nombre_passagers * getCurrentFareMultiplier());
          }
        }
        
        setValidCoupon(coupon);
        setReservation(prev => ({
          ...prev,
          discountAmount
        }));
        
        setSnackbar({
          open: true,
          message: 'Coupon appliqué avec succès',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setSnackbar({
        open: true,
        message: 'Coupon invalide ou expiré',
        severity: 'error'
      });
    }
  };

  // Handle reservation
  const handleReservation = async (priceType = 'base') => {
    // Update the reservation's price type
    setReservation(prev => ({
      ...prev,
      priceType: priceType
    }));
    
    // Check if seats are available for the selected class type
    const hasAvailableSeats = 
      (reservation.classType === 'economy' && flight.availableSeats?.economy > 0) ||
      (reservation.classType === 'business' && flight.availableSeats?.business > 0);
      
    if (!hasAvailableSeats || !isFlightAvailable(flight.date_depart) || userBalance < reservation.prix_total) {
      if (!hasAvailableSeats) {
        // Show specific error for no seats available
        setReservationError(true);
        setSnackbar({
          open: true,
          message: `Pas de sièges disponibles en classe ${reservation.classType === 'economy' ? 'Économique' : 'Affaires'}`,
          severity: 'error'
        });
      } else {
        setShowBalanceWarning(userBalance < reservation.prix_total);
      }
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userData) {
        setSnackbar({
          open: true,
          message: 'Vous devez être connecté pour effectuer une réservation',
          severity: 'error'
        });
        return;
      }
      
      // Create the reservation with the selected class and fare type
      const reservationData = {
        flight_id: id,
        user_id: userData.id,
        date_reservation: new Date().toISOString(),
        nombre_passagers: reservation.nombre_passagers,
        prix_total: reservation.prix_total,
        class_type: reservation.classType,
        fare_type: reservation.fareType,
        use_contract_price: priceType === 'fixed',
        statut: 'confirmée'
      };
      
      console.log("Sending reservation data:", reservationData);
      
      // First create the reservation
      const response = await axios.post('http://localhost:5000/api/reservations', 
        reservationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Reservation response:", response.data);
      
      // Now that we have the reservation ID, allocate seats
      if (response.data && response.data.id) {
        // Request random seats from the server with the reservation ID
        const seatsResponse = await axios.post(`http://localhost:5000/api/flights/${id}/allocate-seats`, {
          numberOfSeats: reservation.nombre_passagers,
          classType: reservation.classType,
          reservationId: response.data.id
        });
        
        console.log("Seats allocation response:", seatsResponse.data);
      }
      
      // Update available seats
      fetchAvailableSeats();
      
      // Show success message and redirect
      setReservationSuccess(true);
      setSnackbar({
        open: true,
        message: 'Réservation effectuée avec succès',
        severity: 'success'
      });
      
      setTimeout(() => {
        navigate('/client/reservations');
      }, 3000);
    } catch (error) {
      console.error('Error creating reservation:', error);
      console.error('Error details:', error.response?.data);
      setReservationError(true);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la réservation',
        severity: 'error'
      });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Chargement des détails du vol...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/client/flights')}>
          Retour aux vols
        </Button>
      </Container>
    );
  }

  if (!flight) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Aucune information de vol trouvée
        </Alert>
        <Button variant="contained" onClick={() => navigate('/client/flights')}>
          Retour aux vols
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <FlightHeader 
        flight={flight} 
        isFlightAvailable={isFlightAvailable} 
      />
      
      <Grid container spacing={3}>
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
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FlightDescription;