import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
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
  Tooltip,
  Avatar,
  Badge,
  Menu,
  MenuItem,
  ListItemButton,
  Paper,
  InputBase,
  alpha,
  Collapse,
  ListSubheader
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
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FeedbackIcon from '@mui/icons-material/Feedback';
import AirlinesIcon from '@mui/icons-material/Airlines';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import api from '../../services/api';
import tunisairLogo from '../../assets/Tunisair-Logo.png';

const drawerWidth = 260;

// Grouper les éléments du menu par catégorie
const menuCategories = [
  {
    category: "Général",
    items: [
      { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/admin' }
    ]
  },
  {
    category: "Utilisateurs",
    items: [
      { text: 'Clients', icon: <PeopleIcon />, path: '/admin/clients' },
      { text: 'Contrats B2B', icon: <DescriptionIcon />, path: '/admin/contracts' },
      { text: 'Réclamations', icon: <FeedbackIcon />, path: '/admin/reclamations' },
      { text: 'Demandes de Solde', icon: <AccountBalanceWalletIcon />, path: '/admin/request-solde' }
    ]
  },
  {
    category: "Vols",
    items: [
      { text: 'Vols', icon: <FlightIcon />, path: '/admin/flights' },
      { text: 'Avions', icon: <AirlinesIcon />, path: '/admin/planes' },
      { text: 'Sièges', icon: <EventSeatIcon />, path: '/admin/seats' },
      { text: 'Réservations', icon: <FlightIcon />, path: '/admin/reservations' }
    ]
  },
  {
    category: "Destinations",
    items: [
      { text: 'Emplacements', icon: <LocationOnIcon />, path: '/admin/locations' },
      { text: 'Aéroports', icon: <AirportShuttleIcon />, path: '/admin/airports' }
    ]
  },
  {
    category: "Marketing",
    items: [
      { text: 'Actualités', icon: <NewReleasesIcon />, path: '/admin/news' },
      { text: 'Codes Promo', icon: <LocalOfferIcon />, path: '/admin/coupons' },
      { text: 'Popups', icon: <NewspaperIcon />, path: '/admin/popups' }
    ]
  }
];

// Thème personnalisé avec des couleurs Tunisair
const getTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#CC0A2B', // Rouge Tunisair
      light: '#e63e5c',
      dark: '#8c0018',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1A2B4A', // Bleu foncé Tunisair
      light: '#445a7a',
      dark: '#0d1526',
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#1A2B4A' : '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: mode === 'dark' ? alpha('#CC0A2B', 0.2) : alpha('#CC0A2B', 0.1),
            '&:hover': {
              backgroundColor: mode === 'dark' ? alpha('#CC0A2B', 0.3) : alpha('#CC0A2B', 0.2),
            },
          },
        },
      },
    },
  },
});

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const isMobile = useMediaQuery('(max-width: 960px)');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = getTheme(darkMode ? 'dark' : 'light');

  // Fermer le drawer sur mobile après navigation
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('adminDarkMode', !darkMode);
  };

  // Charger la préférence de thème au démarrage
  useEffect(() => {
    const savedMode = localStorage.getItem('adminDarkMode');
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    }
  }, []);

  const handleCategoryClick = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setNotificationsAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      console.log('Déconnexion en cours...');

      // Utiliser le service API qui gère automatiquement les headers et cookies
      await api.post('/auth/logout', {});

      console.log('Réponse de déconnexion reçue, suppression des données locales');

      // Supprimer les données d'authentification du localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');

      // Vider également sessionStorage par précaution
      sessionStorage.clear();

      console.log('Données d\'authentification supprimées, redirection vers la page de connexion');

      // Rediriger vers la page de connexion
      navigate('/login');
    } catch (error) {
      console.error('Échec de la déconnexion:', error);

      // Même en cas d'erreur, supprimer les données d'authentification
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      sessionStorage.clear();

      // Rediriger vers la page de connexion
      navigate('/login');
    }
  };

  const isSelected = (path) => {
    return location.pathname === path;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            transition: 'width 0.3s ease-in-out',
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.primary.main,
          }}
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src={tunisairLogo}
                alt="Tunisair Logo"
                style={{
                  height: 40,
                  marginRight: 12,
                  backgroundColor: 'white',
                  padding: '4px',
                  borderRadius: '4px'
                }}
              />
              <Typography variant="h6" noWrap component="div">
                Admin Tunisair B2B
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Bouton de mode sombre/clair */}
            <IconButton
              color="inherit"
              onClick={toggleDarkMode}
              aria-label="basculer mode sombre"
              sx={{ mr: 2 }}
            >
              {darkMode ? <BrightnessHighIcon /> : <Brightness4Icon />}
            </IconButton>

            {/* Bouton de déconnexion */}
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                borderRadius: '20px',
                px: 2,
                py: 0.5,
                border: '1px solid',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Déconnexion
            </Button>
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
          <Box sx={{ overflow: 'auto', mt: 2 }}>
            {menuCategories.map((category) => (
              <React.Fragment key={category.category}>
                <ListItem
                  button
                  onClick={() => handleCategoryClick(category.category)}
                  sx={{
                    py: 0.5,
                    color: theme.palette.mode === 'dark' ? theme.palette.grey[300] : theme.palette.text.secondary
                  }}
                >
                  <ListItemText
                    primary={category.category}
                    primaryTypographyProps={{
                      fontWeight: 'bold',
                      variant: 'body2',
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}
                  />
                  {expandedCategory === category.category ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={expandedCategory === category.category || expandedCategory === null} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {category.items.map((item) => (
                      <ListItemButton
                        key={item.text}
                        component={Link}
                        to={item.path}
                        selected={isSelected(item.path)}
                        sx={{
                          pl: 3,
                          py: 1,
                          color: theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.text.primary,
                        }}
                      >
                        <ListItemIcon sx={{
                          color: isSelected(item.path)
                            ? theme.palette.primary.main
                            : (theme.palette.mode === 'dark' ? theme.palette.common.white : 'inherit')
                        }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: '0.9rem',
                            fontWeight: isSelected(item.path) ? 'medium' : 'normal'
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
                <Divider sx={{ my: 1 }} />
              </React.Fragment>
            ))}
          </Box>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            mt: 8,
            backgroundColor: theme.palette.background.default,
            minHeight: '100vh',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}