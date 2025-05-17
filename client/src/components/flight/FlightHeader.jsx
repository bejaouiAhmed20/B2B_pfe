import React from 'react';
import { Typography, Chip, Paper, Button, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FlightHeader = ({ flight, isFlightAvailable }) => {
  const navigate = useNavigate();
  const isAvailable = isFlightAvailable(flight.date_depart);

  return (
    <Paper
      elevation={1}
      className="rounded-2xl px-6 py-5 mb-6 border border-gray-100 shadow-sm"
    >
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/client/flights')}
          variant="outlined"
          color="primary"
          className="w-fit"
        >
          Retour aux vols
        </Button>

        <Chip
          label={isAvailable ? 'Disponible' : 'Complet'}
          color={isAvailable ? 'success' : 'error'}
          className="text-sm font-medium"
          variant="outlined"
        />
      </Box>

      <Typography
        variant="h3"
        component="h1"
        className="text-gray-900 tracking-wide font-extrabold uppercase"
        sx={{
          fontSize: {
            xs: '1.75rem',
            sm: '2rem',
            md: '2.5rem',
          },
        }}
        gutterBottom
      >
        {flight.titre}
      </Typography>
    </Paper>
  );
};

export default FlightHeader;
