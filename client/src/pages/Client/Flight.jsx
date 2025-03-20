import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Divider,
  Chip,
  Paper,
  Alert
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  AttachMoney,
  Search,
  AirlineSeatReclineNormal
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Flight = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/flights');
      setFlights(response.data);
      setFilteredFlights(response.data);
      
      // Extract unique companies for filter
      const uniqueCompanies = [...new Set(response.data.map(flight => flight.compagnie_aerienne))];
      setCompanies(uniqueCompanies);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching flights:', error);
      setError('Impossible de charger les vols. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  useEffect(() => {
    filterFlights();
  }, [searchTerm, priceRange, companyFilter, flights]);

  const filterFlights = () => {
    let result = [...flights];
    
    // Filter by search term (title, departure city, arrival city)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(flight => 
        flight.titre.toLowerCase().includes(term) ||
        flight.airport_depart?.ville?.toLowerCase().includes(term) ||
        flight.airport_arrivee?.ville?.toLowerCase().includes(term) ||
        flight.compagnie_aerienne.toLowerCase().includes(term)
      );
    }
    
    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter(flight => flight.prix >= min && flight.prix <= max);
    }
    
    // Filter by company
    if (companyFilter) {
      result = result.filter(flight => flight.compagnie_aerienne === companyFilter);
    }
    
    setFilteredFlights(result);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePriceRangeChange = (event) => {
    setPriceRange(event.target.value);
  };

  const handleCompanyChange = (event) => {
    setCompanyFilter(event.target.value);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleViewDetails = (flightId) => {
    navigate(`/client/flights/${flightId}`);
  };

  const handleBookFlight = (flightId) => {
    navigate(`/client/reservation/new`, { state: { flightId } });
  };

  // Add function to check if flight is available based on departure date
  const isFlightAvailable = (departureDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const departure = new Date(departureDate);
    departure.setHours(0, 0, 0, 0);
    
    // Flight is available if departure date is in the future
    return departure > today;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Vols Disponibles
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Rechercher"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Destination, compagnie..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Gamme de prix"
              value={priceRange}
              onChange={handlePriceRangeChange}
              variant="outlined"
            >
              <MenuItem value="">Tous les prix</MenuItem>
              <MenuItem value="0-500">0€ - 500€</MenuItem>
              <MenuItem value="500-1000">500€ - 1000€</MenuItem>
              <MenuItem value="1000-2000">1000€ - 2000€</MenuItem>
              <MenuItem value="2000-5000">2000€ - 5000€</MenuItem>
              <MenuItem value="5000-100000">Plus de 5000€</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Compagnie aérienne"
              value={companyFilter}
              onChange={handleCompanyChange}
              variant="outlined"
            >
              <MenuItem value="">Toutes les compagnies</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company} value={company}>
                  {company}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredFlights.length === 0 ? (
        <Alert severity="info">
          Aucun vol ne correspond à vos critères de recherche.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredFlights.map((flight) => (
            <Grid item xs={12} sm={6} md={4} key={flight.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom noWrap>
                    {flight.titre}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FlightTakeoff sx={{ mr: 1, color: '#CC0A2B', fontSize: '1rem' }} />
                    <Typography variant="body2" noWrap>
                      <strong>De:</strong> {flight.airport_depart?.ville || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FlightLand sx={{ mr: 1, color: '#1976d2', fontSize: '1rem' }} />
                    <Typography variant="body2" noWrap>
                      <strong>À:</strong> {flight.airport_arrivee?.ville || 'N/A'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ mr: 1, color: '#4caf50', fontSize: '1rem' }} />
                    <Typography variant="body2">
                      <strong>Date:</strong> {formatDate(flight.date_depart)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Typography variant="h5" color="primary">
                      {flight.prix} €
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Chip 
                      label={isFlightAvailable(flight.date_depart) ? "Disponible" : "Complet"} 
                      color={isFlightAvailable(flight.date_depart) ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'center', p: 2 }}>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate(`/client/flights/${flight.id}`)}
                    fullWidth
                    sx={{ 
                      backgroundColor: '#CC0A2B',
                      '&:hover': {
                        backgroundColor: '#A00823',
                      }
                    }}
                  >
                    Voir plus
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Flight;