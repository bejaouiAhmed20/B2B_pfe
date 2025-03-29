import React from 'react';
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
  Alert
} from '@mui/material';
import {
  AttachMoney,
  AirplaneTicket,
  LocalOffer
} from '@mui/icons-material';

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
  return (
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
            onChange={(e) => handlePassengerChange({ target: { value: reservation.nombre_passagers } }, e.target.value)}
            label="Classe"
            disabled={flight.availableSeats?.economy === 0 && flight.availableSeats?.business === 0}
          >
            <MenuItem value="economy" disabled={flight.availableSeats?.economy === 0}>Économique</MenuItem>
            <MenuItem value="business" disabled={flight.availableSeats?.business === 0}>Affaires</MenuItem>
          </Select>
        </FormControl>
        
        {/* Coupon section */}
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
          
          {/* Display seat information if available */}
          {reservation.seats && reservation.seats.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Sièges</Typography>
              <Typography variant="body2">{reservation.seats.map(seat => seat.seatNumber).join(', ')}</Typography>
            </Box>
          )}
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
          
          {/* User balance information */}
          <Divider sx={{ my: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" fontWeight="medium">Votre solde actuel</Typography>
            <Typography 
              variant="body2" 
              fontWeight="medium" 
              color={Number(userBalance) < reservation.prix_total ? 'error.main' : 'success.main'}
            >
              {(Number(userBalance)).toFixed(2)} €
            </Typography>
          </Box>
          
          {isFlightAvailable(flight.date_depart) && Number(userBalance) < reservation.prix_total && (
            <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
              Solde insuffisant: {(Number(userBalance)).toFixed(2)}€ / {reservation.prix_total.toFixed(2)}€ requis
            </Typography>
          )}
          
          {showBalanceWarning && (
            <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
              Votre solde est insuffisant pour cette réservation. Veuillez recharger votre compte.
            </Alert>
          )}
        </Box>
        
        
        <Button
          variant="contained"
          fullWidth
          size="large"
          startIcon={<AirplaneTicket />}
          onClick={handleReservation}
          disabled={!isFlightAvailable(flight.date_depart) || userBalance < reservation.prix_total}
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
        
        {/* Add explicit messages about why the button might be disabled */}
        {!isFlightAvailable(flight.date_depart) && (
          <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
            Ce vol n'est plus disponible à la réservation
          </Typography>
        )}
        
        {isFlightAvailable(flight.date_depart) && userBalance < reservation.prix_total && (
          <Typography variant="body2" color="error" align="center" sx={{ mt: 2 }}>
            Solde insuffisant: {userBalance.toFixed(2)}€ / {reservation.prix_total.toFixed(2)}€ requis
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ReservationForm;