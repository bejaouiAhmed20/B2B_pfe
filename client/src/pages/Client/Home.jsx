import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Button,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import axios from 'axios';

const Home = () => {
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured flights with error handling
        let flightsData = [];
        try {
          const flightsResponse = await axios.get('http://localhost:5000/api/flights?limit=3');
          flightsData = flightsResponse.data || [];
        } catch (flightErr) {
          console.error('Error fetching flights:', flightErr);
          // Continue with empty flights array
        }
        
        // Fetch latest news with error handling
        let newsData = [];
        try {
          const newsResponse = await axios.get('http://localhost:5000/api/news?limit=3');
          newsData = newsResponse.data || [];
        } catch (newsErr) {
          console.error('Error fetching news:', newsErr);
          // Continue with empty news array
        }
        
        // Services data - could be fetched from an API if you have one
        const servicesData = [
          {
            id: 1,
            title: 'Réservation de Vols',
            description: 'Accédez à une large sélection de vols internationaux et domestiques avec les meilleures compagnies aériennes.',
            icon: 'flight',
            color: '#CC0A2B'
          },
          {
            id: 2,
            title: 'Offres Spéciales',
            description: "Profitez de nos offres exclusives et de nos tarifs préférentiels pour vos voyages d'affaires et de loisirs.",
            icon: 'offer',
            color: '#1976d2'
          },
          {
            id: 3,
            title: 'Support Client',
            description: 'Notre équipe de support est disponible 24/7 pour vous assister dans toutes vos démarches de voyage.',
            icon: 'support',
            color: '#2e7d32'
          }
        ];
        
        setFeaturedFlights(flightsData);
        setLatestNews(newsData);
        setServices(servicesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Une erreur est survenue lors du chargement des données.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to format date with null check
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Date invalide';
    }
  };

  // Helper function to format price with null check
  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'Prix non disponible';
    try {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'TND' }).format(price);
    } catch (err) {
      console.error('Error formatting price:', err);
      return 'Prix invalide';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero Section */}
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

      {/* Featured Flights Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Vols Populaires
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Découvrez nos destinations les plus prisées
        </Typography>

        <Grid container spacing={4}>
          {featuredFlights && featuredFlights.length > 0 ? (
            featuredFlights.map((flight) => (
              <Grid item xs={12} md={4} key={flight?.id || Math.random()}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      pt: '56.25%',
                      backgroundColor: '#f5f5f5',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexDirection: 'column'
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {flight?.airport_depart?.ville || 'Départ'} → {flight?.airport_arrivee?.ville || 'Arrivée'}
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(flight?.date_depart)}
                      </Typography>
                    </Box>
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {flight?.titre || flight?.numero_vol ? `Vol ${flight.numero_vol}` : 'Vol'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Compagnie: {flight?.compagnie_aerienne || 'Non spécifiée'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Départ: {formatDate(flight?.date_depart)}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                      {formatPrice(flight?.prix)}
                    </Typography>
                    <Button 
                      variant="outlined" 
                      component={Link} 
                      to={flight?.id ? `/client/flights/${flight.id}` : '/client/flights'}
                      sx={{ mt: 2 }}
                      fullWidth
                    >
                      Voir les détails
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography align="center">Aucun vol disponible pour le moment.</Typography>
            </Grid>
          )}
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            component={Link} 
            to="/client/flights"
            sx={{ 
              backgroundColor: '#CC0A2B',
              '&:hover': {
                backgroundColor: '#A00823',
              }
            }}
          >
            Voir tous les vols
          </Button>
        </Box>
      </Container>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Nos Services
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Nous offrons une gamme complète de services pour répondre à tous vos besoins de voyage
        </Typography>

        <Grid container spacing={4}>
          {services && services.map((service) => (
            <Grid item xs={12} md={4} key={service?.id || Math.random()}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="div"
                  sx={{
                    pt: '56.25%',
                    backgroundColor: service?.color || '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {service?.icon === 'flight' && (
                    <FlightTakeoffIcon sx={{ fontSize: 80, color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                  )}
                  {service?.icon === 'offer' && (
                    <LocalOfferIcon sx={{ fontSize: 80, color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                  )}
                  {service?.icon === 'support' && (
                    <SupportAgentIcon sx={{ fontSize: 80, color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                  )}
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {service?.title || 'Service'}
                  </Typography>
                  <Typography>
                    {service?.description || 'Description du service'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Latest News Section - Only render if news data exists */}
      {latestNews && latestNews.length > 0 && (
        <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h2" align="center" gutterBottom>
              Actualités et Promotions
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
              Restez informé des dernières nouvelles et offres spéciales
            </Typography>
            
            <Grid container spacing={4}>
              {latestNews.map((news) => (
                <Grid item xs={12} md={4} key={news?.id || Math.random()}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {news?.image_url ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={`http://localhost:5000/${news.image_url}`}
                        alt={news?.title || 'News'}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=News';
                        }}
                      />
                    ) : (
                      <CardMedia
                        component="img"
                        height="200"
                        image="https://via.placeholder.com/300x200?text=News"
                        alt="News placeholder"
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="h2">
                        {news?.title || 'Actualité'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Publié le {formatDate(news?.date)}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {news?.content ? 
                          (news.content.length > 150 
                            ? `${news.content.substring(0, 150)}...` 
                            : news.content)
                          : 'Contenu non disponible'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      )}

      {/* About Section */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
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