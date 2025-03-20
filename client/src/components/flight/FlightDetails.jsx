import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Divider, 
  Grid 
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  AirlineSeatReclineNormal,
  EventSeat,
  CalendarMonth
} from '@mui/icons-material';

const FlightDetails = ({ flight, formatDate }) => {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Détails du vol
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FlightTakeoff sx={{ mr: 2, color: '#CC0A2B' }} />
          <Box>
            <Typography variant="body1" fontWeight="bold">
              Départ
            </Typography>
            <Typography variant="body1">
              {flight.airport_depart?.nom || 'N/A'}, {flight.airport_depart?.ville || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(flight.date_depart)}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FlightLand sx={{ mr: 2, color: '#1976d2' }} />
          <Box>
            <Typography variant="body1" fontWeight="bold">
              Arrivée
            </Typography>
            <Typography variant="body1">
              {flight.airport_arrivee?.nom || 'N/A'}, {flight.airport_arrivee?.ville || 'N/A'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(flight.date_retour)}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AccessTime color="primary" />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Durée
              </Typography>
              <Typography variant="body1" align="center">
                {flight.duree || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AirlineSeatReclineNormal color="primary" />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Compagnie
              </Typography>
              <Typography variant="body1" align="center">
                {flight.compagnie_aerienne}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <EventSeat color="primary" />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Classe
              </Typography>
              <Typography variant="body1" align="center">
                {flight.classe || 'Économique'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <CalendarMonth color="primary" />
              <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                Type
              </Typography>
              <Typography variant="body1" align="center">
                {flight.date_retour ? 'Aller-retour' : 'Aller simple'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FlightDetails;