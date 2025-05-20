import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

function Popups() {
  const [popups, setPopups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentPopup, setCurrentPopup] = useState(null);
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

  // Fetch popups
  const fetchPopups = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/popups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch popups');
      }

      const data = await response.json();
      setPopups(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching popups:', err);
      setError('Une erreur est survenue lors de la récupération des popups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPopups();
  }, []);

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

  // Open dialog for adding a new popup
  const handleAddPopup = () => {
    setCurrentPopup(null);
    setFormData({
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
    // Reset image state
    setImageFile(null);
    setImagePreview('');
    setOpenDialog(true);
  };

  // Open dialog for editing a popup
  const handleEditPopup = (popup) => {
    setCurrentPopup(popup);
    setFormData({
      title: popup.title,
      content: popup.content,
      active: popup.active,
      image_url: popup.image_url || '',
      type: popup.type,
      button_text: popup.button_text || '',
      button_link: popup.button_link || '',
      display_order: popup.display_order,
      start_date: popup.start_date || null,
      end_date: popup.end_date || null
    });

    // Reset image file but keep the preview if there's an existing image
    setImageFile(null);
    setImagePreview('');

    setOpenDialog(true);
  };

  // Open dialog for deleting a popup
  const handleDeleteClick = (popup) => {
    setCurrentPopup(popup);
    setOpenDeleteDialog(true);
  };

  // Toggle popup active status
  const handleToggleStatus = async (popup) => {
    try {
      const response = await fetch(`http://localhost:5000/api/popups/${popup.id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle popup status');
      }

      const result = await response.json();

      // Update the popup in the list
      setPopups(popups.map(p =>
        p.id === popup.id ? { ...p, active: !p.active } : p
      ));

      setSnackbar({
        open: true,
        message: result.message,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error toggling popup status:', err);
      setSnackbar({
        open: true,
        message: 'Une erreur est survenue lors du changement de statut',
        severity: 'error'
      });
    }
  };

  // Save popup (create or update)
  const handleSavePopup = async () => {
    try {
      // Upload image first if there's a new image
      let imagePath = formData.image_url;
      if (imageFile) {
        imagePath = await uploadImage();
        if (!imagePath) {
          return; // Stop if image upload failed
        }
      }

      const url = currentPopup
        ? `http://localhost:5000/api/popups/${currentPopup.id}`
        : 'http://localhost:5000/api/popups';

      const method = currentPopup ? 'PUT' : 'POST';

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
        throw new Error(`Failed to ${currentPopup ? 'update' : 'create'} popup`);
      }

      const savedPopup = await response.json();

      if (currentPopup) {
        // Update existing popup in the list
        setPopups(popups.map(p =>
          p.id === currentPopup.id ? savedPopup : p
        ));
        setSnackbar({
          open: true,
          message: 'Popup mis à jour avec succès',
          severity: 'success'
        });
      } else {
        // Add new popup to the list
        setPopups([...popups, savedPopup]);
        setSnackbar({
          open: true,
          message: 'Popup créé avec succès',
          severity: 'success'
        });
      }

      // Reset image state
      setImageFile(null);
      setImagePreview('');

      setOpenDialog(false);
    } catch (err) {
      console.error('Error saving popup:', err);
      setSnackbar({
        open: true,
        message: `Une erreur est survenue lors de l'${currentPopup ? 'mise à jour' : 'ajout'} du popup`,
        severity: 'error'
      });
    }
  };

  // Delete popup
  const handleDeletePopup = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/popups/${currentPopup.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete popup');
      }

      // Remove popup from the list
      setPopups(popups.filter(p => p.id !== currentPopup.id));

      setSnackbar({
        open: true,
        message: 'Popup supprimé avec succès',
        severity: 'success'
      });

      setOpenDeleteDialog(false);
    } catch (err) {
      console.error('Error deleting popup:', err);
      setSnackbar({
        open: true,
        message: 'Une erreur est survenue lors de la suppression du popup',
        severity: 'error'
      });
    }
  };

  // Get color based on popup type
  const getTypeColor = (type) => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des Popups
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPopup}
        >
          Ajouter un Popup
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : popups.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Aucun popup n'a été créé
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddPopup}
            sx={{ mt: 2 }}
          >
            Créer votre premier popup
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Ordre</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {popups.map((popup) => (
                <TableRow key={popup.id}>
                  <TableCell>{popup.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={popup.type}
                      color={getTypeColor(popup.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{popup.display_order}</TableCell>
                  <TableCell>
                    {popup.start_date && popup.end_date ? (
                      `${popup.start_date} - ${popup.end_date}`
                    ) : popup.start_date ? (
                      `À partir du ${popup.start_date}`
                    ) : popup.end_date ? (
                      `Jusqu'au ${popup.end_date}`
                    ) : (
                      'Permanent'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={popup.active ? 'Actif' : 'Inactif'}
                      color={popup.active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color={popup.active ? 'success' : 'default'}
                      onClick={() => handleToggleStatus(popup)}
                      title={popup.active ? 'Désactiver' : 'Activer'}
                    >
                      {popup.active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleEditPopup(popup)}
                      title="Modifier"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(popup)}
                      title="Supprimer"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Popup Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentPopup ? 'Modifier le Popup' : 'Ajouter un Popup'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                name="title"
                label="Titre"
                fullWidth
                value={formData.title}
                onChange={handleInputChange}
                required
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
                rows={4}
                fullWidth
                value={formData.content}
                onChange={handleInputChange}
                required
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

            <Grid item xs={12} sm={4}>
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
          <Button onClick={handleSavePopup} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer le popup "{currentPopup?.title}" ?
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDeletePopup} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

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

export default Popups;