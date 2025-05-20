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
    const newPriceType = event.target.value;
    setPriceType(newPriceType);

    // Get the current fare multiplier
    const fareMultiplier = getCurrentFareMultiplier();
    console.log(`Changing price type to ${newPriceType}, current fare multiplier: ${fareMultiplier}`);

    // Calculate the new price based on the selected price type
    let newPrice;
    let fixedPrice = null;

    if (newPriceType === 'fixed' && userContract?.fixedTicketPrice) {
      // Use fixed price from contract but apply fare multiplier
      newPrice = userContract.fixedTicketPrice * fareMultiplier * reservation.nombre_passagers;
      fixedPrice = userContract.fixedTicketPrice;
      console.log(`Fixed price calculation: ${userContract.fixedTicketPrice} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${newPrice}`);

      // Reset coupon when switching to fixed price
      if (validCoupon) {
        handleCouponChange({ target: { value: '' } });
        if (typeof handleCouponCheckboxChange === 'function') {
          handleCouponCheckboxChange({ target: { checked: false } });
        }
      }
    } else {
      // Use base price with fare multiplier
      const basePrice = flight.prix * fareMultiplier * reservation.nombre_passagers;
      newPrice = basePrice - (reservation.discountAmount || 0);
      console.log(`Base price calculation: ${flight.prix} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${basePrice}`);
    }

    console.log(`Price type changed to ${newPriceType}, new price: ${newPrice}`);

    // Update the reservation using handlePassengerChange
    handlePassengerChange(
      { target: { value: reservation.nombre_passagers } },
      reservation.classType,
      reservation.fareType,
      newPrice,
      newPriceType,
      fixedPrice
    );
  };

  // Helper function to update the reservation price
  const handlePriceChange = (newPrice, newPriceType) => {
    // Get the fixed price if we're using the fixed price type
    const fixedPrice = newPriceType === 'fixed' ? userContract?.fixedTicketPrice : null;

    console.log(`handlePriceChange: newPrice=${newPrice}, newPriceType=${newPriceType}, fixedPrice=${fixedPrice}`);

    // This assumes handlePassengerChange is passed down as a prop
    if (typeof handlePassengerChange === 'function') {
      // Use handlePassengerChange as a proxy to update the reservation
      handlePassengerChange(
        { target: { value: reservation.nombre_passagers } },
        reservation.classType,
        reservation.fareType,
        newPrice,
        newPriceType || priceType, // Pass the price type to the parent component
        fixedPrice // Pass the fixed price to the parent component
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

  // Modified handleSubmit to include priceType and better error handling
  const handleSubmitReservation = () => {
    try {
      // Make sure we're passing the current price type and the correct price
      console.log("Submitting reservation with price type:", priceType, "and price:", reservation.prix_total);

      // Vérifier si le nombre de passagers est valide
      if (reservation.nombre_passagers <= 0) {
        console.error("Nombre de passagers invalide:", reservation.nombre_passagers);
        return;
      }

      // Get the fixed price if we're using the fixed price type
      const fixedPrice = priceType === 'fixed' ? userContract?.fixedTicketPrice : null;

      // Get the current fare multiplier
      const fareMultiplier = getCurrentFareMultiplier();
      console.log(`Using fare multiplier: ${fareMultiplier} for class ${reservation.classType} and fare type ${reservation.fareType}`);

      // Calculate the correct price based on the price type
      let finalPrice;
      if (priceType === 'fixed' && fixedPrice) {
        finalPrice = fixedPrice * fareMultiplier * reservation.nombre_passagers;
        console.log(`Final fixed price calculation: ${fixedPrice} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${finalPrice}`);
      } else {
        finalPrice = flight.prix * fareMultiplier * reservation.nombre_passagers;
        if (validCoupon && reservation.discountAmount > 0) {
          finalPrice -= reservation.discountAmount;
        }
        console.log(`Final base price calculation: ${flight.prix} * ${fareMultiplier} * ${reservation.nombre_passagers} = ${finalPrice}`);
      }

      // Vérifier que le prix final est valide
      if (isNaN(finalPrice) || finalPrice <= 0) {
        console.error("Prix final invalide:", finalPrice);
        finalPrice = flight.prix * fareMultiplier * reservation.nombre_passagers;
        console.log(`Prix corrigé: ${finalPrice}`);
      }

      // Update the reservation with the current price type using handlePassengerChange
      // This is a proxy to update the reservation in the parent component
      handlePassengerChange(
        { target: { value: reservation.nombre_passagers } },
        reservation.classType,
        reservation.fareType,
        finalPrice,
        priceType, // Pass the current price type
        fixedPrice // Pass the fixed price
      );

      // Give the state time to update
      setTimeout(() => {
        // Pass the priceType along with the reservation data
        handleReservation(priceType);
      }, 200); // Augmenter le délai pour s'assurer que l'état est mis à jour
    } catch (error) {
      console.error("Erreur lors de la soumission de la réservation:", error);
    }
  };

  // Add state for passenger input error
  const [passengerError, setPassengerError] = useState('');

  // Add validation function for passenger count
  const validatePassengerCount = (count) => {
    const maxAvailable = reservation.classType === 'economy'
      ? (flight.availableSeats?.economy || 0)
      : (flight.availableSeats?.business || 0);

    console.log(`Validating passenger count: ${count}, max available: ${maxAvailable}, class type: ${reservation.classType}`);

    if (isNaN(count) || count < 1) {
      return "Le nombre de passagers doit être au moins 1";
    } else if (count > maxAvailable) {
      return `Seulement ${maxAvailable} siège(s) disponible(s) en classe ${reservation.classType === 'economy' ? 'Économique' : 'Affaires'}`;
    }
    return '';
  };

  // Handle passenger input change
  const handlePassengerInputChange = (e) => {
    const value = e.target.value;
    const count = parseInt(value, 10);

    // Validate the input
    const error = validatePassengerCount(count);
    setPassengerError(error);

    // Only update if valid or empty (to allow user to clear the field)
    if (!error || value === '') {
      handlePassengerChange(
        { target: { value: isNaN(count) ? 1 : count } },
        reservation.classType,
        reservation.fareType
      );
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Réservation
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Typography variant="h4" color="primary">
            {priceType === 'fixed' && userContract?.fixedTicketPrice
              ? `${userContract.fixedTicketPrice} DT`
              : `${flight.prix} DT`}
            <Typography component="span" variant="body2">
              / personne {priceType === 'fixed' ? '(contrat)' : '(base)'}
            </Typography>
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
            <Typography variant="body2" color={reservation.classType === 'economy' ? 'primary' : 'text.primary'}>
              Économique: {flight.availableSeats?.economy || 0} sièges
            </Typography>
            <Typography variant="body2" color={reservation.classType === 'business' ? 'primary' : 'text.primary'}>
              Affaires: {flight.availableSeats?.business || 0} sièges
            </Typography>
          </Box>
          {reservation.nombre_passagers > (reservation.classType === 'economy'
            ? (flight.availableSeats?.economy || 0)
            : (flight.availableSeats?.business || 0)) && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Pas assez de sièges disponibles pour {reservation.nombre_passagers} passagers en classe {reservation.classType === 'economy' ? 'Économique' : 'Affaires'}.
            </Alert>
          )}
        </Box>

        {/* Replace this FormControl with TextField for passenger count */}
        <TextField
          label="Nombre de passagers"
          type="number"
          value={reservation.nombre_passagers}
          onChange={handlePassengerInputChange}
          fullWidth
          margin="normal"
          inputProps={{
            min: 1,
            max: reservation.classType === 'economy'
              ? (flight.availableSeats?.economy || 0)
              : (flight.availableSeats?.business || 0)
          }}
          error={!!passengerError}
          helperText={passengerError || `Maximum disponible: ${
            reservation.classType === 'economy'
              ? (flight.availableSeats?.economy || 0)
              : (flight.availableSeats?.business || 0)
          } sièges`}
          sx={{ mb: 3 }}
        />

        {/* Class and fare type information (read-only) */}
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Classe et tarif sélectionnés:
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1" fontWeight="medium">
              {reservation.classType === 'economy' ? 'Économique' : 'Affaires'}
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary">
              {fareTypes[reservation.classType]?.find(fare => fare.id === reservation.fareType)?.name || ''}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Multiplicateur: {getCurrentFareMultiplier()}x
          </Typography>
        </Box>

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
              Dans les deux cas, le multiplicateur de tarif sera appliqué.
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
                  label={`Prix fixe du contrat (${userContract.fixedTicketPrice} DT × multiplicateur de tarif)`}
                />
              </RadioGroup>
            </FormControl>
          </Box>
        )}

        {/* Contract coupon section - only show when priceType is 'base' */}
        {contractCoupon && priceType === 'base' ? (
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
          // If no contract coupon or price type is fixed, don't show the coupon section at all
          priceType === 'base' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Aucun code promo n'est disponible dans votre contrat.
              </Typography>
            </Box>
          )
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
            <Typography variant="body2" fontWeight="medium">
              {priceType === 'fixed' && userContract?.fixedTicketPrice
                ? `${userContract.fixedTicketPrice} DT`
                : `${flight.prix} DT`}
            </Typography>
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
            <Typography variant="body2" color="text.secondary">Multiplicateur de tarif</Typography>
            <Typography variant="body2">{getCurrentFareMultiplier()}x</Typography>
          </Box>

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
              {(Math.round(reservation.prix_total * 100) / 100).toFixed(2)} DT
            </Typography>
          </Box>

          {/* Show calculation details */}
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1, textAlign: 'right' }}>
            {priceType === 'fixed'
              ? `(${userContract?.fixedTicketPrice || 0} × ${getCurrentFareMultiplier()} × ${reservation.nombre_passagers} = ${(Math.round((userContract?.fixedTicketPrice || 0) * getCurrentFareMultiplier() * reservation.nombre_passagers * 100) / 100).toFixed(2)})`
              : `(${flight.prix} × ${getCurrentFareMultiplier()} × ${reservation.nombre_passagers}${validCoupon ? ` - ${reservation.discountAmount}` : ''} = ${(Math.round((flight.prix * getCurrentFareMultiplier() * reservation.nombre_passagers - (validCoupon ? reservation.discountAmount : 0)) * 100) / 100).toFixed(2)})`}
          </Box>

          {/* Show price type indicator */}
          <Box sx={{
            display: 'inline-block',
            fontSize: '0.75rem',
            bgcolor: priceType === 'fixed' ? '#e3f2fd' : '#f1f8e9',
            color: priceType === 'fixed' ? '#1976d2' : '#558b2f',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            mb: 1
          }}>
            {priceType === 'fixed' ? 'Prix fixe du contrat' : 'Prix de base'}
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
          disabled={
            !isFlightAvailable(flight.date_depart) ||
            timeBeforeFlightError ||
            !!passengerError ||
            reservation.nombre_passagers > (reservation.classType === 'economy'
              ? (flight.availableSeats?.economy || 0)
              : (flight.availableSeats?.business || 0))
          }
          sx={{ mt: 3 }}
        >
          RÉSERVER MAINTENANT
        </Button>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;