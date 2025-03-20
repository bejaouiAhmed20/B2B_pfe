import React from 'react';
import { Typography, Chip, Paper, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FlightHeader = ({ flight, isFlightAvailable }) => {
  const navigate = useNavigate();
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/client/flights')}
        sx={{ mb: 3 }}
      >
        Retour aux vols
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        {flight.titre}
      </Typography>
      
      <Chip 
        label={isFlightAvailable(flight.date_depart) ? "Disponible" : "Complet"} 
        color={isFlightAvailable(flight.date_depart) ? "success" : "error"}
        sx={{ mb: 3 }}
      />
    </Paper>
  );
};

export default FlightHeader;