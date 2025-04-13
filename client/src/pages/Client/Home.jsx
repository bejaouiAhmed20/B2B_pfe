import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Button,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Home = () => {
  return (
    <Box>
      {/* Hero Section - Completely rewritten to fix the icon issue */}
      <Box 
        sx={{ 
          height: '500px',
          mb: 4,
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '0 16px'
        }}
      >
        <Typography component="h1" variant="h2" gutterBottom>
          Voyagez avec Confiance
        </Typography>
        <Typography variant="h5" paragraph sx={{ mb: 4, maxWidth: '800px' }}>
          Découvrez les meilleures offres de vols pour vos voyages d'affaires et de loisirs
        </Typography>
        <Button 
          variant="contained" 
          component={Link} 
          to="/client/flights"
          size="large"
          sx={{ 
            backgroundColor: '#CC0A2B',
            '&:hover': {
              backgroundColor: '#A00823',
            }
          }}
        >
          VOIR LES VOLS DISPONIBLES
        </Button>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Nos Services
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Nous offrons une gamme complète de services pour répondre à tous vos besoins de voyage
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  backgroundColor: '#CC0A2B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FlightTakeoffIcon sx={{ fontSize: 80, color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  Réservation de Vols
                </Typography>
                <Typography>
                  Accédez à une large sélection de vols internationaux et domestiques avec les meilleures compagnies aériennes.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  backgroundColor: '#1976d2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LocalOfferIcon sx={{ fontSize: 80, color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  Offres Spéciales
                </Typography>
                <Typography>
                  Profitez de nos offres exclusives et de nos tarifs préférentiels pour vos voyages d'affaires et de loisirs.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  backgroundColor: '#2e7d32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <SupportAgentIcon sx={{ fontSize: 80, color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  Support Client
                </Typography>
                <Typography>
                  Notre équipe de support est disponible 24/7 pour vous assister dans toutes vos démarches de voyage.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            À Propos de Nous
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Notre agence de voyage est spécialisée dans la fourniture de services de voyage de haute qualité pour les particuliers et les entreprises. 
            Avec plus de 10 ans d'expérience dans l'industrie, nous nous engageons à offrir des solutions de voyage personnalisées qui répondent aux besoins spécifiques de nos clients.
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Notre mission est de rendre le voyage accessible, confortable et agréable pour tous nos clients, en leur offrant les meilleurs tarifs et un service client exceptionnel.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;