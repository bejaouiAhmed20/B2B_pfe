import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box,
  CssBaseline,
  Divider
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import FeedbackIcon from '@mui/icons-material/Feedback';
// Import the ChatBot component
import ChatBot from '../../components/ChatBot';

const ClientLayout = () => {
  const isLoggedIn = localStorage.getItem('token') && localStorage.getItem('user');
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;

  return (
    <>
      <CssBaseline />
      <AppBar position="static" sx={{ backgroundColor: '#CC0A2B' }}>
        <Toolbar>
          <FlightIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component={Link} to="/client" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}>
            TUNISAIR B2B
          </Typography>
          <Button color="inherit" component={Link} to="/client">Accueil</Button>
          <Button color="inherit" component={Link} to="/client/flights">Vols</Button>
          
          {isLoggedIn ? (
            <>
              <Button color="inherit" component={Link} to="/client/reservations">Mes Réservations</Button>
              <Button color="inherit" component={Link} to="/client/reservations-table">Tableau Réservations</Button>
              <Button color="inherit" component={Link} to="/client/request-solde">
                demande solde
              </Button>
              <Button color="inherit" component={Link} to="/client/profile">
                {user?.nom || 'Mon Profil'}
              </Button>
              <Button color="inherit" component={Link} to="/client/reclamations">
                <FeedbackIcon sx={{ mr: 1 }} />
                Réclamations
              </Button>
              <Button 
                color="inherit" 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/login-client';
                }}
              >
                Déconnexion
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login-client">Connexion</Button>
          )}
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
      
      <Box component="footer" sx={{ py: 3, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Divider sx={{ mb: 3 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Air Travel. Tous droits réservés.
          </Typography>
        </Container>
      </Box>

      {/* Add the ChatBot component here */}
      <ChatBot />
    </>
  );
};

export default ClientLayout;