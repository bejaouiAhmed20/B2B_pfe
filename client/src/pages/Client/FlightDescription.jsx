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
    fixedPrice: null, // For contract fixed price
    needsPriceUpdate: true // Flag to trigger initial price calculation
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
    try {
      const selectedFares = fareTypes[reservation.classType];
      if (!selectedFares) {
        console.error(`No fare types found for class: ${reservation.classType}`);
        return 1.0;
      }

      const selectedFare = selectedFares.find(fare => fare.id === reservation.fareType);
      if (!selectedFare) {
        console.error(`No fare found with id: ${reservation.fareType} in class: ${reservation.classType}`);
        return 1.0;
      }

      return selectedFare.multiplier;
    } catch (error) {
      console.error("Error getting fare multiplier:", error);
      return 1.0;
    }
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
      // Get the fare multiplier for the selected class and fare type
      const selectedFares = fareTypes[reservation.classType];
      const selectedFare = selectedFares.find(fare => fare.id === reservation.fareType);
      const fareMultiplier = selectedFare ? selectedFare.multiplier : 1.0;

      console.log(`Price recalculation triggered. Class: ${reservation.classType}, Fare: ${reservation.fareType}, Multiplier: ${fareMultiplier}, PriceType: ${reservation.priceType}`);

      // Calculate the base price based on price type
      let basePrice;

      if (reservation.priceType === 'fixed') {
        // Check if we have a fixed price in the reservation
        if (reservation.fixedPrice) {
          // Use fixed contract price but apply fare multiplier
          basePrice = reservation.fixedPrice * fareMultiplier * reservation.nombre_passagers;
          console.log(`Fixed price calculation: ${reservation.fixedPrice} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${basePrice}`);
        } else {
          // If we don't have a fixed price but the price type is 'fixed',
          // we need to fetch the contract to get the fixed price
          console.log("Fixed price not found in reservation, using flight price as fallback");
          basePrice = flight.prix * fareMultiplier * reservation.nombre_passagers;
        }
      } else {
        // Use regular base price with fare multiplier
        basePrice = flight.prix * fareMultiplier * reservation.nombre_passagers;
        console.log(`Base price calculation: ${flight.prix} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${basePrice}`);
      }

      // Apply discount if there's a valid coupon and we're using base price
      let finalPrice = basePrice;
      if (validCoupon && reservation.discountAmount > 0 && reservation.priceType === 'base') {
        finalPrice = basePrice - reservation.discountAmount;
        console.log(`Applied discount: ${basePrice} - ${reservation.discountAmount} = ${finalPrice}`);
      }

      // Always update if needsPriceUpdate flag is set or if the price has changed
      if (reservation.needsPriceUpdate || finalPrice !== reservation.prix_total) {
        console.log(`Updating price: ${finalPrice} (basePrice: ${basePrice}, fareMultiplier: ${fareMultiplier})`);

        setReservation(prev => ({
          ...prev,
          prix_total: finalPrice > 0 ? Math.round(finalPrice * 100) / 100 : 0, // Round to 2 decimal places
          fareMultiplier: fareMultiplier, // Store the fare multiplier for reference
          needsPriceUpdate: false // Clear the flag
        }));
      }
    }
  }, [flight, reservation.nombre_passagers, reservation.classType, reservation.fareType, reservation.priceType, reservation.fixedPrice, validCoupon, reservation.discountAmount, reservation.needsPriceUpdate, fareTypes]);

  // Handle passenger count change
  const handlePassengerChange = (e, classType = reservation.classType, fareType = reservation.fareType, customPrice = null, priceType = reservation.priceType, fixedPrice = reservation.fixedPrice) => {
    try {
      console.log("handlePassengerChange called with:", {
        passengers: e.target.value,
        classType,
        fareType,
        customPrice,
        priceType,
        fixedPrice
      });

      // Safely parse the passenger count with fallback to 1
      const passengers = parseInt(e.target.value) || 1;

      // Validate against available seats
      const maxAvailable = classType === 'economy'
        ? (flight?.availableSeats?.economy || 0)
        : (flight?.availableSeats?.business || 0);

      // Limit passengers to available seats
      const validPassengers = Math.min(passengers, maxAvailable);

      // Get the fare multiplier for the selected class and fare type
      const selectedFares = fareTypes[classType];
      const selectedFare = selectedFares.find(fare => fare.id === fareType);
      const fareMultiplier = selectedFare ? selectedFare.multiplier : 1.0;

      // Calculate price based on price type
      let calculatedPrice;

      if (priceType === 'fixed' && (fixedPrice || reservation.fixedPrice)) {
        // If using fixed price from contract, apply fare multiplier
        const actualFixedPrice = fixedPrice || reservation.fixedPrice;
        calculatedPrice = actualFixedPrice * fareMultiplier * validPassengers;
        console.log(`Fixed price calculation: ${actualFixedPrice} * ${fareMultiplier} * ${validPassengers} = ${calculatedPrice}`);
      } else if (customPrice !== null) {
        // Use custom price if provided
        calculatedPrice = customPrice;
        console.log(`Using custom price: ${calculatedPrice}`);
      } else {
        // Otherwise use standard calculation with fare multiplier
        calculatedPrice = (flight?.prix || 0) * validPassengers * fareMultiplier;
        console.log(`Base price calculation: ${flight?.prix} * ${validPassengers} * ${fareMultiplier} = ${calculatedPrice}`);

        // Apply discount if there's a valid coupon and we're using base price
        if (validCoupon && reservation.discountAmount > 0 && priceType === 'base') {
          calculatedPrice -= reservation.discountAmount;
          console.log(`Applied discount: ${calculatedPrice} - ${reservation.discountAmount} = ${calculatedPrice}`);
        }
      }

      // Create a new reservation object with updated values
      const updatedReservation = {
        ...reservation,
        nombre_passagers: validPassengers,
        classType: classType,
        fareType: fareType,
        priceType: priceType,
        fixedPrice: priceType === 'fixed' ? (fixedPrice || reservation.fixedPrice) : null,
        prix_total: calculatedPrice > 0 ? Math.round(calculatedPrice * 100) / 100 : 0, // Round to 2 decimal places
        needsPriceUpdate: true
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
  const handleReservation = async (priceType = reservation.priceType) => {
    // Always recalculate the price before submitting to ensure it's correct
    // Get the fare multiplier for the selected class and fare type
    const selectedFares = fareTypes[reservation.classType];
    const selectedFare = selectedFares.find(fare => fare.id === reservation.fareType);
    const fareMultiplier = selectedFare ? selectedFare.multiplier : 1.0;

    console.log(`Preparing reservation with class=${reservation.classType}, fare=${reservation.fareType}, multiplier=${fareMultiplier}, priceType=${priceType}`);

    // Calculate the new price based on the price type
    let newPrice;
    let fixedPrice = null;

    // If the price type is 'fixed', we need to make sure we have a fixed price
    if (priceType === 'fixed') {
      // Try to get the fixed price from the reservation
      if (reservation.fixedPrice) {
        fixedPrice = reservation.fixedPrice;
        // Use fixed price from reservation but apply fare multiplier
        newPrice = fixedPrice * fareMultiplier * reservation.nombre_passagers;
        console.log(`Final fixed price calculation from reservation: ${fixedPrice} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${newPrice}`);
      } else {
        // If we don't have a fixed price in the reservation, try to get it from the contract
        try {
          // Fetch the user's contract to get the fixed price
          const userData = JSON.parse(localStorage.getItem('user'));
          if (userData) {
            const response = await axios.get(`http://localhost:5000/api/contracts/client/${userData.id}`);
            if (response.data && response.data.length > 0) {
              // Get the active contract
              const activeContract = response.data.find(contract => contract.isActive) || response.data[0];

              if (activeContract.fixedTicketPrice) {
                fixedPrice = activeContract.fixedTicketPrice;
                // Use fixed price from contract but apply fare multiplier
                newPrice = fixedPrice * fareMultiplier * reservation.nombre_passagers;
                console.log(`Final fixed price calculation from contract: ${fixedPrice} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${newPrice}`);

                // Update the reservation with the fixed price for future calculations
                setReservation(prev => ({
                  ...prev,
                  fixedPrice: fixedPrice
                }));

                // Give the state time to update
                await new Promise(resolve => setTimeout(resolve, 50));
              } else {
                console.error("No fixed price available in the contract");
                newPrice = flight.prix * fareMultiplier * reservation.nombre_passagers; // Fallback to base price
              }
            } else {
              console.error("No contract found for the user");
              newPrice = flight.prix * fareMultiplier * reservation.nombre_passagers; // Fallback to base price
            }
          } else {
            console.error("No user data found in localStorage");
            newPrice = flight.prix * fareMultiplier * reservation.nombre_passagers; // Fallback to base price
          }
        } catch (error) {
          console.error("Error fetching user contract:", error);
          newPrice = flight.prix * fareMultiplier * reservation.nombre_passagers; // Fallback to base price
        }
      }
    } else {
      // Use base price with fare multiplier
      newPrice = flight.prix * fareMultiplier * reservation.nombre_passagers;
      console.log(`Final base price calculation: ${flight.prix} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${newPrice}`);

      // Apply discount if there's a valid coupon and we're using base price
      if (validCoupon && reservation.discountAmount > 0) {
        newPrice -= reservation.discountAmount;
        console.log(`Applied discount: ${newPrice} - ${reservation.discountAmount} = ${newPrice}`);
      }
    }

    // Make sure the price is a valid number
    if (isNaN(newPrice) || newPrice <= 0) {
      console.error("Invalid price calculated:", newPrice);
      // Fallback to a safe calculation
      newPrice = flight.prix * fareMultiplier * reservation.nombre_passagers;
      console.log(`Fallback price calculation: ${flight.prix} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${newPrice}`);
    }

    // Update the reservation with the new price and price type
    const updatedReservation = {
      ...reservation,
      priceType: priceType,
      fixedPrice: fixedPrice,
      prix_total: newPrice > 0 ? Math.round(newPrice * 100) / 100 : 0, // Round to 2 decimal places
      fareMultiplier: fareMultiplier // Store the fare multiplier for reference
    };

    console.log("Final reservation data:", updatedReservation);
    setReservation(updatedReservation);

    // Give the state time to update before proceeding
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if seats are available for the selected class type
    const maxAvailable = reservation.classType === 'economy'
      ? (flight?.availableSeats?.economy || 0)
      : (flight?.availableSeats?.business || 0);

    console.log(`Checking seat availability: requested=${reservation.nombre_passagers}, available=${maxAvailable}, class=${reservation.classType}`);

    const hasAvailableSeats = maxAvailable >= reservation.nombre_passagers;

    if (!hasAvailableSeats || !isFlightAvailable(flight.date_depart) || userBalance < reservation.prix_total) {
      if (!hasAvailableSeats) {
        // Show specific error for no seats available
        setReservationError(true);
        setSnackbar({
          open: true,
          message: `Pas assez de sièges disponibles en classe ${reservation.classType === 'economy' ? 'Économique' : 'Affaires'}. Seulement ${maxAvailable} siège(s) disponible(s).`,
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

      // Get the fare multiplier for the selected class and fare type
      const selectedFares = fareTypes[reservation.classType];
      const selectedFare = selectedFares.find(fare => fare.id === reservation.fareType);
      const fareMultiplier = selectedFare ? selectedFare.multiplier : 1.0;

      // Create the reservation with the selected class and fare type
      const reservationData = {
        flight_id: id,
        user_id: userData.id,
        date_reservation: new Date().toISOString(),
        nombre_passagers: reservation.nombre_passagers,
        prix_total: reservation.prix_total, // Make sure we're using the correct price
        class_type: reservation.classType,
        fare_type: reservation.fareType,
        use_contract_price: priceType === 'fixed',
        fare_multiplier: fareMultiplier, // Include the fare multiplier
        fixed_price: priceType === 'fixed' ? reservation.fixedPrice : null, // Include the fixed price if using contract price
        statut: 'confirmée'
      };

      console.log("Sending reservation with fare multiplier:", fareMultiplier);
      console.log("Fixed price:", priceType === 'fixed' ? reservation.fixedPrice : "Not using fixed price");

      console.log("Sending reservation data:", reservationData);

      // First create the reservation
      const response = await axios.post('http://localhost:5000/api/reservations',
        reservationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Reservation response:", response.data);

      // Now that we have the reservation ID, allocate seats
      if (response.data && response.data.id) {
        try {
          // Double-check seat availability before allocation
          const availableSeatsResponse = await axios.get(`http://localhost:5000/api/flights/${id}/seats`);
          const availableSeats = availableSeatsResponse.data;

          const maxAvailable = reservation.classType === 'economy'
            ? (availableSeats?.economy || availableSeats?.economySeats || 0)
            : (availableSeats?.business || availableSeats?.businessSeats || 0);

          console.log(`Before seat allocation - Available seats: ${maxAvailable}, Requested: ${reservation.nombre_passagers}, Class: ${reservation.classType}`);

          if (maxAvailable < reservation.nombre_passagers) {
            throw new Error(`Not enough ${reservation.classType} seats available. Only ${maxAvailable} seats left.`);
          }

          // Request random seats from the server with the reservation ID
          const seatsResponse = await axios.post(`http://localhost:5000/api/flights/${id}/allocate-seats`, {
            numberOfSeats: reservation.nombre_passagers,
            classType: reservation.classType,
            reservationId: response.data.id
          });

          console.log("Seats allocation response:", seatsResponse.data);
        } catch (error) {
          console.error("Error allocating seats:", error);
          throw error; // Re-throw to be caught by the outer catch block
        }
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

      // Get a more specific error message if available
      let errorMessage = 'Erreur lors de la réservation';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });

      // If the reservation was created but seat allocation failed, we should update the UI
      fetchAvailableSeats();
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