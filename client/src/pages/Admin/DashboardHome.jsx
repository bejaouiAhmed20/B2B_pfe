import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const DashboardHome = () => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Welcome to Dashboard
      </Typography>
      <Typography variant="body1">
        Select an option from the sidebar to manage your content.
      </Typography>
    </Paper>
  );
};

export default DashboardHome;