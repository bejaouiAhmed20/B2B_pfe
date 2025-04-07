import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  CssBaseline, 
  Typography, 
  useMediaQuery, 
  ThemeProvider, 
  createTheme, 
  Box,
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PeopleIcon from '@mui/icons-material/People';
import FlightIcon from '@mui/icons-material/Flight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AirlinesIcon from '@mui/icons-material/Airlines';
import EventSeatIcon from '@mui/icons-material/EventSeat';


const drawerWidth = 250;

const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Gérer les Clients', icon: <PeopleIcon />, path: '/admin/clients' },
  { text: 'Gérer les Vols', icon: <FlightIcon />, path: '/admin/flights' },
  { text: 'Gérer les Emplacements', icon: <LocationOnIcon />, path: '/admin/locations' },
  { text: 'Gérer les Aéroports', icon: <AirportShuttleIcon />, path: '/admin/airports' },
  { text: 'Gérer les Actualités', icon: <NewReleasesIcon />, path: '/admin/news' },
  { text: 'Gérer les Coupons', icon: <LocalOfferIcon />, path: '/admin/coupons' },
  { text: 'Gérer les Contrats', icon: <DescriptionIcon />, path: '/admin/contracts' },
  { text: 'Gérer les Popups', icon: <NewspaperIcon />, path: '/admin/popups' },
  { text: 'Gérer les Réservations', icon: <FlightIcon />, path: '/admin/reservations' },
  { text: 'Gérer les Avions', icon: <AirlinesIcon />, path: '/admin/planes' },
  { text: 'Gérer les Sièges', icon: <EventSeatIcon />, path: '/admin/seats' },
  { text: 'Gérer les Demandes de Solde', icon: <AccountBalanceWalletIcon />, path: '/admin/request-solde' },
  { text: 'Gérer les Réclamations', icon: <FeedbackIcon />, path: '/admin/reclamations' }
];

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
  },
});

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = async () => {
    try {
      // Call the logout endpoint
      await axios.post('http://localhost:5000/api/auth/logout');
      
      // Remove token from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the server request fails, we still want to clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            transition: 'width 0.3s ease-in-out',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="ouvrir le tiroir"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Tableau de Bord Admin
            </Typography>
            <IconButton color="inherit" onClick={toggleDarkMode} aria-label="basculer mode sombre" sx={{ mr: 2 }}>
              {darkMode ? '☀️' : '🌙'}
            </IconButton>
            <Tooltip title="Déconnexion">
              <Button 
                color="inherit" 
                onClick={handleLogout} 
                startIcon={<LogoutIcon />}
              >
                Déconnexion
              </Button>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? open : true}
          onClose={isMobile ? handleDrawerToggle : undefined}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: '4px',
              },
              scrollbarWidth: 'thin',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.3,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{ 
                      noWrap: true,
                      fontSize: '0.9rem'
                    }}
                    sx={{
                      opacity: open ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                  />
                </ListItem>
              ))}
              <Divider sx={{ my: 2 }} />
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  mx: 1,
                  my: 0.3,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  color: 'error.main'
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: open ? 2 : 'auto', color: 'inherit' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Déconnexion"
                  primaryTypographyProps={{ 
                    noWrap: true,
                    fontSize: '0.9rem'
                  }}
                  sx={{
                    opacity: open ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}