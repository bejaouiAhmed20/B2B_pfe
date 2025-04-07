// Make sure you have these state variables in your component
const [reservation, setReservation] = useState({
  nombre_passagers: 1,
  prix_total: selectedFlight?.prix || 0,
  classType: 'economy',  // Default to economy
  fareType: 'light',     // Default to light fare
  hasCoupon: false,
  coupon: '',
  discountAmount: 0,
  seats: []
});

// Update the handlePassengerChange function to properly handle class and fare type
const handlePassengerChange = (e, classType = reservation.classType, fareType = reservation.fareType) => {
  console.log("handlePassengerChange called with:", {
    passengers: e.target.value,
    classType,
    fareType
  });
  
  const passengers = parseInt(e.target.value);
  const fareMultiplier = getFareMultiplier(classType, fareType);
  
  // Create a new reservation object with updated values
  const updatedReservation = {
    ...reservation,
    nombre_passagers: passengers,
    classType: classType,
    fareType: fareType,
    prix_total: calculateTotalPrice(passengers, fareMultiplier)
  };
  
  console.log("Updated reservation:", updatedReservation);
  setReservation(updatedReservation);
};

// Helper function to get the fare multiplier
const getFareMultiplier = (classType, fareType) => {
  const selectedFare = fareTypes[classType]?.find(fare => fare.id === fareType);
  return selectedFare ? selectedFare.priceMultiplier : 1;
};

// Calculate total price with discounts
const calculateTotalPrice = (passengers, fareMultiplier) => {
  const basePrice = selectedFlight.prix * passengers * fareMultiplier;
  return basePrice - reservation.discountAmount;
};

// Function to get current fare multiplier for the price display
const getCurrentFareMultiplier = () => {
  return getFareMultiplier(reservation.classType, reservation.fareType);
};

// Update the handleReservation function to properly send class and fare type
// Update the handleReservation function to properly check seat availability
const handleReservation = async () => {
  // Check if seats are available for the selected class type
  const hasAvailableSeats = 
    (reservation.classType === 'economy' && flight.availableSeats?.economy > 0) ||
    (reservation.classType === 'business' && flight.availableSeats?.business > 0);
    
  if (!hasAvailableSeats || !isFlightAvailable(selectedFlight.date_depart) || userBalance < reservation.prix_total) {
    if (!hasAvailableSeats) {
      // Show specific error for no seats available
      setReservationError(true);
      alert(`Pas de sièges disponibles en classe ${reservation.classType === 'economy' ? 'Économique' : 'Affaires'}`);
    } else {
      setShowBalanceWarning(userBalance < reservation.prix_total);
    }
    return;
  }

  try {
    // Request random seats from the server
    const seatsResponse = await axios.post(`http://localhost:5000/api/flights/${id}/allocate-seats`, {
      numberOfSeats: reservation.nombre_passagers,
      classType: reservation.classType  // This is important - pass the correct class type
    });
    
    // Create the reservation with the selected class and fare type
    const reservationData = {
      flight_id: id,
      user_id: JSON.parse(localStorage.getItem('user')).id,
      date_reservation: new Date().toISOString(),
      nombre_passagers: reservation.nombre_passagers,
      prix_total: reservation.prix_total,
      class_type: reservation.classType,  // Use the selected class type
      fare_type: reservation.fareType,    // Use the selected fare type
      statut: 'confirmée'
    };
    
    console.log("Sending reservation data:", reservationData);
    
    const response = await axios.post('http://localhost:5000/api/reservations', 
      reservationData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log("Reservation response:", response.data);
    
    // Update available seats
    fetchAvailableSeats();
    
    // Show success message and redirect
    setReservationSuccess(true);
    setTimeout(() => {
      navigate('/client/reservations');
    }, 3000);
  } catch (error) {
    console.error('Error creating reservation:', error);
    console.error('Error details:', error.response?.data);
    setReservationError(true);
  }
};

// Define fare types and their price multipliers
const fareTypes = {
  economy: [
    { id: 'light', name: 'Light', description: 'Sans bagage', priceMultiplier: 1.0 },
    { id: 'standard', name: 'Standard', description: 'Avec bagage', priceMultiplier: 1.2 },
    { id: 'flex', name: 'Flex', description: 'Flexible', priceMultiplier: 1.5 }
  ],
  business: [
    { id: 'comfort', name: 'Comfort', description: 'Confort standard', priceMultiplier: 2.0 },
    { id: 'premium', name: 'Premium', description: 'Service premium', priceMultiplier: 2.5 },
    { id: 'elite', name: 'Elite', description: 'Service élite', priceMultiplier: 3.0 }
  ]
};