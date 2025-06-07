import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AddFlight = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const recreatingFlight = location.state?.recreatingFlight || false;
  const initialFlightData = location.state?.flightData || {
    titre: '',
    prix: '',
    date_depart: '',
    date_retour: '',
    duree: '',
    airport_depart_id: '',
    airport_arrivee_id: '',
    plane_id: '',
    aller_retour: false,
    retour_depart_date: '',
    retour_arrive_date: ''
  };

  const [airports, setAirports] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState(initialFlightData);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Store the original image URL if we're recreating a flight
  const [originalImageUrl, setOriginalImageUrl] = useState(initialFlightData.image_url || '');

  useEffect(() => {
    fetchAirports();
    fetchPlanes();

    // If recreating a flight and it has an image, set the preview
    if (recreatingFlight && initialFlightData.image_url) {
      setPreviewUrl(`http://localhost:5000${initialFlightData.image_url}`);
    }
  }, []);

  const fetchAirports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/airports');
      setAirports(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des aéroports', 'error');
    }
  };

  const fetchPlanes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/planes');
      console.log('Planes data:', response.data); // Add this to debug
      setPlanes(response.data);
    } catch (error) {
      console.error('Error fetching planes:', error);
      showSnackbar('Erreur lors du chargement des avions', 'error');
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
      setImage(file);
      // Create a preview URL for the image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create FormData object to handle file upload
      const formDataWithImage = new FormData();

      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key !== 'image_url') { // Don't include image_url in form data
          formDataWithImage.append(key, formData[key]);
        }
      });

      // Add image if selected
      if (image) {
        formDataWithImage.append('image', image);
      } else if (recreatingFlight && originalImageUrl) {
        // If recreating and no new image selected, use the original image URL
        formDataWithImage.append('image_url', originalImageUrl);
      }

      // Use FormData with axios
      await axios.post('http://localhost:5000/api/flights', formDataWithImage, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      showSnackbar(recreatingFlight ? 'Vol recréé avec succès' : 'Vol ajouté avec succès');
      setTimeout(() => {
        navigate('/admin/flights');
      }, 2000);
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {recreatingFlight ? 'Recréer un Vol' : 'Ajouter un Vol'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              name="titre"
              label="Titre"
              value={formData.titre}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="prix"
              label="Prix"
              type="number"
              value={formData.prix}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputProps={{
                endAdornment: <InputAdornment position="end">DT</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="date_depart"
              label="Date et heure de départ"
              type="datetime-local"
              value={formData.date_depart}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="date_retour"
              label="Date et heure d’arrivée"
              type="datetime-local"
              value={formData.date_retour}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="airport_depart_id"
              label="Aéroport de départ"
              select
              value={formData.airport_depart_id}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="">Sélectionner un aéroport</MenuItem>
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.nom} ({airport.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="airport_arrivee_id"
              label="Aéroport d'arrivée"
              select
              value={formData.airport_arrivee_id}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="">Sélectionner un aéroport</MenuItem>
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.nom} ({airport.code})
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Replace compagnie_aerienne with plane selection */}
          <Grid item xs={12} md={6}>
            <TextField
              name="plane_id"
              label="Avion"
              select
              value={formData.plane_id}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="">Sélectionner un avion</MenuItem>
              {planes.length > 0 ? (
                planes.map((plane) => (
                  <MenuItem key={plane.idPlane} value={plane.idPlane}>
                    {plane.planeModel || 'Avion'} ({plane.totalSeats} sièges)
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Aucun avion disponible</MenuItem>
              )}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="duree"
              label="Durée"
              value={formData.duree}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              placeholder="Ex: 2h 30m"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="aller_retour"
                  checked={formData.aller_retour}
                  onChange={(e) => setFormData({
                    ...formData,
                    aller_retour: e.target.checked
                  })}
                />
              }
              label="Vol aller-retour"
            />
          </Grid>

          {formData.aller_retour && (
            <Box sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="retour_depart_date"
                    label="Date et heure de départ du retour"
                    type="datetime-local"
                    value={formData.retour_depart_date}
                    onChange={handleChange}
                    fullWidth
                    required={formData.aller_retour}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="retour_arrive_date"
                    label="Date et heure d'arrivée du retour"
                    type="datetime-local"
                    value={formData.retour_arrive_date}
                    onChange={handleChange}
                    fullWidth
                    required={formData.aller_retour}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Image du vol
            </Typography>
            <input
              accept="image/*"
              type="file"
              id="flight-image"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="flight-image">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                style={{ marginBottom: 10 }}
              >
                {recreatingFlight && previewUrl ? 'Changer l\'image' : 'Sélectionner une image'}
              </Button>
            </label>
            {previewUrl && (
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                />
                {recreatingFlight && !image && (
                  <Typography variant="caption" display="block" color="textSecondary">
                    Image originale du vol (sera réutilisée si vous n'en sélectionnez pas une nouvelle)
                  </Typography>
                )}
              </div>
            )}
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              style={{ backgroundColor: '#CC0A2B', marginTop: 20 }}
              fullWidth
            >
              {recreatingFlight ? 'Recréer' : 'Ajouter'}
            </Button>
          </Grid>
        </Grid>
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

export default AddFlight;