import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Breadcrumbs
} from '@mui/material';
import { ArrowBack, LocationOn } from '@mui/icons-material';
import api from '../../services/api';
import NotFoundImage from '../../assets/notfound.jpg';

const LocationDetail = () => {
  const { id } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch location data
  useEffect(() => {
    const fetchLocationData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/locations/${id}`);
        setLocation(response.data);
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('Impossible de charger les détails de cette destination.');
      } finally {
        setLoading(false);
      }
    };

    fetchLocationData();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress sx={{ color: '#CC0A2B' }} />
        </Box>
      </Container>
    );
  }

  if (error || !location) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error || 'Destination non trouvée'}
          </Typography>
          <Button
            component={Link}
            to="/client"
            variant="contained"
            startIcon={<ArrowBack />}
            sx={{ mt: 2, bgcolor: '#CC0A2B' }}
          >
            Retour à l'accueil
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs navigation */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link to="/client" style={{ textDecoration: 'none', color: 'inherit' }}>
          Accueil
        </Link>
        <Typography color="text.primary">{location.ville}</Typography>
      </Breadcrumbs>

      {/* Main content */}
      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', mb: 4 }}>
        {/* Image */}
        <Box sx={{ height: { xs: '250px', md: '400px' }, position: 'relative' }}>
          <Box
            component="img"
            src={location.url_image ? `http://localhost:5000${location.url_image}` : NotFoundImage}
            alt={location.nom}
            onError={(e) => { e.target.src = NotFoundImage }}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Location info overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
              color: 'white',
              p: { xs: 2, md: 3 }
            }}
          >
            <Typography variant="h4" fontWeight="bold">
              {location.ville}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <LocationOn sx={{ mr: 0.5 }} />
              <Typography variant="h6">{location.pays}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Description */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            À propos de {location.ville}
          </Typography>
          <Typography variant="body1" paragraph>
            {location.description ||
              `Découvrez ${location.ville}, une destination fascinante située en ${location.pays}.
              Cette ville offre un mélange unique de culture, d'histoire et de paysages à couper le souffle.
              Que vous soyez intéressé par l'architecture, la gastronomie locale ou simplement à la recherche
              d'une escapade relaxante, ${location.ville} a quelque chose à offrir pour tous les voyageurs.`
            }
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              component={Link}
              to="/client/flights"
              sx={{
                bgcolor: '#CC0A2B',
                py: 1.5,
                px: 4,
                borderRadius: '8px',
                '&:hover': {
                  bgcolor: '#a00923'
                }
              }}
            >
              Rechercher des vols pour {location.ville}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LocationDetail;
