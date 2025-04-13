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
  CircularProgress,
  Alert,
  Divider,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const News = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/news', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      setNews(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Impossible de charger les actualités');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
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
          onClick={fetchNews}
          sx={{ backgroundColor: '#CC0A2B' }}
        >
          Réessayer
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
        Actualités
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Restez informé des dernières nouvelles et mises à jour de Tunisair
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {news.length === 0 ? (
        <Alert severity="info">Aucune actualité disponible pour le moment.</Alert>
      ) : (
        <Grid container spacing={4}>
          {news.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                  }
                }}
              >
                {item.image_url && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={`http://localhost:5000/uploads/${item.image_url}`}
                    alt={item.titre}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x200?text=Tunisair+News';
                    }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={formatDate(item.date_creation)} 
                      size="small" 
                      sx={{ 
                        backgroundColor: '#f0f0f0',
                        color: '#666',
                        fontSize: '0.75rem'
                      }} 
                    />
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                    {item.titre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.contenu.length > 150 
                      ? `${item.contenu.substring(0, 150)}...` 
                      : item.contenu}
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/client/news/${item.id}`)}
                    sx={{ 
                      color: '#CC0A2B',
                      '&:hover': {
                        backgroundColor: 'rgba(204, 10, 43, 0.08)'
                      }
                    }}
                  >
                    Lire la suite
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default News;