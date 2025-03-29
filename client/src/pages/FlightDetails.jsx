// Add to your imports
import axios from 'axios';

// Inside your component, add these state variables
const [availableSeats, setAvailableSeats] = useState({ economy: 0, business: 0 });

// Add this function to fetch available seats
const fetchAvailableSeats = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/flights/${id}/seats`);
    setAvailableSeats({
      economy: response.data.economySeats,
      business: response.data.businessSeats
    });
    
    // Update flight object with seat information
    setFlight(prev => ({
      ...prev,
      availableSeats: {
        economy: response.data.economySeats,
        business: response.data.businessSeats
      }
    }));
  } catch (error) {
    console.error('Error fetching available seats:', error);
  }
};

// Call this in useEffect
useEffect(() => {
  fetchFlightDetails();
  fetchAvailableSeats();
}, [id]);

// Modify your handleReservation function to allocate seats
const handleReservation = async () => {
  if (!isFlightAvailable(flight.date_depart) || userBalance < reservation.prix_total) {
    setShowBalanceWarning(userBalance < reservation.prix_total);
    return;
  }

  try {
    // Request random seats from the server
    const seatsResponse = await axios.post(`http://localhost:5000/api/flights/${id}/allocate-seats`, {
      numberOfSeats: reservation.nombre_passagers,
      classType: reservation.classType
    });
    
    // Update reservation with allocated seats
    const updatedReservation = {
      ...reservation,
      seats: seatsResponse.data.allocatedSeats
    };
    
    // Create the reservation
    const response = await axios.post('http://localhost:5000/api/reservations', {
      ...updatedReservation,
      flight_id: id,
      user_id: user.id,
      status: 'confirmed',
      seats: seatsResponse.data.allocatedSeats.map(seat => seat.id)
    });
    
    // Update available seats
    fetchAvailableSeats();
    
    // Show success message and redirect
    setReservationSuccess(true);
    setTimeout(() => {
      navigate('/profile/reservations');
    }, 3000);
  } catch (error) {
    console.error('Error creating reservation:', error);
    setReservationError(true);
  }
};