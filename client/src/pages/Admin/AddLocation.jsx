import React, { useState } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  Box
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddLocation = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nom: '',
    ville: '',
    pays: '',
    description: '',
    est_actif: true
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create a preview URL for the image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData object to handle file upload
      const formDataWithImage = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        formDataWithImage.append(key, formData[key]);
      });
      
      // Add image if selected
      if (image) {
        formDataWithImage.append('image', image);
      }
      
      await axios.post('http://localhost:5000/api/locations', formDataWithImage, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSnackbar({ open: true, message: 'Emplacement ajouté avec succès', severity: 'success' });
      setTimeout(() => navigate('/admin/locations'), 2000);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Une erreur est survenue', 
        severity: 'error' 
      });
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Ajouter un Emplacement
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          name="nom"
          label="Nom"
          value={formData.nom}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="ville"
          label="Ville"
          value={formData.ville}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="pays"
          label="Pays"
          value={formData.pays}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="description"
          label="Description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
        />
        
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="location-image-upload"
          type="file"
          onChange={handleImageChange}
        />
        <label htmlFor="location-image-upload">
          <Button
            variant="outlined"
            component="span"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            Choisir une image
          </Button>
        </label>
        
        {previewUrl && (
          <Box mt={2} textAlign="center">
            <img 
              src={previewUrl} 
              alt="Aperçu" 
              style={{ maxWidth: '100%', maxHeight: '200px' }} 
            />
          </Box>
        )}
        
        <FormControlLabel
          control={
            <Switch
              checked={formData.est_actif}
              onChange={handleChange}
              name="est_actif"
              color="primary"
            />
          }
          label="Actif"
        />
        
        <div style={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/admin/locations')}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            style={{ backgroundColor: '#CC0A2B' }}
          >
            Ajouter
          </Button>
        </div>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddLocation;