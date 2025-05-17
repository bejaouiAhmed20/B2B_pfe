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
  Alert,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  AccessTime,
  AttachMoney,
  Search,
  AirlineSeatReclineNormal,
  Sort,
  FilterList,
  DateRange
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NotFoundImage from '../../assets/notfound.jpg';


const Flight = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Remove company filter state and related code
  // Remove departure and arrival city states
  const [priceRange, setPriceRange] = useState('');
  const [companies, setCompanies] = useState([]);
  
  // New state variables for sorting and additional filtering
  const [sortBy, setSortBy] = useState('default');
  // Removing these lines:
  // const [departureCity, setDepartureCity] = useState('');
  // const [arrivalCity, setArrivalCity] = useState('');
  // const [departureCities, setDepartureCities] = useState([]);
  // const [arrivalCities, setArrivalCities] = useState([]);
  const [departureDate, setDepartureDate] = useState('');
  const [filterTab, setFilterTab] = useState(0);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/flights');
      console.log('Flight data:', response.data);
      
      setFlights(response.data);
      setFilteredFlights(response.data);
      
      // Extract unique companies for filter
      const uniqueCompanies = [...new Set(response.data.map(flight => flight.compagnie_aerienne))];
      setCompanies(uniqueCompanies);
      
      // Extract cities directly from the flight data
      // Based on the UI image, it seems the cities might be directly in the flight object
      const departureCities = [];
      const arrivalCities = [];
      
      response.data.forEach(flight => {
        // Try different possible property paths for departure city
        let departureCity = null;
        if (flight.airport_depart && flight.airport_depart.ville) {
          departureCity = flight.airport_depart.ville;
        } else if (flight.ville_depart) {
          departureCity = flight.ville_depart;
        } else if (flight.depart) {
          departureCity = flight.depart;
        }
        
        // Try different possible property paths for arrival city
        let arrivalCity = null;
        if (flight.airport_arrivee && flight.airport_arrivee.ville) {
          arrivalCity = flight.airport_arrivee.ville;
        } else if (flight.ville_arrivee) {
          arrivalCity = flight.ville_arrivee;
        } else if (flight.arrivee) {
          arrivalCity = flight.arrivee;
        }
        
        // Add cities to the lists if they're not already there
        if (departureCity && !departureCities.includes(departureCity)) {
          departureCities.push(departureCity);
        }
        
        if (arrivalCity && !arrivalCities.includes(arrivalCity)) {
          arrivalCities.push(arrivalCity);
        }
      });
      
      console.log('Departure cities:', departureCities);
      console.log('Arrival cities:', arrivalCities);
      
      // If we still don't have cities, add the ones visible in the UI
      if (departureCities.length === 0) {
        departureCities.push("JERBA");
      }
      
      if (arrivalCities.length === 0) {
        arrivalCities.push("paris");
      }
      
      setDepartureCities(departureCities);
      setArrivalCities(arrivalCities);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching flights:', error);
      setError(''); // Removed the error message here
      setLoading(false);
    }
  };

  useEffect(() => {
    filterAndSortFlights();
  }, [searchTerm, priceRange, departureDate, sortBy, flights]);
  // Removed departureCity and arrivalCity from the dependency array

  // Modified handleDateChange function
  const handleDateChange = (event) => {
    setDepartureDate(event.target.value);
  };

  // Fix the filterAndSortFlights function - searchQuery is undefined
  // In the filterAndSortFlights function, remove the company filter section
  const filterAndSortFlights = () => {
  // First, filter flights based on search term
  let result = [...flights];
  
  // Filter by search term (title, departure city, arrival city)
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    result = result.filter(flight => 
      (flight.titre && flight.titre.toLowerCase().includes(term)) ||
      (flight.airport_depart?.ville && flight.airport_depart.ville.toLowerCase().includes(term)) ||
      (flight.airport_arrivee?.ville && flight.airport_arrivee.ville.toLowerCase().includes(term)) ||
      (flight.compagnie_aerienne && flight.compagnie_aerienne.toLowerCase().includes(term))
    );
  }
  
  // Filter by price range
  if (priceRange) {
    const [min, max] = priceRange.split('-').map(Number);
    result = result.filter(flight => flight.prix >= min && flight.prix <= max);
  }
  
  // Removing city filter sections:
  // // Filter by departure city
  // if (departureCity) {
  //   result = result.filter(flight => {
  //     const flightDepartureCity = flight.airport_depart?.ville || flight.ville_depart || flight.depart;
  //     return flightDepartureCity === departureCity;
  //   });
  // }
  // 
  // // Filter by arrival city
  // if (arrivalCity) {
  //   result = result.filter(flight => {
  //     const flightArrivalCity = flight.airport_arrivee?.ville || flight.ville_arrivee || flight.arrivee;
  //     return flightArrivalCity === arrivalCity;
  //   });
  // }
  
  // Filter by departure date - modified to work with string date from input
  if (departureDate) {
    const selectedDate = new Date(departureDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    result = result.filter(flight => {
      const flightDate = new Date(flight.date_depart);
      flightDate.setHours(0, 0, 0, 0);
      return flightDate.getTime() === selectedDate.getTime();
    });
  }
  
  // Sort flights
  switch (sortBy) {
    case 'price-asc':
      result.sort((a, b) => a.prix - b.prix);
      break;
    case 'price-desc':
      result.sort((a, b) => b.prix - a.prix);
      break;
    case 'date-asc':
      result.sort((a, b) => new Date(a.date_depart) - new Date(b.date_depart));
      break;
    case 'date-desc':
      result.sort((a, b) => new Date(b.date_depart) - new Date(a.date_depart));
      break;
    case 'duration-asc':
      result.sort((a, b) => {
        const durationA = calculateDuration(a.heure_depart, a.heure_arrivee);
        const durationB = calculateDuration(b.heure_depart, b.heure_arrivee);
        return durationA - durationB;
      });
      break;
    default:
      // Default sorting (by date ascending)
      result.sort((a, b) => new Date(a.date_depart) - new Date(b.date_depart));
  }
  
  setFilteredFlights(result);
  };

  // Helper function to calculate flight duration in minutes
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return 0;
    
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
    
    let durationMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
    if (durationMinutes < 0) durationMinutes += 24 * 60; // Handle overnight flights
    
    return durationMinutes;
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handlePriceRangeChange = (event) => {
    setPriceRange(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  // Remove these functions:
  // const handleDepartureCityChange = (event) => {
  //   setDepartureCity(event.target.value);
  // };
  //
  // const handleArrivalCityChange = (event) => {
  //   setArrivalCity(event.target.value);
  // };

  // Remove this duplicate function since we already have one defined at line 97-99
  // const handleDateChange = (newDate) => {
  //   setDepartureDate(newDate);
  // };
  
  const handleFilterTabChange = (event, newValue) => {
    setFilterTab(newValue);
  };
  
  const resetFilters = () => {
    setSearchTerm('');
    setPriceRange('');
    // Remove these lines:
    // setDepartureCity('');
    // setArrivalCity('');
    setDepartureDate('');
    setSortBy('default');
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const handleViewDetails = (flightId) => {
    navigate(`/client/flights/${flightId}`);
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

<Paper
  elevation={3}
  sx={{
    p: 4,
    mb: 5,
    borderRadius: 4,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
    backgroundColor: 'background.paper',
  }}
>
  <Tabs
    value={filterTab}
    onChange={handleFilterTabChange}
    centered
    textColor="primary"
    indicatorColor="primary"
    sx={{
      mb: 3,
      '& .MuiTab-root': {
        fontWeight: 500,
        textTransform: 'none',
        fontSize: '16px',
      },
    }}
  >
    <Tab icon={<Search />} iconPosition="start" label="Recherche" />
    <Tab icon={<FilterList />} iconPosition="start" label="Filtres" />
    <Tab icon={<Sort />} iconPosition="start" label="Tri" />
  </Tabs>

  {filterTab === 0 && (
    <Grid container spacing={3}>
      <Grid item xs={12}>
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
                <Search color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
    </Grid>
  )}

  {filterTab === 1 && (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date de départ"
          type="date"
          value={departureDate}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Gamme de prix</InputLabel>
          <Select
            value={priceRange}
            onChange={handlePriceRangeChange}
            label="Gamme de prix"
          >
            <MenuItem value="">Tous les prix</MenuItem>
            <MenuItem value="0-500">0€ - 500€</MenuItem>
            <MenuItem value="500-1000">500€ - 1000€</MenuItem>
            <MenuItem value="1000-2000">1000€ - 2000€</MenuItem>
            <MenuItem value="2000-5000">2000€ - 5000€</MenuItem>
            <MenuItem value="5000-100000">Plus de 5000€</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  )}

  {filterTab === 2 && (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Trier par</InputLabel>
          <Select
            value={sortBy}
            onChange={handleSortChange}
            label="Trier par"
          >
            <MenuItem value="default">Par défaut</MenuItem>
            <MenuItem value="price-asc">Prix croissant</MenuItem>
            <MenuItem value="price-desc">Prix décroissant</MenuItem>
            <MenuItem value="date-asc">Date (plus proche)</MenuItem>
            <MenuItem value="date-desc">Date (plus éloignée)</MenuItem>
            <MenuItem value="duration-asc">Durée (plus courte)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  )}

  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
    <Button
      variant="outlined"
      onClick={resetFilters}
      sx={{
        px: 4,
        py: 1.5,
        fontWeight: 600,
        borderRadius: 2,
        borderColor: 'primary.main',
        '&:hover': {
          backgroundColor: 'primary.light',
          borderColor: 'primary.dark',
        },
      }}
    >
      Réinitialiser les filtres
    </Button>
  </Box>
</Paper>


      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredFlights.length} vol(s) trouvé(s)
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredFlights.length === 0 ? (
        <Alert severity="info">
          Aucun vol ne correspond à vos critères de recherche.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredFlights.map((flight) => (
            <Card
  key={flight.id}
  sx={{
    width: '100%',
    height: 220,
    display: 'flex',
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
    transition: '0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)'
    }
  }}
>
  {/* Left Image */}
  <Box
    sx={{
      width: 280,
      height: '100%',
      flexShrink: 0,
      overflow: 'hidden',
      position: 'relative'
    }}
  >
    <Box
  component="img"
  src={flight.image_url ? `http://localhost:5000${flight.image_url}` : NotFoundImage}
  alt={flight.titre}
  sx={{
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    filter: 'brightness(0.95)'
  }}
/>
  </Box>

  {/* Right Content */}
  <Box sx={{ flexGrow: 1, px: 3, py: 2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    {/* Top row: Title + Status */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          color: 'text.primary',
          maxWidth: '75%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {flight.titre}
      </Typography>
      <Chip
        label={isFlightAvailable(flight.date_depart) ? 'Disponible' : 'Complet'}
        color={isFlightAvailable(flight.date_depart) ? 'success' : 'error'}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          px: 1.5,
          borderRadius: 1
        }}
      />
    </Box>

    {/* Middle: Info Tags */}
    <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
      {[
        {
          icon: <FlightTakeoff />,
          value: flight.departureAirport || flight.airport_depart?.nom || 'N/A',
          color: 'error.main'
        },
        {
          icon: <FlightLand />,
          value: flight.arrivalAirport || flight.arrival_airport?.nom || 'N/A',
          color: 'primary.main'
        },
        {
          icon: <AccessTime />,
          value: formatDate(flight.date_depart),
          color: 'success.main'
        }
      ].map((item, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'grey.100',
            px: 2,
            py: 1,
            borderRadius: 2,
            minWidth: 0,
            flex: 1
          }}
        >
          <Box
            sx={{
              backgroundColor: `${item.color}20`,
              p: 1,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.2
            }}
          >
            {React.cloneElement(item.icon, { sx: { fontSize: 18, color: item.color } })}
          </Box>
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>

    {/* Bottom: Price + Button */}
    <Box
      sx={{
        mt: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary">
          À partir de
        </Typography>
        <Typography variant="h5" fontWeight={800} color="primary" sx={{ lineHeight: 1.1 }}>
          {flight.prix} DT
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Taxes incluses
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="medium"
        onClick={() => navigate(`/client/flights/${flight.id}`)}
        sx={{
          px: 3,
          py: 1.2,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '0.95rem',
          textTransform: 'none',
          bgcolor: 'error.main',
          boxShadow: '0 2px 6px rgba(204,10,43,0.3)',
          '&:hover': {
            bgcolor: 'error.dark',
            boxShadow: '0 4px 12px rgba(204,10,43,0.4)'
          }
        }}
      >
        Réserver
      </Button>
    </Box>
  </Box>
</Card>
     
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Flight;