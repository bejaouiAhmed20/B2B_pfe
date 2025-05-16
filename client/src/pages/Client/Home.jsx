import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Button,
  CardMedia,
  CircularProgress,
  Divider
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import axios from 'axios';
import NotFoundImage from '../../assets/notfound.jpg';
import { Skeleton } from '@mui/material';

const Home = () => {
  const navigate = useNavigate();
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [popularLocations, setPopularLocations] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Services data
  const services = [
    {
      id: 1,
      title: 'Réservation de Vols',
      description: 'Réservez votre vol idéal parmi notre large sélection de compagnies aériennes',
      icon: <FlightTakeoffIcon sx={{ fontSize: 40, color: '#CC0A2B' }} />
    },
    {
      id: 2,
      title: 'Offres Spéciales',
      description: 'Profitez de nos offres exclusives et économisez sur vos voyages',
      icon: <LocalOfferIcon sx={{ fontSize: 40, color: '#CC0A2B' }} />
    },
    {
      id: 3,
      title: 'Support Client 24/7',
      description: 'Notre équipe est disponible à tout moment pour vous assister',
      icon: <SupportAgentIcon sx={{ fontSize: 40, color: '#CC0A2B' }} />
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch flights
        const flightsResponse = await axios.get('http://localhost:5000/api/flights');
        
        // Get only the first 3 flights for featured section
        // Filter for upcoming flights only
        const upcomingFlights = flightsResponse.data
        .filter(flight => new Date(flight.date_depart) > new Date())
        .sort((a, b) => new Date(a.date_depart) - new Date(b.date_depart))
        .slice(0, 3);
        
        const flights = upcomingFlights.map(flight => ({
          id: flight.id,
          title: flight.titre,
          departure: flight.airport_depart?.nom || 'Départ',
          arrival: flight.airport_arrivee?.nom || 'Arrivée',
          date: flight.date_depart,
          price: flight.prix,
          image_url: flight.image_url
        }));
        
        setFeaturedFlights(flights);
        
        // Create popular locations from airports data
        // You can replace this with a dedicated API endpoint if you have one
        const airportsResponse = await axios.get('http://localhost:5000/api/locations');
        const locations = airportsResponse.data.slice(0, 3).map(airport => ({
          id: airport.id,
          name: airport.ville || airport.nom,
          country: airport.pays || 'International',
          image_url: airport.image_url || null
        }));
        
        setPopularLocations(locations);
        
        // Fetch news
        try {
          const newsResponse = await axios.get('http://localhost:5000/api/news');
          setLatestNews(newsResponse.data);
        } catch (error) {
          console.error('Error fetching news:', error);
          // Fallback to static news if API fails
          setLatestNews([
            {
              id: 1,
              title: 'Nouvelles Destinations',
              content: 'Découvrez nos dernières destinations ajoutées pour 2024',
              date: '2024-02-01'
            },
            {
              id: 2,
              title: 'Promotion d\'Été',
              content: 'Profitez de nos offres spéciales pour vos vacances d\'été',
              date: '2024-01-15'
            },
            {
              id: 3,
              title: 'Mise à Jour COVID-19',
              content: 'Informations importantes concernant les voyages pendant la pandémie',
              date: '2024-01-05'
            }
          ]);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleFlightClick = (flightId) => {
    navigate(`/client/flights/${flightId}`);
  };

  // Function to render skeleton loading for flights
  const renderSkeletonLoading = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} md={4} key={item}>
          <Card sx={{ height: '100%' }}>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={30} width="80%" />
              <Skeleton variant="text" height={20} width="60%" />
              <Skeleton variant="text" height={20} width="40%" />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Skeleton variant="text" width="30%" height={30} />
                <Skeleton variant="rectangular" width="30%" height={36} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        height: '500px',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        p: 2
      }}>
        <Container>
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Voyagez Avec Nous
          </Typography>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            Découvrez le monde avec nos offres exclusives
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/client/flights"
            size="large"
            sx={{ 
              mt: 3, 
              bgcolor: '#CC0A2B', 
              '&:hover': { bgcolor: '#a00923' },
              px: 4,
              py: 1.5,
              fontSize: '1.1rem'
            }}
          >
            Parcourir les Vols
          </Button>
        </Container>
      </Box>

      {/* Featured Flights */}
      <Container sx={{ py: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <FlightTakeoffIcon sx={{ fontSize: 30, color: '#CC0A2B', mr: 2 }} />
          <Typography variant="h4" fontWeight="medium">
            Vols Populaires
          </Typography>
        </Box>
        
        {loading ? (
          renderSkeletonLoading()
        ) : (
          <Grid container spacing={3}>
            {featuredFlights.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4, width: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  Aucun vol disponible pour le moment.
                </Typography>
              </Box>
            ) : (
              featuredFlights.map((flight) => (
                <Grid item xs={12} md={4} key={flight.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                      }
                    }}
                    onClick={() => handleFlightClick(flight.id)}
                  >
                    <CardMedia
                      component="img"
                      height="140"
                      image={flight.image_url ? `http://localhost:5000${flight.image_url}` : NotFoundImage}
                      alt={flight.title}
                      onError={(e) => {
                        e.target.src = NotFoundImage;
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h6" component="div">
                        {flight.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {flight.departure}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {flight.arrival}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {formatDate(flight.date)}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 2, color: '#CC0A2B' }}>
                        {flight.price} DT
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="outlined" 
            component={Link} 
            to="/client/flights"
            sx={{ 
              borderColor: '#CC0A2B', 
              color: '#CC0A2B',
              '&:hover': { 
                borderColor: '#a00923', 
                backgroundColor: 'rgba(204, 10, 43, 0.04)' 
              }
            }}
          >
            Voir Tous les Vols
          </Button>
        </Box>
      </Container>

      {/* Popular Locations */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 6 }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <LocationOnIcon sx={{ fontSize: 30, color: '#CC0A2B', mr: 2 }} />
            <Typography variant="h4" fontWeight="medium">
              Destinations Populaires
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#CC0A2B' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {popularLocations.length === 0 && !loading ? (
                <Box sx={{ textAlign: 'center', py: 4, width: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucune destination disponible pour le moment.
                  </Typography>
                </Box>
              ) : (
                popularLocations.map((location) => (
                  <Grid item xs={12} md={4} key={location.id}>
                    <Card sx={{ 
                      position: 'relative',
                      height: 200,
                      overflow: 'hidden',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.03)',
                      }
                    }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={location.image_url ? `http://localhost:5000${location.image_url}` : "https://source.unsplash.com/random/300x200/?city"}
                        alt={location.name}
                      />
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        p: 2
                      }}>
                        <Typography variant="h6" component="div">
                          {location.name}
                        </Typography>
                        <Typography variant="body2">
                          {location.country}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Services Section */}
      <Container sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom fontWeight="medium" sx={{ mb: 4, textAlign: 'center' }}>
          Nos Services
        </Typography>
        
        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid item xs={12} md={4} key={service.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: 3,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                }
              }}>
                <Box sx={{ mb: 2 }}>
                  {service.icon}
                </Box>
                <Typography variant="h6" component="div" gutterBottom>
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Latest News */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 6 }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <NewspaperIcon sx={{ fontSize: 30, color: '#CC0A2B', mr: 2 }} />
            <Typography variant="h4" fontWeight="medium">
              Dernières Actualités
            </Typography>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#CC0A2B' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {latestNews.slice(0, 3).map((news) => (
                <Grid item xs={12} md={4} key={news.id}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="div">
                        {news.titre || news.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {formatDate(news.date_creation || news.date)}
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2">
                        {(news.contenu || news.content)?.substring(0, 150)}
                        {(news.contenu || news.content)?.length > 150 ? '...' : ''}
                      </Typography>
                    </CardContent>
                    <Box sx={{ mt: 'auto', p: 2, pt: 0 }}>
                      <Button 
                        size="small" 
                        component={Link} 
                        to={`/client/news/${news.id}`}
                        sx={{ 
                          color: '#CC0A2B',
                          '&:hover': { 
                            backgroundColor: 'rgba(204, 10, 43, 0.04)' 
                          }
                        }}
                      >
                        Lire la suite
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              component={Link} 
              to="/client/news"
              sx={{ 
                borderColor: '#CC0A2B', 
                color: '#CC0A2B',
                '&:hover': { 
                  borderColor: '#a00923', 
                  backgroundColor: 'rgba(204, 10, 43, 0.04)' 
                }
              }}
            >
              Voir Toutes les Actualités
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
