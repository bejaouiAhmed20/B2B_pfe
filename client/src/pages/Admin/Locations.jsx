import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Locations = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, location: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nom: '',
    ville: '',
    pays: '',
    description: '',
    est_actif: true
  });
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/locations');
      setLocations(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des emplacements', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditOpen = (location) => {
    setEditDialog({ open: true, location });
    setFormData({
      nom: location.nom,
      ville: location.ville,
      pays: location.pays,
      description: location.description || '',
      est_actif: location.est_actif
    });
    setPreviewImage(location.url_image ? `http://localhost:5000${location.url_image}` : '');
    setImage(null);
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, location: null });
    setFormData({
      nom: '',
      ville: '',
      pays: '',
      description: '',
      est_actif: true
    });
    setPreviewImage('');
    setImage(null);
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
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('ville', formData.ville);
      formDataToSend.append('pays', formData.pays);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('est_actif', formData.est_actif);
      
      if (image) {
        formDataToSend.append('image', image);
      }

      await axios.put(
        `http://localhost:5000/api/locations/${editDialog.location.id}`, 
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      showSnackbar('Emplacement modifié avec succès');
      handleEditClose();
      fetchLocations();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/locations/${id}`);
        showSnackbar('Emplacement supprimé avec succès');
        fetchLocations();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Emplacements
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/locations/add')}
          style={{ backgroundColor: '#CC0A2B' }}
        >
          Ajouter un Emplacement
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Nom</TableCell>
              <TableCell>Ville</TableCell>
              <TableCell>Pays</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    {location.url_image ? (
                      <img 
                        src={`http://localhost:5000${location.url_image}`} 
                        alt={location.nom} 
                        style={{ width: 50, height: 50, objectFit: 'cover' }}
                      />
                    ) : (
                      'Aucune image'
                    )}
                  </TableCell>
                  <TableCell>{location.nom}</TableCell>
                  <TableCell>{location.ville}</TableCell>
                  <TableCell>{location.pays}</TableCell>
                  <TableCell>{location.description || '-'}</TableCell>
                  <TableCell>{location.est_actif ? 'Actif' : 'Inactif'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditOpen(location)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(location.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={locations.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
        }
      />

      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier l'Emplacement</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <TextField
              name="nom"
              label="Nom"
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              name="ville"
              label="Ville"
              value={formData.ville}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              name="pays"
              label="Pays"
              value={formData.pays}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              margin="dense"
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
            {previewImage && (
              <Box mt={2} textAlign="center">
                <img 
                  src={previewImage} 
                  alt="Aperçu" 
                  style={{ maxWidth: '100%', maxHeight: '200px' }} 
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Annuler</Button>
            <Button 
              type="submit" 
              variant="contained" 
              style={{ backgroundColor: '#CC0A2B' }}
            >
              Modifier
            </Button>
          </DialogActions>
        </form>
      </Dialog>

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

export default Locations;