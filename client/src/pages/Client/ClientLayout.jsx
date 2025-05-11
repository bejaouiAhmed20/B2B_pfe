import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box,
  CssBaseline,
  Divider,
  Menu,
  MenuItem,
  Grid,
  Avatar
} from '@mui/material';
import FlightIcon from '@mui/icons-material/Flight';
import FeedbackIcon from '@mui/icons-material/Feedback';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChatBot from '../../components/ChatBot';
// Fix the logo import - note the hyphen in the filename
import logo from '../../assets/Tunisair-Logo.png';

const ClientLayout = () => {
  const isLoggedIn = localStorage.getItem('token') && localStorage.getItem('user');
  const user = isLoggedIn ? JSON.parse(localStorage.getItem('user')) : null;
  const [anchorEl, setAnchorEl] = useState(null);
  const [userAnchorEl, setUserAnchorEl] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuOpen = (event, menuName) => {
    setAnchorEl(event.currentTarget);
    setActiveMenu(menuName);
  };

  const handleUserMenuOpen = (event) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveMenu(null);
    setUserAnchorEl(null);
  };

  const menuItems = {
    flights: [
      { label: 'Rechercher des vols', path: '/client/flights' },
      { label: 'Détails des vols', path: '/client/flights/:id' }
    ],
    news: [
      { label: 'Actualités', path: '/client/news' },
      { label: 'Détails des actualités', path: '/client/news/:id' }
    ],
    reservations: [
      { label: 'Mes Réservations', path: '/client/reservations' },
      { label: 'Tableau des Réservations', path: '/client/reservations-table' },
      { label: 'Réclamations', path: '/client/reclamations' }
    ]
  };

  const userMenuItems = [
    { label: 'Mon Profil', path: '/client/profile' },
    { label: 'Demande Solde', path: '/client/request-solde' },
    { label: 'Déconnexion', action: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login-client';
    }}
  ];

  return (
    <>
      <CssBaseline />
      <AppBar position="static" sx={{ 
        backgroundColor: 'white', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        color: '#333'
      }}>
        <Toolbar sx={{ minHeight: 80 }}>
          {/* Logo Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <img 
              src={logo} 
              alt="Tunisair Logo" 
              style={{ height: 40, marginRight: 10 }}
            />
          </Box>

          {/* Navigation Menus */}
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Button 
              color="inherit" 
              endIcon={<ExpandMoreIcon />}
              onClick={(e) => handleMenuOpen(e, 'flights')}
              sx={{ mx: 1, textTransform: 'uppercase', color: '#333' }}
            >
              Vols
            </Button>
            
            <Button 
              color="inherit" 
              endIcon={<ExpandMoreIcon />}
              onClick={(e) => handleMenuOpen(e, 'news')}
              sx={{ mx: 1, textTransform: 'uppercase', color: '#333' }}
            >
              <NewspaperIcon sx={{ mr: 1 }} />
              Actualités
            </Button>

            {isLoggedIn && (
              <Button 
                color="inherit" 
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => handleMenuOpen(e, 'reservations')}
                sx={{ mx: 1, textTransform: 'uppercase', color: '#333' }}
              >
                Réservations
              </Button>
            )}
          </Box>

          {/* User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoggedIn ? (
              <>
                <Button
                  onClick={handleUserMenuOpen}
                  sx={{ textTransform: 'none', color: '#333' }}
                  startIcon={<Avatar sx={{ width: 32, height: 32 }}>U</Avatar>}
                  endIcon={<ExpandMoreIcon />}
                >
                  {user?.nom || 'Mon Compte'}
                </Button>
                
                <Menu
                  anchorEl={userAnchorEl}
                  open={Boolean(userAnchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      minWidth: 200
                    }
                  }}
                >
                  {userMenuItems.map((item) => (
                    <MenuItem 
                      key={item.label}
                      onClick={() => {
                        handleMenuClose();
                        if(item.action) item.action();
                      }}
                      component={item.path ? Link : 'div'}
                      to={item.path}
                      sx={{ 
                        '&:hover': { backgroundColor: '#f5f5f5' },
                        py: 1.5
                      }}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button 
                color="inherit" 
                component={Link} 
                to="/login-client"
                sx={{ textTransform: 'uppercase', color: '#333' }}
              >
                Connexion
              </Button>
            )}
          </Box>

          {/* Dropdown Menus */}
          {Object.keys(menuItems).map((menuName) => (
            <Menu
              key={menuName}
              anchorEl={anchorEl}
              open={activeMenu === menuName}
              onClose={handleMenuClose}
              MenuListProps={{ onMouseLeave: handleMenuClose }}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              {menuItems[menuName].map((item) => (
                <MenuItem 
                  key={item.path} 
                  onClick={handleMenuClose}
                  component={Link} 
                  to={item.path}
                  sx={{ 
                    minWidth: 200,
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  {item.label}
                </MenuItem>
              ))}
            </Menu>
          ))}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        py: 4,
        backgroundColor: '#f8f9fa'
      }}>
        <Container maxWidth="xl" sx={{ px: 4 }}>
          <Outlet />
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ 
        py: 4,
        bgcolor: 'white',
        color: '#333',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)'
      }}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                <FlightIcon sx={{ mr: 1, color: '#1a237e' }} />
                Tunisair B2B
              </Typography>
              <Typography variant="body2">
                Votre partenaire privilégié pour la gestion des réservations professionnelles.
              </Typography>
            </Grid>
            {/* ... rest of footer content ... */}
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Tunisair B2B. Tous droits réservés.
          </Typography>
        </Container>
      </Box>

      {/* ChatBot */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24, 
        zIndex: 1000 
      }}>
        <ChatBot />
      </Box>
    </>
  );
};

export default ClientLayout;