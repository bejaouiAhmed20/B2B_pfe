import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Breadcrumbs
} from '@mui/material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNewsDetail();
  }, [id]);

  const fetchNewsDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/news/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setNewsItem(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news detail:', error);
      setError('Impossible de charger les détails de l\'actualité');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress color="primary" />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchNewsDetail}
          sx={{ backgroundColor: '#CC0A2B', mr: 2 }}
        >
          Réessayer
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/client/news')}
        >
          Retour aux actualités
        </Button>
      </Container>
    );
  }

  if (!newsItem) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Actualité non trouvée
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/client/news')}
          sx={{ mt: 2 }}
        >
          Retour aux actualités
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link to="/client" style={{ textDecoration: 'none', color: 'inherit' }}>
          Accueil
        </Link>
        <Link to="/client/news" style={{ textDecoration: 'none', color: 'inherit' }}>
          Actualités
        </Link>
        <Typography color="text.primary">{newsItem.titre}</Typography>
      </Breadcrumbs>
      
      <Button 
        variant="outlined" 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/client/news')}
        sx={{ mb: 3 }}
      >
        Retour aux actualités
      </Button>
      
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {newsItem.titre}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Publié le {formatDate(newsItem.date_creation)}
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        {newsItem.image_url && (
          <Box 
            component="img"
            src={`http://localhost:5000/uploads/${newsItem.image_url}`}
            alt={newsItem.titre}
            sx={{ 
              width: '100%', 
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: 1,
              mb: 3 
            }}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x400?text=Tunisair+News';
            }}
          />
        )}
        
        <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
          {newsItem.contenu.split('\n').map((paragraph, index) => (
            <React.Fragment key={index}>
              {paragraph}
              <br /><br />
            </React.Fragment>
          ))}
        </Typography>
      </Paper>
    </Container>
  );
};

export default NewsDetail;