import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

function AddPopup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    active: true,
    image_url: '',
    type: 'info',
    button_text: '',
    button_link: '',
    display_order: 0,
    start_date: null,
    end_date: null
  });

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch popup data if editing
  useEffect(() => {
    if (id) {
      const fetchPopup = async () => {
        try {
          setLoading(true);
          const response = await fetch(`http://localhost:5000/api/popups/${id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch popup');
          }

          const data = await response.json();
          setFormData({
            title: data.title,
            content: data.content,
            active: data.active,
            image_url: data.image_url || '',
            type: data.type,
            button_text: data.button_text || '',
            button_link: data.button_link || '',
            display_order: data.display_order,
            duration_days: data.duration_days,
            start_date: data.start_date || null,
            end_date: data.end_date || null
          });
          setError(null);
        } catch (err) {
          console.error('Error fetching popup:', err);
          setError('Une erreur est survenue lors de la récupération du popup');
        } finally {
          setLoading(false);
        }
      };

      fetchPopup();
    }
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'active' ? checked : value
    });
  };

  // Handle date changes
  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date ? date.format('YYYY-MM-DD') : null
    });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload image to server
  const uploadImage = async () => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch('http://localhost:5000/api/upload/popup-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      setSnackbar({
        open: true,
        message: "Erreur lors de l'upload de l'image",
        severity: 'error'
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Save popup
  const handleSavePopup = async () => {
    try {
      setSaving(true);

      // Upload image first if there's a new image
      let imagePath = formData.image_url;
      if (imageFile) {
        imagePath = await uploadImage();
        if (!imagePath) {
          setSaving(false);
          return; // Stop if image upload failed
        }
      }

      const url = id
        ? `http://localhost:5000/api/popups/${id}`
        : 'http://localhost:5000/api/popups';

      const method = id ? 'PUT' : 'POST';

      // Create a new object with updated image_url
      const updatedFormData = {
        ...formData,
        image_url: imagePath
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${id ? 'update' : 'create'} popup`);
      }

      setSnackbar({
        open: true,
        message: `Popup ${id ? 'mis à jour' : 'créé'} avec succès`,
        severity: 'success'
      });

      // Navigate back to popups list after a short delay
      setTimeout(() => {
        navigate('/admin/popups');
      }, 1500);
    } catch (err) {
      console.error('Error saving popup:', err);
      setSnackbar({
        open: true,
        message: `Une erreur est survenue lors de l'${id ? 'mise à jour' : 'ajout'} du popup`,
        severity: 'error'
      });
      setSaving(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/popups')}
          sx={{ mt: 2 }}
        >
          Retour à la liste
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/popups')}
            sx={{ mr: 2 }}
          >
            Retour
          </Button>
          <Typography variant="h5" component="h1">
            {id ? 'Modifier le Popup' : 'Ajouter un Popup'}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={8}>
            <TextField
              name="title"
              label="Titre"
              fullWidth
              value={formData.title}
              onChange={handleInputChange}
              required
              error={!formData.title}
              helperText={!formData.title ? 'Le titre est requis' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                label="Type"
              >
                <MenuItem value="info">Information</MenuItem>
                <MenuItem value="warning">Avertissement</MenuItem>
                <MenuItem value="success">Succès</MenuItem>
                <MenuItem value="error">Erreur</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="content"
              label="Contenu"
              multiline
              rows={6}
              fullWidth
              value={formData.content}
              onChange={handleInputChange}
              required
              error={!formData.content}
              helperText={!formData.content ? 'Le contenu est requis' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Image du popup (optionnel)
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="popup-image-upload"
                type="file"
                onChange={handleImageChange}
              />
              <label htmlFor="popup-image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  sx={{ mr: 2 }}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Chargement...' : 'Choisir une image'}
                </Button>
              </label>
              {imageFile && (
                <Typography variant="body2" component="span">
                  {imageFile.name}
                </Typography>
              )}
              {!imageFile && formData.image_url && (
                <Typography variant="body2" component="span">
                  Image existante
                </Typography>
              )}
            </Box>

            {/* Image preview */}
            {(imagePreview || formData.image_url) && (
              <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                <img
                  src={imagePreview || `http://localhost:5000${formData.image_url}`}
                  alt="Aperçu"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="button_text"
              label="Texte du bouton"
              fullWidth
              value={formData.button_text}
              onChange={handleInputChange}
              helperText="Optionnel: texte à afficher sur le bouton"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="button_link"
              label="Lien du bouton"
              fullWidth
              value={formData.button_link}
              onChange={handleInputChange}
              helperText="Optionnel: URL vers laquelle le bouton redirige"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="display_order"
              label="Ordre d'affichage"
              type="number"
              fullWidth
              value={formData.display_order}
              onChange={handleInputChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>

          <Grid item xs={12} sm={8}>
            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  color="primary"
                />
              }
              label="Actif"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
              <DatePicker
                label="Date de début"
                value={formData.start_date ? dayjs(formData.start_date) : null}
                onChange={(date) => handleDateChange('start_date', date)}
                slotProps={{ textField: { fullWidth: true } }}
                clearable
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
              <DatePicker
                label="Date de fin"
                value={formData.end_date ? dayjs(formData.end_date) : null}
                onChange={(date) => handleDateChange('end_date', date)}
                slotProps={{ textField: { fullWidth: true } }}
                clearable
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSavePopup}
                disabled={saving || !formData.title || !formData.content}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default AddPopup;
