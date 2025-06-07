import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  Avatar,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Edit,
  Save
} from '@mui/icons-material';
import api from '../../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('user'));

      if (!token || !userData) {
        setError('Vous devez être connecté pour accéder à cette page');
        setLoading(false);
        return;
      }

      // Utiliser le service API qui gère automatiquement les tokens
      const response = await api.get(`/users/${userData.id}`);

      setUser(response.data);
      setFormData({
        nom: response.data.nom || '',
        prenom: response.data.prenom || '',
        email: response.data.email || '',
        telephone: response.data.telephone || '',
        adresse: response.data.adresse || ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Impossible de charger les données utilisateur');
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
    try {
      const userData = JSON.parse(localStorage.getItem('user'));

      // Utiliser le service API qui gère automatiquement les tokens
      await api.put(`/users/${userData.id}`, formData);

      // Update local storage with new user data
      const updatedUser = { ...userData, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setUser(updatedUser);
      setEditMode(false);
      setSnackbar({
        open: true,
        message: 'Profil mis à jour avec succès',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour du profil',
        severity: 'error'
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#CC0A2B',
              fontSize: '2rem',
              mr: 2
            }}
          >
            {user?.prenom?.charAt(0) || user?.nom?.charAt(0) || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              {user?.prenom} {user?.nom}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Client depuis {new Date(user?.created_at || Date.now()).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant={editMode ? "outlined" : "contained"}
            startIcon={editMode ? <Save /> : <Edit />}
            onClick={() => {
              if (editMode) {
                handleSubmit({ preventDefault: () => {} });
              } else {
                setEditMode(true);
              }
            }}
            sx={{
              backgroundColor: editMode ? 'transparent' : '#CC0A2B',
              color: editMode ? '#CC0A2B' : 'white',
              '&:hover': {
                backgroundColor: editMode ? 'rgba(204, 10, 43, 0.1)' : '#A00823',
              }
            }}
          >
            {editMode ? 'Enregistrer' : 'Modifier'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
          <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Person sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    variant="outlined"
                  />
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nom
                    </Typography>
                    <Typography variant="body1">
                      {user?.nom || 'Non renseigné'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Email sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    type="email"
                  />
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">
                      {user?.email || 'Non renseigné'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <Phone sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Téléphone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    variant="outlined"
                  />
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Téléphone
                    </Typography>
                    <Typography variant="body1">
                      {user?.telephone || 'Non renseigné'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <LocationOn sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
                {editMode ? (
                  <TextField
                    fullWidth
                    label="Adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    variant="outlined"
                    multiline
                    rows={2}
                  />
                ) : (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Adresse
                    </Typography>
                    <Typography variant="body1">
                      {user?.adresse || 'Non renseigné'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          {editMode && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    nom: user?.nom || '',
                    prenom: user?.prenom || '',
                    email: user?.email || '',
                    telephone: user?.telephone || '',
                    adresse: user?.adresse || ''
                  });
                }}
                sx={{ mr: 2 }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#CC0A2B',
                  '&:hover': {
                    backgroundColor: '#A00823',
                  }
                }}
              >
                Enregistrer
              </Button>
            </Box>
          )}
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;