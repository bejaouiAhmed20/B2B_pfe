import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, CssBaseline, Typography, useMediaQuery, ThemeProvider, createTheme, Box } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import PeopleIcon from '@mui/icons-material/People';
import FlightIcon from '@mui/icons-material/Flight';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
// Add these imports to your existing imports
import NewspaperIcon from '@mui/icons-material/Newspaper';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const drawerWidth = 250;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
  { text: 'Manage Clients', icon: <PeopleIcon />, path: '/admin/clients' },
  { text: 'Manage Flights', icon: <FlightIcon />, path: '/admin/flights' },
  { text: 'Manage Location', icon: <LocationOnIcon />, path: '/admin/locations' },
  { text: 'Manage Airports', icon: <AirportShuttleIcon />, path: '/admin/airports' },
  { text: 'Manage News', icon: <NewReleasesIcon />, path: '/admin/news' },
  { text: 'Manage Coupon', icon: <LocalOfferIcon />, path: '/admin/coupons' },
  { text: 'Manage Popups', icon: <NewspaperIcon />, path: '/admin/popups' },
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

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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
            // width: { sm: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          }}
        >
          <Toolbar>
           
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Admin Dashboard
            </Typography>
            <IconButton color="inherit" onClick={toggleDarkMode} aria-label="toggle dark mode">
              {darkMode ? '☀️' : '🌙'}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={open}
          onClose={isMobile ? handleDrawerToggle : undefined}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              overflowX: 'hidden', // Hide horizontal scrollbar
              '&::-webkit-scrollbar': {
                display: 'none', // Hide scrollbar for Chrome/Safari/Opera
              },
              scrollbarWidth: 'none', // Hide scrollbar for Firefox
              msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'hidden' }}> {/* Changed from 'auto' to 'hidden' */}
            <List>
              {menuItems.map((item) => (
                <ListItem
                  button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: '8px',
                    mx: 1,
                    my: 0.5,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: open ? 3 : 'auto' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      opacity: open ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                    }}
                  />
                </ListItem>
              ))}
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