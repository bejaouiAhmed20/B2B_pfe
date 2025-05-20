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
  Divider,
  Paper,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import FlightIcon from '@mui/icons-material/Flight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import axios from 'axios';
import NotFoundImage from '../../assets/notfound.jpg';
import { Skeleton } from '@mui/material';

const Home = () => {
  const navigate = useNavigate();
  const [featuredFlights, setFeaturedFlights] = useState([]);
  const [popularLocations, setPopularLocations] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    // Inside the useEffect where you fetch data
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

        // Create popular locations from locations data
        const locationsResponse = await axios.get('http://localhost:5000/api/locations');
        const locations = locationsResponse.data.slice(0, 6).map(location => ({
          id: location.id,
          name: location.ville || location.nom,
          country: location.pays || 'International',
          image_url: location.url_image || null
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
      {/* Hero Section - Enhanced with overlay and animation */}
      <Box sx={{
        height: { xs: '400px', md: '600px' },
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle, rgba(204,10,43,0.2) 0%, rgba(0,0,0,0) 70%)',
          zIndex: 1
        }
      }}>
        <Container sx={{ position: 'relative', zIndex: 2, animation: 'fadeIn 1.5s ease-in-out' }}>
          <Typography
            variant="h2"
            gutterBottom
            fontWeight="bold"
            sx={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' }
            }}
          >
            Voyagez Avec Nous
          </Typography>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              mb: 4,
              maxWidth: '800px',
              mx: 'auto',
              textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
              fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
            }}
          >
            Découvrez le monde avec nos offres exclusives
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/client/flights"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              mt: 3,
              bgcolor: '#CC0A2B',
              '&:hover': {
                bgcolor: '#a00923',
                transform: 'translateY(-3px)',
                boxShadow: '0 6px 12px rgba(204, 10, 43, 0.3)'
              },
              px: 4,
              py: 1.5,
              fontSize: { xs: '0.9rem', md: '1.1rem' },
              borderRadius: '30px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            Parcourir les Vols
          </Button>
        </Container>
      </Box>

      {/* Featured Flights - Enhanced card design to match destinations */}
      <Box sx={{
        bgcolor: '#f8f9fa',
        py: { xs: 4, md: 8 },
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100px',
          background: 'linear-gradient(to bottom, white, #f8f9fa)',
          zIndex: 1
        }
      }}>
        <Container sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ bgcolor: '#CC0A2B', mr: 2 }}>
              <FlightTakeoffIcon />
            </Avatar>
            <Typography variant="h4" fontWeight="medium" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Vols Récents
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
                        position: 'relative',
                        height: '100%',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                        }
                      }}
                      onClick={() => handleFlightClick(flight.id)}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={flight.image_url ? `http://localhost:5000${flight.image_url}` : NotFoundImage}
                        alt={flight.title}
                        onError={(e) => {
                          e.target.src = NotFoundImage;
                        }}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                      <Chip
                        label="Récent"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          bgcolor: '#CC0A2B',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                          p: 3,
                          color: 'white'
                        }}
                      >
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {flight.title}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <FlightIcon sx={{ color: 'white', mr: 1, fontSize: '1rem' }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'white' }}>
                              {flight.departure}
                            </Typography>
                            <Box sx={{
                              height: '1px',
                              bgcolor: 'rgba(255,255,255,0.5)',
                              flex: 1,
                              mx: 1,
                              position: 'relative',
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                right: 0,
                                top: '-3px',
                                width: 0,
                                height: 0,
                                borderTop: '3.5px solid transparent',
                                borderLeft: '7px solid rgba(255,255,255,0.5)',
                                borderBottom: '3.5px solid transparent',
                              }
                            }} />
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'white' }}>
                              {flight.arrival}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarTodayIcon sx={{ color: 'white', mr: 1, fontSize: '0.9rem' }} />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            {formatDate(flight.date)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                            {flight.price} DT
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              color: 'white',
                              borderColor: 'white',
                              borderRadius: '20px',
                              '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.2)',
                                borderColor: 'white'
                              }
                            }}
                          >
                            Détails
                          </Button>
                        </Box>
                      </Box>
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
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderColor: '#CC0A2B',
                color: '#CC0A2B',
                borderRadius: '30px',
                px: 3,
                '&:hover': {
                  borderColor: '#a00923',
                  backgroundColor: 'rgba(204, 10, 43, 0.04)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Voir Tous les Vols
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Popular Locations - Updated to show 6 destinations */}
      <Box sx={{
        bgcolor: 'white',
        py: { xs: 4, md: 8 },
        position: 'relative'
      }}>
        <Container sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ bgcolor: '#CC0A2B', mr: 2 }}>
              <LocationOnIcon />
            </Avatar>
            <Typography variant="h4" fontWeight="medium" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Destinations Populaires
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#CC0A2B' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {popularLocations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, width: '100%' }}>
                  <Typography variant="body1" color="text.secondary">
                    Aucune destination disponible pour le moment.
                  </Typography>
                </Box>
              ) : (
                // Modify this to show 6 destinations instead of 3
                [...popularLocations, ...popularLocations].slice(0, 6).map((location, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`${location.id}-${index}`}>
                    <Card sx={{
                      position: 'relative',
                      height: 280,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.03)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                      },
                      '&:hover .location-overlay': {
                        opacity: 1
                      },
                      '&:hover .location-content': {
                        transform: 'translateY(0)'
                      }
                    }}>
                      <CardMedia
                        component="img"
                        height="280"
                        image={
                          location.image_url
                            ? `http://localhost:5000${location.image_url}`
                            : 'https://source.unsplash.com/random/?city'
                        }
                        alt={location.name}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.1)'
                          }
                        }}
                      />
                      <Box
                        className="location-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1))',
                          opacity: 0.8,
                          transition: 'opacity 0.3s ease'
                        }}
                      />
                      <Box
                        className="location-content"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: 3,
                          color: 'white',
                          transform: 'translateY(10px)',
                          transition: 'transform 0.3s ease'
                        }}
                      >
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          {location.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LocationOnIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                          <Typography variant="body2">
                            {location.country}
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          to={`/client/locations/${location.id}`}
                          sx={{
                            color: 'white',
                            borderColor: 'white',
                            mt: 1,
                            '&:hover': {
                              bgcolor: 'rgba(255,255,255,0.2)',
                              borderColor: 'white'
                            }
                          }}
                        >
                          Explorer
                        </Button>
                      </Box>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          )}
        </Container>
      </Box>

      {/* Services Section - Enhanced with icons and hover effects */}
      <Container sx={{ py: { xs: 4, md: 8 } }}>
        <Typography variant="h4" gutterBottom fontWeight="medium" sx={{ mb: 4, textAlign: 'center', fontSize: { xs: '1.5rem', md: '2rem' } }}>
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
                p: 4,
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                border: '1px solid #eee',
                boxShadow: 'none',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  borderColor: 'transparent'
                }
              }}>
                <Box sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: '50%',
                  bgcolor: 'rgba(204, 10, 43, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'rgba(204, 10, 43, 0.2)',
                    transform: 'rotate(10deg)'
                  }
                }}>
                  {service.icon}
                </Box>
                <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
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

      {/* Latest News - Enhanced card design */}
      <Box sx={{ bgcolor: '#f8f9fa', py: { xs: 4, md: 8 } }}>
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar sx={{ bgcolor: '#CC0A2B', mr: 2 }}>
              <NewspaperIcon />
            </Avatar>
            <Typography variant="h4" fontWeight="medium" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
              Dernières Actualités
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#CC0A2B' }} />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {latestNews.slice(0, 3).map((news, index) => (
                <Grid item xs={12} md={4} key={news.id}>
                  <Card sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
                    <Box sx={{
                      p: 3,
                      borderBottom: '1px solid #f0f0f0',
                      background: index % 3 === 0 ? 'linear-gradient(135deg, #f8f9fa, #e9ecef)' :
                               index % 3 === 1 ? 'linear-gradient(135deg, #f8f9fa, #e2f0fd)' :
                               'linear-gradient(135deg, #f8f9fa, #ffeae9)'
                    }}>
                      <Typography gutterBottom variant="h6" component="div" fontWeight="bold">
                        {news.titre || news.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <CalendarTodayIcon sx={{ color: '#666', fontSize: '0.9rem', mr: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(news.date_creation || news.date)}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {(news.contenu || news.content)?.substring(0, 150)}
                        {(news.contenu || news.content)?.length > 150 ? '...' : ''}
                      </Typography>
                    </CardContent>
                    <Box sx={{ p: 2, pt: 0, borderTop: '1px solid #f0f0f0', textAlign: 'right' }}>
                      <Button
                        size="small"
                        component={Link}
                        to={`/client/news/${news.id}`}
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          color: '#CC0A2B',
                          '&:hover': {
                            backgroundColor: 'rgba(204, 10, 43, 0.04)',
                            transform: 'translateX(3px)'
                          },
                          transition: 'all 0.3s ease'
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
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderColor: '#CC0A2B',
                color: '#CC0A2B',
                borderRadius: '30px',
                px: 3,
                '&:hover': {
                  borderColor: '#a00923',
                  backgroundColor: 'rgba(204, 10, 43, 0.04)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Voir Toutes les Actualités
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Add a global style for animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Box>
  );
};

export default Home;
