import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  Button,
  CardMedia
} from '@mui/material';
import { Link } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Home = () => {
  // Static data
  const featuredFlights = [
    {
      id: 1,
      title: 'Paris to Rome',
      departure: 'CDG Airport',
      arrival: 'FCO Airport',
      date: '2024-03-15',
      price: 450,
      image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd'
    },
    // Add more static flights as needed
  ];

  const services = [
    {
      id: 1,
      title: 'Flight Booking',
      description: 'Book your perfect flight with our wide selection of airlines',
      icon: <FlightTakeoffIcon sx={{ fontSize: 40 }} />
    },
    // Add more services
  ];

  const latestNews = [
    {
      id: 1,
      title: 'New Destinations',
      content: 'Discover our latest added destinations for 2024',
      date: '2024-02-01'
    },
    // Add more news
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        height: '400px',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), url(https://images.unsplash.com/photo-1556388158-158ea5ccacbd)`,
        backgroundSize: 'cover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        p: 2
      }}>
        <Container>
          <Typography variant="h3" gutterBottom>
            Travel With Us
          </Typography>
          <Button 
            variant="contained" 
            component={Link} 
            to="/flights"
            size="large"
            sx={{ mt: 3 }}
          >
            Browse Flights
          </Button>
        </Container>
      </Box>

      {/* Featured Flights */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Popular Flights
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {featuredFlights.map((flight) => (
            <Grid item xs={12} md={4} key={flight.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={flight.image}
                  alt={flight.title}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5">
                    {flight.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {flight.departure} to {flight.arrival}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    ${flight.price}
                  </Typography>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Services */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 4 }}>
        <Container>
          <Typography variant="h4" align="center" gutterBottom>
            Our Services
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {services.map((service) => (
              <Grid item xs={12} md={4} key={service.id}>
                <Card sx={{ p: 3, height: '100%' }}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    {service.icon}
                  </Box>
                  <Typography variant="h5" align="center" gutterBottom>
                    {service.title}
                  </Typography>
                  <Typography align="center">
                    {service.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* News */}
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Latest News
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {latestNews.map((news) => (
            <Grid item xs={12} md={4} key={news.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {news.title}
                  </Typography>
                  <Typography variant="body2">
                    {news.content}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                    Published: {news.date}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;