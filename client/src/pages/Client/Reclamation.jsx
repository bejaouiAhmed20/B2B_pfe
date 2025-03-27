import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Chip,
  Grid
} from '@mui/material';
import { Send, Feedback, CheckCircle, HourglassEmpty, Cancel } from '@mui/icons-material';
import axios from 'axios';

const Reclamation = () => {
  const [formData, setFormData] = useState({
    sujet: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reclamations, setReclamations] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUserReclamations();
  }, []);

  const fetchUserReclamations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userData) {
        setError('Vous devez être connecté pour accéder à cette page');
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/reclamations/user/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReclamations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reclamations:', error);
      // If 404, it means no reclamations found, which is not an error
      if (error.response && error.response.status === 404) {
        setReclamations([]);
      } else {
        setError('Impossible de charger vos réclamations');
      }
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sujet || !formData.description) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userData) {
        setError('Vous devez être connecté pour soumettre une réclamation');
        setSubmitting(false);
        return;
      }

      await axios.post('http://localhost:5000/api/reclamations', {
        ...formData,
        user_id: userData.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setFormData({ sujet: '', description: '' });
      fetchUserReclamations(); // Refresh the list
      setSubmitting(false);
    } catch (error) {
      console.error('Error submitting reclamation:', error);
      setError('Impossible de soumettre votre réclamation');
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Traitée':
        return 'success';
      case 'En cours':
        return 'info';
      case 'En attente':
        return 'warning';
      case 'Rejetée':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Traitée':
        return <CheckCircle />;
      case 'En cours':
        return <HourglassEmpty />;
      case 'En attente':
        return <HourglassEmpty />;
      case 'Rejetée':
        return <Cancel />;
      default:
        return <Feedback />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Réclamations
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Soumettre une nouvelle réclamation
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Sujet"
            name="sujet"
            value={formData.sujet}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<Send />}
            disabled={submitting}
            sx={{ 
              mt: 2,
              backgroundColor: '#CC0A2B',
              '&:hover': {
                backgroundColor: '#A00823',
              }
            }}
          >
            {submitting ? 'Envoi en cours...' : 'Envoyer la réclamation'}
          </Button>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success">
          Votre réclamation a été soumise avec succès
        </Alert>
      </Snackbar>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Mes réclamations
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : reclamations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Vous n'avez pas encore soumis de réclamation
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reclamations.map((reclamation) => (
            <Grid item xs={12} key={reclamation.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {reclamation.sujet}
                    </Typography>
                    <Chip 
                      icon={getStatusIcon(reclamation.statut)}
                      label={reclamation.statut} 
                      color={getStatusColor(reclamation.statut)}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Soumise le {formatDate(reclamation.date_creation)}
                  </Typography>
                  
                  <Typography variant="body1" paragraph>
                    {reclamation.description}
                  </Typography>
                  
                  {reclamation.reponse && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle1" gutterBottom>
                        Réponse:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Répondu le {formatDate(reclamation.date_reponse)}
                      </Typography>
                      <Typography variant="body1">
                        {reclamation.reponse}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Reclamation;