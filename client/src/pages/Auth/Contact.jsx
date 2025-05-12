import React from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button
} from '@mui/material';
import { 
  Phone, 
  Email, 
  LocationOn, 
  AccessTime, 
  Language,
  ArrowBack
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';

const Contact = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: 2,
        position: 'relative'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      />
      
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
        <Paper 
          elevation={6} 
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            background: 'rgba(255, 255, 255, 0.95)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <AirplaneTicketIcon sx={{ color: '#CC0A2B', fontSize: 40, mr: 1 }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#CC0A2B' }}>
              Tunisair B2B
            </Typography>
          </Box>
          
          <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ mb: 1, fontWeight: 500 }}>
            Contactez-nous
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Nous sommes à votre disposition pour toute information ou assistance
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#CC0A2B', fontWeight: 500 }}>
                Coordonnées
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Phone sx={{ color: '#CC0A2B' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Téléphone" 
                    secondary="+216 70 837 000" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Email sx={{ color: '#CC0A2B' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email" 
                    secondary="b2b@tunisair.com.tn" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationOn sx={{ color: '#CC0A2B' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Adresse" 
                    secondary="Boulevard Mohamed BOUAZIZI, Tunis Carthage, 2035 Tunis, Tunisie" 
                  />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: '#CC0A2B', fontWeight: 500 }}>
                Informations supplémentaires
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AccessTime sx={{ color: '#CC0A2B' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Heures d'ouverture" 
                    secondary="Lundi - Vendredi: 8h00 - 17h00" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Language sx={{ color: '#CC0A2B' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Site web" 
                    secondary="www.tunisair.com" 
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Phone sx={{ color: '#CC0A2B' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Service client" 
                    secondary="+216 81 700 700" 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Link to="/login-client" style={{ textDecoration: 'none' }}>
              <Button 
                startIcon={<ArrowBack />}
                sx={{ 
                  color: '#CC0A2B',
                  '&:hover': { backgroundColor: 'rgba(204, 10, 43, 0.1)' }
                }}
              >
                Retour à la page de connexion
              </Button>
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Contact;
