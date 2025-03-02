import React from 'react';
import { Typography, Paper } from '@mui/material';

const Clients = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Clients
      </Typography>
      <Typography variant="body1">
        Client management interface will be implemented here.
      </Typography>
    </Paper>
  );
};

export default Clients;