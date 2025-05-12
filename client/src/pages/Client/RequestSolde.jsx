import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  AttachMoney,
  Description,
  CloudUpload,
  Add,
  History,
  CheckCircle,
  Cancel,
  HourglassEmpty
} from '@mui/icons-material';
import axios from 'axios';

const RequestSolde = () => {
  const [loading, setLoading] = useState(false);
  const [requestHistory, setRequestHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [compte, setCompte] = useState(null);
  const [formData, setFormData] = useState({
    montant: '',
    description: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserAccount();
    fetchRequestHistory();
  }, []);

  const fetchUserAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userData) {
        setError('Vous devez être connecté pour accéder à cette page');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/comptes/user/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCompte(response.data);
    } catch (error) {
      console.error('Error fetching user account:', error);
      if (error.response?.status === 404) {
        setError('Aucun compte trouvé pour cet utilisateur');
      } else {
        setError('Impossible de charger les données du compte');
      }
    }
  };

  const fetchRequestHistory = async () => {
    try {
      setHistoryLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!token || !userData) {
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/request-solde/client/${userData.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRequestHistory(response.data);
      setHistoryLoading(false);
    } catch (error) {
      console.error('Error fetching request history:', error);
      setHistoryLoading(false);
      // If 404, it means no requests found, which is not an error
      if (error.response?.status !== 404) {
        setSnackbar({
          open: true,
          message: 'Impossible de charger l\'historique des demandes',
          severity: 'error'
        });
      }
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      setSnackbar({
        open: true,
        message: 'Veuillez entrer un montant valide',
        severity: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // First upload the image if there is one
      let imageUrl = '';
      if (imageFile) {
        try {
          const formDataImage = new FormData();
          formDataImage.append('file', imageFile);
          
          // Use the new dedicated upload endpoint
          const uploadResponse = await axios.post('http://localhost:5000/api/upload', formDataImage, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          });
          
          imageUrl = uploadResponse.data.filePath;
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setSnackbar({
            open: true,
            message: 'Erreur lors du téléchargement de l\'image',
            severity: 'error'
          });
          setLoading(false);
          return;
        }
      }
      
      // Then create the request
      const requestData = {
        client_id: userData.id,
        montant: parseFloat(formData.montant),
        description: formData.description,
        imageUrl: imageUrl
      };
      
      await axios.post('http://localhost:5000/api/request-solde', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSnackbar({
        open: true,
        message: 'Demande de solde envoyée avec succès',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        montant: '',
        description: '',
        imageUrl: ''
      });
      setImageFile(null);
      setImagePreview('');
      
      // Refresh history
      fetchRequestHistory();
      
      setLoading(false);
    } catch (error) {
      console.error('Error submitting request:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de l\'envoi de la demande',
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<HourglassEmpty />} label="En attente" color="warning" />;
      case 'approved':
        return <Chip icon={<CheckCircle />} label="Approuvée" color="success" />;
      case 'rejected':
        return <Chip icon={<Cancel />} label="Rejetée" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Demande de Solde
      </Typography>
      
      {compte && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" gutterBottom>
            Solde Actuel
          </Typography>
          <Typography variant="h3" sx={{ color: '#CC0A2B', fontWeight: 'bold' }}>
            {parseFloat(compte.solde).toFixed(2)} TND
          </Typography>
        </Paper>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Nouvelle Demande
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Montant TND"
                name="montant"
                type="number"
                value={formData.montant}
                onChange={handleChange}
            
                margin="normal"
                required
              />
              
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description />
                    </InputAdornment>
                  ),
                }}
                margin="normal"
                required
              />
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUpload />}
                sx={{ mt: 2, mb: 2 }}
                fullWidth
              >
                Télécharger un justificatif
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              
              {imagePreview && (
                <Box sx={{ mt: 2, mb: 2 }}>
                  <img 
                    src={imagePreview} 
                    alt="Aperçu" 
                    style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', margin: '0 auto' }} 
                  />
                </Box>
              )}
              
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<Add />}
                disabled={loading}
                sx={{ 
                  mt: 3,
                  backgroundColor: '#CC0A2B',
                  '&:hover': {
                    backgroundColor: '#A00823',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Soumettre la demande'}
              </Button>
            </form>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <History sx={{ mr: 1 }} />
              Historique des Demandes
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {historyLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : requestHistory.length === 0 ? (
              <Alert severity="info">Aucune demande trouvée</Alert>
            ) : (
              <Box sx={{ maxHeight: '500px', overflow: 'auto' }}>
                {requestHistory.map((request) => (
                  <Card key={request.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {parseFloat(request.montant).toFixed(2)} €
                        </Typography>
                        {getStatusChip(request.status)}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {formatDate(request.date)}
                      </Typography>
                      
                      {request.description && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {request.description}
                        </Typography>
                      )}
                      
                      {request.imageUrl && (
                        <Box sx={{ mt: 2 }}>
                          <Button 
                            size="small" 
                            variant="outlined"
                            onClick={() => window.open(`http://localhost:5000${request.imageUrl}`, '_blank')}
                          >
                            Voir le justificatif
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RequestSolde;