import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  EventSeat,
  CalendarMonth,
  Flight as FlightIcon
} from '@mui/icons-material';

const FlightDetails = ({ flight, formatDate }) => {
  return (
    <Card className="rounded-2xl shadow-sm overflow-hidden mb-6 border border-gray-100">
      {/* Flight image */}
      <Box className="w-full h-64 bg-gray-100">
        <img
          src={`http://localhost:5000${flight.image_url}`}
          alt="Flight"
          className="w-full h-full object-cover object-center"
        />
      </Box>

      {/* Details section */}
      <CardContent className="px-6 pt-8 pb-6 space-y-10">
        {/* Départ & Arrivée */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box className="flex items-start gap-4">
              <FlightTakeoff className="text-red-600 mt-1" />
              <Box>
                <Typography className="text-sm text-gray-500 font-medium uppercase tracking-wide">Départ</Typography>
                <Typography className="text-gray-800 font-semibold text-base">{flight.airport_depart?.nom}</Typography>
                <Typography className="text-sm text-gray-500">{formatDate(flight.date_depart)}</Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box className="flex items-start gap-4">
              <FlightLand className="text-blue-600 mt-1" />
              <Box>
                <Typography className="text-sm text-gray-500 font-medium uppercase tracking-wide">Arrivée</Typography>
                <Typography className="text-gray-800 font-semibold text-base">{flight.arrival_airport?.nom}</Typography>
                <Typography className="text-sm text-gray-500">{formatDate(flight.date_retour)}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Return Flight Details (if it's a round trip) */}
        {flight.aller_retour && flight.retour_depart_date && flight.retour_arrive_date && (
          <>
            <Typography variant="h6" className="mt-6 mb-3 font-semibold">Vol de retour</Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box className="flex items-start gap-4">
                  <FlightTakeoff className="text-red-600 mt-1" />
                  <Box>
                    <Typography className="text-sm text-gray-500 font-medium uppercase tracking-wide">Départ du retour</Typography>
                    <Typography className="text-gray-800 font-semibold text-base">{flight.arrival_airport?.nom}</Typography>
                    <Typography className="text-sm text-gray-500">{formatDate(flight.retour_depart_date)}</Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box className="flex items-start gap-4">
                  <FlightLand className="text-blue-600 mt-1" />
                  <Box>
                    <Typography className="text-sm text-gray-500 font-medium uppercase tracking-wide">Arrivée du retour</Typography>
                    <Typography className="text-gray-800 font-semibold text-base">{flight.airport_depart?.nom}</Typography>
                    <Typography className="text-sm text-gray-500">{formatDate(flight.retour_arrive_date)}</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </>
        )}

        <Divider className="my-4" />

        {/* Other Info */}
        <Grid container spacing={4}>
          <Grid item xs={6} md={3}>
            <Box className="flex flex-col items-center text-center">
              <AccessTime color="primary" />
              <Typography className="text-xs text-gray-500 mt-1">Durée</Typography>
              <Typography className="font-semibold text-sm">{flight.duree}</Typography>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Box className="flex flex-col items-center text-center">
              <FlightIcon color="primary" />
              <Typography className="text-xs text-gray-500 mt-1">Avion</Typography>
              <Typography className="font-semibold text-sm">{flight.plane?.planeModel}</Typography>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Box className="flex flex-col items-center text-center">
              <EventSeat color="primary" />
              <Typography className="text-xs text-gray-500 mt-1">Capacité</Typography>
              <Typography className="font-semibold text-sm">{flight.plane?.totalSeats}</Typography>
            </Box>
          </Grid>

          <Grid item xs={6} md={3}>
            <Box className="flex flex-col items-center text-center">
              <CalendarMonth color="primary" />
              <Typography className="text-xs text-gray-500 mt-1">Type</Typography>
              <Typography className="font-semibold text-sm">
                {flight.aller_retour ? 'Aller-retour' : 'Aller simple'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FlightDetails;
