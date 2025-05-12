import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  RadioGroup,
  Radio
} from '@mui/material';
import {
  AttachMoney,
  AirplaneTicket,
  LocalOffer,
  BusinessCenter,
  AccessTime
} from '@mui/icons-material';
import axios from 'axios';

const ReservationForm = ({ 
  flight, 
  reservation, 
  handlePassengerChange, 
  handleCouponChange, 
  handleCouponCheckboxChange, 
  applyCoupon, 
  handleReservation, 
  isFlightAvailable, 
  fareTypes, 
  getCurrentFareMultiplier,
  validCoupon,
  userBalance,
  showBalanceWarning
}) => {
  const [userContract, setUserContract] = useState(null);
  const [contractCoupon, setContractCoupon] = useState(null);
  const [priceType, setPriceType] = useState('base');
  const [loading, setLoading] = useState(false);
  const [timeBeforeFlightError, setTimeBeforeFlightError] = useState(false);
  const [hoursBeforeFlight, setHoursBeforeFlight] = useState(0);

  // Fetch user's contract on component mount
  useEffect(() => {
    const fetchUserContract = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) return;

        // Get user's active contract
        const response = await axios.get(`http://localhost:5000/api/contracts/client/${userData.id}`);
        if (response.data && response.data.length > 0) {
          // Get the active contract
          const activeContract = response.data.find(contract => contract.isActive) || response.data[0];
          setUserContract(activeContract);
          
          // If contract has a coupon, fetch its details
          if (activeContract.coupon) {
            setContractCoupon(activeContract.coupon);
          }
          
          // Check time before flight
          if (flight && activeContract.minTimeBeforeBalanceFlight) {
            checkTimeBeforeFlight(flight.date_depart, activeContract.minTimeBeforeBalanceFlight);
          }
        }
      } catch (error) {
        console.error('Error fetching user contract:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserContract();
  }, [flight]);

  // Check if the current time is at least minTimeBeforeBalanceFlight hours before the flight
  const checkTimeBeforeFlight = (departureDate, minHours) => {
    const now = new Date();
    const departure = new Date(departureDate);
    const diffInMs = departure.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    setHoursBeforeFlight(Math.floor(diffInHours));
    setTimeBeforeFlightError(diffInHours < minHours);
  };

  // Handle price type change
  const handlePriceTypeChange = (event) => {
    setPriceType(event.target.value);
    
    // Calculate the new price based on the selected price type
    let newPrice;
    if (event.target.value === 'fixed' && userContract?.fixedTicketPrice) {
      // Use fixed price from contract
      newPrice = userContract.fixedTicketPrice * reservation.nombre_passagers;
    } else {
      // Use base price with fare multiplier
      const basePrice = flight.prix * getCurrentFareMultiplier() * reservation.nombre_passagers;
      newPrice = basePrice - (reservation.discountAmount || 0);
    }
    
    // Update the reservation with the new price
    handlePriceChange(newPrice);
  };
  
  // Helper function to update the reservation price
  const handlePriceChange = (newPrice) => {
    const updatedReservation = {
      ...reservation,
      prix_total: newPrice > 0 ? newPrice : 0
    };
    // This assumes setReservation is passed down as a prop or available in context
    // If not, you'll need to modify this to use the appropriate update method
    if (typeof handlePassengerChange === 'function') {
      // Use handlePassengerChange as a proxy to update the reservation
      handlePassengerChange(
        { target: { value: reservation.nombre_passagers } },
        reservation.classType,
        reservation.fareType,
        newPrice
      );
    }
  };

  // Apply contract coupon automatically
  const applyContractCoupon = () => {
    if (!contractCoupon) return;
    
    // Use the contractCoupon.code directly instead of relying on state updates
    handleCouponChange({ target: { value: contractCoupon.code } });
    
    // Pass the code directly to applyCoupon instead of relying on reservation.coupon
    applyCoupon(contractCoupon.code);
  };

  // Format time remaining as a readable string
  const formatTimeRemaining = (hours) => {
    if (hours < 1) {
      return `${Math.floor(hours * 60)} minutes`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    
    if (days > 0) {
      return `${days} jour${days > 1 ? 's' : ''} et ${remainingHours} heure${remainingHours > 1 ? 's' : ''}`;
    }
    return `${remainingHours} heure${remainingHours > 1 ? 's' : ''}`;
  };

  // Modified handleSubmit to include priceType
  const handleSubmitReservation = () => {
    // Pass the priceType along with the reservation data
    handleReservation(priceType);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Réservation
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Typography variant="h4" color="primary">
            {flight.prix} DT <Typography component="span" variant="body2">/ personne</Typography>
          </Typography>
        </Box>
        
        {/* Time before flight warning */}
        {timeBeforeFlightError && userContract?.minTimeBeforeBalanceFlight && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ mr: 1 }} />
              <Typography variant="body2">
                Selon votre contrat, vous devez réserver au moins {userContract.minTimeBeforeBalanceFlight} heures avant le départ.
                Il reste seulement {formatTimeRemaining(hoursBeforeFlight)} avant ce vol.
              </Typography>
            </Box>
          </Alert>
        )}
        
        {/* Seat availability information */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Disponibilité des sièges:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">
              Économique: {flight.availableSeats?.economy || 0} sièges
            </Typography>
            <Typography variant="body2">
              Affaires: {flight.availableSeats?.business || 0} sièges
            </Typography>
          </Box>
        </Box>
        
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Nombre de passagers</InputLabel>
          <Select
            value={reservation.nombre_passagers}
            onChange={handlePassengerChange}
            label="Nombre de passagers"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <MenuItem key={num} value={num} disabled={
                (reservation.classType === 'economy' && num > (flight.availableSeats?.economy || 0)) ||
                (reservation.classType === 'business' && num > (flight.availableSeats?.business || 0))
              }>
                {num}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Class selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Classe</InputLabel>
          <Select
            value={reservation.classType}
            onChange={(e) => {
              // When class changes, reset fare type to the first available option for that class
              const defaultFareType = fareTypes[e.target.value][0].id;
              handlePassengerChange(
                { target: { value: reservation.nombre_passagers } }, 
                e.target.value,
                defaultFareType
              );
            }}
            label="Classe"
          >
            <MenuItem value="economy" disabled={flight.availableSeats?.economy === 0}>
              Économique {flight.availableSeats?.economy === 0 && "(Complet)"}
            </MenuItem>
            <MenuItem value="business" disabled={flight.availableSeats?.business === 0}>
              Affaires {flight.availableSeats?.business === 0 && "(Complet)"}
            </MenuItem>
          </Select>
        </FormControl>
        
        {/* Fare type selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Type de tarif</InputLabel>
          <Select
            value={reservation.fareType}
            onChange={(e) => {
              handlePassengerChange(
                { target: { value: reservation.nombre_passagers } }, 
                reservation.classType, 
                e.target.value
              );
            }}
            label="Type de tarif"
          >
            {fareTypes[reservation.classType]?.map(fare => (
              <MenuItem key={fare.id} value={fare.id}>
                {fare.name} ({fare.description})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Contract price selection */}
        {userContract && userContract.fixedTicketPrice && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f7ff', borderRadius: 1, border: '1px dashed #1976d2' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessCenter sx={{ mr: 1, color: '#1976d2' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Prix du contrat
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Votre contrat ({userContract.label}) vous permet de choisir entre le prix de base et un prix fixe.
            </Typography>
            
            <FormControl component="fieldset">
              <RadioGroup
                name="price-type"
                value={priceType}
                onChange={handlePriceTypeChange}
              >
                <FormControlLabel 
                  value="base" 
                  control={<Radio />} 
                  label={`Prix de base (${flight.prix} DT × multiplicateur de tarif)`} 
                />
                <FormControlLabel 
                  value="fixed" 
                  control={<Radio />} 
                  label={`Prix fixe du contrat (${userContract.fixedTicketPrice} DT par billet)`} 
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}
        
        {/* Contract coupon section */}
        {contractCoupon ? (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#fff8e1', borderRadius: 1, border: '1px dashed #ffc107' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalOffer sx={{ mr: 1, color: '#f57c00' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Coupon de contrat
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 2 }}>
              Votre contrat inclut un code promo: <strong>{contractCoupon.code}</strong>
              {contractCoupon.reduction_type === 'percentage' 
                ? ` (${contractCoupon.reduction}% de réduction)`
                : ` (${contractCoupon.reduction} DT de réduction)`}
            </Typography>
            
            <Button 
              variant="outlined" 
              color="warning"
              onClick={applyContractCoupon}
              startIcon={<LocalOffer />}
              disabled={validCoupon && validCoupon.code === contractCoupon.code}
            >
              {validCoupon && validCoupon.code === contractCoupon.code 
                ? 'Coupon appliqué' 
                : 'Appliquer le coupon'}
            </Button>
            
            {/* Add success message when coupon is applied */}
            {validCoupon && validCoupon.code === contractCoupon.code && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Coupon appliqué avec succès! {validCoupon.reduction_type === 'percentage' 
                  ? `${validCoupon.reduction}% de réduction`
                  : `${validCoupon.reduction} DT de réduction`}
              </Alert>
            )}
          </Box>
        ) : (
          // If no contract coupon, don't show the coupon section at all
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Aucun code promo n'est disponible dans votre contrat.
            </Typography>
          </Box>
        )}
        
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
            <Typography variant="body2" color="text.secondary">
              {priceType === 'fixed' && userContract?.fixedTicketPrice 
                ? 'Prix fixe du contrat' 
                : 'Prix unitaire (base)'}
            </Typography>
            <Typography variant="body2">
              {priceType === 'fixed' && userContract?.fixedTicketPrice 
                ? `${userContract.fixedTicketPrice} DT` 
                : `${flight.prix} DT`}
            </Typography>
          </Box>
          
          {priceType !== 'fixed' && (
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
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">Nombre de passagers</Typography>
            <Typography variant="body2">{reservation.nombre_passagers}</Typography>
          </Box>
          
          {validCoupon && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Réduction (Coupon {validCoupon.code})</Typography>
              <Typography variant="body2" color="error">-{reservation.discountAmount} DT</Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 1 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">Total</Typography>
            <Typography variant="subtitle1" fontWeight="bold" color="primary">
              {reservation.prix_total} DT
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">Solde disponible</Typography>
            <Typography 
              variant="body2" 
              color={userBalance < reservation.prix_total ? 'error' : 'success.main'}
              fontWeight="bold"
            >
              {userBalance} DT
            </Typography>
          </Box>
        </Box>
        
        {showBalanceWarning && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Votre solde est insuffisant pour effectuer cette réservation. Veuillez recharger votre compte.
          </Alert>
        )}
        
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          onClick={handleSubmitReservation}
          disabled={!isFlightAvailable(flight.date_depart) || timeBeforeFlightError}
          sx={{ mt: 3 }}
        >
          RÉSERVER MAINTENANT
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;

// When handling the reservation submission
const handleSubmit = () => {
  // Make sure priceType is accessible here
  console.log("Using price type:", priceType);
  
  const reservationData = {
    // ... other reservation data ...
    use_contract_price: priceType === 'fixed',
    prix_total: reservation.prix_total
  };
  
  handleReservation(reservationData);
};