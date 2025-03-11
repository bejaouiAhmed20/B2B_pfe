import React, { useState } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddNews = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    titre: '',
    contenu: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('contenu', formData.contenu);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await axios.post(
        'http://localhost:5000/api/news', 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setSnackbar({ open: true, message: 'Actualité ajoutée avec succès', severity: 'success' });
      setTimeout(() => navigate('/admin/news'), 2000);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Une erreur est survenue', 
        severity: 'error' 
      });
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Ajouter une Actualité
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          name="titre"
          label="Titre"
          value={formData.titre}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          name="contenu"
          label="Contenu"
          value={formData.contenu}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          multiline
          rows={6}
        />
        
        <div style={{ marginTop: 16 }}>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="image-upload">
            <Button variant="outlined" component="span">
              Ajouter une image
            </Button>
          </label>
        </div>
        
        {previewImage && (
          <div style={{ marginTop: 16 }}>
            <Typography variant="subtitle1">Aperçu de l'image:</Typography>
            <img 
              src={previewImage} 
              alt="Aperçu" 
              style={{ maxWidth: '100%', maxHeight: 300, marginTop: 8 }}
            />
          </div>
        )}
        
        <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/admin/news')}>
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

export default AddNews;