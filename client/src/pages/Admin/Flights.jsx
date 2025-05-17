import React, { useState, useEffect } from 'react';
import {
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
  MenuItem,
  Snackbar,
  Alert,
  Grid,
  Chip,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Box
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon, FileCopy as FileCopyIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotFoundImage from '../../assets/notfound.jpg';

const Flights = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, flight: null });
  const [viewDialog, setViewDialog] = useState({ open: false, flight: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
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
  });
  const [editImage, setEditImage] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState('');

  const [restartDialog, setRestartDialog] = useState({ open: false, flight: null });
  const [restartFormData, setRestartFormData] = useState({
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
  });
  const [restartImage, setRestartImage] = useState(null);
  const [restartPreviewUrl, setRestartPreviewUrl] = useState('');

  // Removed recreateDialog and recreateFormData states as we'll navigate to AddFlight instead

  useEffect(() => {
    fetchFlights();
    fetchAirports();
    fetchPlanes();
  }, []);

  const fetchFlights = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/flights');
      setFlights(response.data);
    } catch (error) {
      console.error('Error fetching flights:', error);
      showSnackbar('Erreur lors du chargement des vols', 'error');
    }
  };

  const fetchAirports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/airports');
      setAirports(response.data);
    } catch (error) {
      console.error('Error fetching airports:', error);
      showSnackbar('Erreur lors du chargement des aéroports', 'error');
    }
  };

  const fetchPlanes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/planes');
      setPlanes(response.data);
    } catch (error) {
      console.error('Error fetching planes:', error);
      showSnackbar('Erreur lors du chargement des avions', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOpen = (flight) => {
    setViewDialog({ open: true, flight });
  };

  const handleViewClose = () => {
    setViewDialog({ open: false, flight: null });
  };

  const handleEditOpen = (flight) => {
    setEditDialog({ open: true, flight });
    setFormData({
      titre: flight.titre,
      prix: flight.prix,
      date_depart: formatDateForInput(flight.date_depart),
      date_retour: formatDateForInput(flight.date_retour),
      duree: flight.duree,
      airport_depart_id: flight.airport_depart?.id || '',
      airport_arrivee_id: flight.airport_arrivee?.id || '',
      plane_id: flight.plane?.idPlane || '',
      aller_retour: flight.aller_retour || false,
      retour_depart_date: flight.retour_depart_date ? formatDateForInput(flight.retour_depart_date) : '',
      retour_arrive_date: flight.retour_arrive_date ? formatDateForInput(flight.retour_arrive_date) : ''
    });

    if (flight.image_url) {
      setEditPreviewUrl(`http://localhost:5000${flight.image_url}`);
    } else {
      setEditPreviewUrl('');
    }
    setEditImage(null);
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, flight: null });
    setFormData({
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
    });
    setEditImage(null);
    setEditPreviewUrl('');
  };

  const handleRestartOpen = (flight) => {
    setRestartDialog({ open: true, flight });
    setRestartFormData({
      titre: flight.titre,
      prix: flight.prix,
      date_depart: '',
      date_retour: '',
      duree: flight.duree,
      airport_depart_id: flight.airport_depart?.id || '',
      airport_arrivee_id: flight.airport_arrivee?.id || '',
      plane_id: flight.plane?.idPlane || '',
      aller_retour: flight.aller_retour || false,
      retour_depart_date: '',
      retour_arrive_date: ''
    });

    if (flight.image_url) {
      setRestartPreviewUrl(`http://localhost:5000${flight.image_url}`);
    } else {
      setRestartPreviewUrl('');
    }
    setRestartImage(null);
  };

  const handleRestartClose = () => {
    setRestartDialog({ open: false, flight: null });
    setRestartFormData({
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
    });
    setRestartImage(null);
    setRestartPreviewUrl('');
  };

  const handleRecreateOpen = (flight) => {
    // Instead of opening a dialog, navigate to AddFlight with state
    navigate('/admin/flights/add', {
      state: {
        recreatingFlight: true,
        flightData: {
          titre: flight.titre,
          prix: flight.prix,
          duree: flight.duree,
          airport_depart_id: flight.airport_depart?.id || '',
          airport_arrivee_id: flight.airport_arrivee?.id || '',
          plane_id: flight.plane?.idPlane || '',
          aller_retour: flight.aller_retour || false,
          // Intentionally not including date_depart, date_retour, retour_depart_date, and retour_arrive_date
          // We'll reuse the image if it exists
          image_url: flight.image_url || ''
        }
      }
    });
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setEditPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleRestartImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRestartImage(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setRestartPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRestartChange = (e) => {
    setRestartFormData({
      ...restartFormData,
      [e.target.name]: e.target.value
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const formDataWithImage = new FormData();

      Object.keys(formData).forEach(key => {
        formDataWithImage.append(key, formData[key]);
      });

      if (editImage) {
        formDataWithImage.append('image', editImage);
      }

      await axios.put(
        `http://localhost:5000/api/flights/${editDialog.flight.id}`,
        formDataWithImage,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      showSnackbar('Vol modifié avec succès');
      handleEditClose();
      fetchFlights();
    } catch (error) {
      console.error('Error updating flight:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la mise à jour du vol', 'error');
    }
  };

  const handleRestart = async (e) => {
    e.preventDefault();
    try {
      const formDataWithImage = new FormData();

      Object.keys(restartFormData).forEach(key => {
        formDataWithImage.append(key, restartFormData[key]);
      });

      if (restartImage) {
        formDataWithImage.append('image', restartImage);
      } else if (restartDialog.flight.image_url) {
        // If no new image is selected but there's an existing image, we need to tell the backend to keep it
        formDataWithImage.append('keepExistingImage', 'true');
      }

      await axios.post(
        `http://localhost:5000/api/flights/${restartDialog.flight.id}/restart`,
        formDataWithImage,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      showSnackbar('Vol redémarré avec succès');
      handleRestartClose();
      fetchFlights();
    } catch (error) {
      console.error('Error restarting flight:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors du redémarrage du vol', 'error');
    }
  };

  // Removed handleRecreate as we'll handle this in the AddFlight component

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce vol ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/flights/${id}`);
        showSnackbar('Vol supprimé avec succès');
        fetchFlights();
      } catch (error) {
        console.error('Error deleting flight:', error);
        showSnackbar('Erreur lors de la suppression du vol', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const isFlightPast = (dateString) => {
    if (!dateString) return false;
    const flightDate = new Date(dateString);
    const now = new Date();
    return flightDate < now;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Vols
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/flights/add')}
          style={{ backgroundColor: '#CC0A2B' }}
        >
          Ajouter un Vol
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Image</TableCell>
              <TableCell>Titre</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Départ</TableCell>
              <TableCell>Arrivée</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flights
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((flight) => {
                const isPast = isFlightPast(flight.date_depart);
                return (
                  <TableRow key={flight.id}>
                    <TableCell>
                      {flight.image_url ? (
                        <img
                          src={`http://localhost:5000${flight.image_url}`}
                          alt={flight.titre}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
                        />
                      ) : (
                        <img
                          src={NotFoundImage}
                          alt="No image available"
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                    </TableCell>
                    <TableCell>{flight.titre}</TableCell>
                    <TableCell>{flight.prix} DT</TableCell>
                    <TableCell>
                      {formatDate(flight.date_depart)}
                      <div>
                        {flight.airport_depart?.nom || '-'} ({flight.airport_depart?.code || '-'})
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(flight.date_retour)}
                      <div>
                        {flight.airport_arrivee?.nom || '-'} ({flight.airport_arrivee?.code || '-'})
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={isPast ? 'Terminé' : 'Actif'}
                        color={isPast ? 'default' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleViewOpen(flight)} color="primary" title="Voir les détails">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleEditOpen(flight)} color="primary" title="Modifier">
                        <EditIcon />
                      </IconButton>
                      {isPast && (
                        <IconButton onClick={() => handleRestartOpen(flight)} color="secondary" title="Redémarrer">
                          <RefreshIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={() => handleRecreateOpen(flight)} color="info" title="Recréer">
                        <FileCopyIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(flight.id)} color="error" title="Supprimer">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={flights.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
        }
      />

      {/* View Dialog */}
      <Dialog open={viewDialog.open} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>Détails du Vol</DialogTitle>
        <DialogContent>
          {viewDialog.flight && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                {viewDialog.flight.image_url && (
                  <img
                    src={`http://localhost:5000${viewDialog.flight.image_url}`}
                    alt={viewDialog.flight.titre}
                    style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: '8px' }}
                  />
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">{viewDialog.flight.titre}</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Prix:</strong> {viewDialog.flight.prix} DT
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Durée:</strong> {viewDialog.flight.duree || '-'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  <strong>Avion:</strong> {viewDialog.flight.plane?.planeModel || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Départ</Typography>
                <Typography variant="body1">
                  {formatDate(viewDialog.flight.date_depart)}
                </Typography>
                <Typography variant="body1">
                  {viewDialog.flight.airport_depart?.nom || '-'} ({viewDialog.flight.airport_depart?.code || '-'})
                </Typography>
                <Typography variant="body2">
                  {viewDialog.flight.airport_depart?.location?.ville || '-'}, {viewDialog.flight.airport_depart?.pays || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Arrivée</Typography>
                <Typography variant="body1">
                  {formatDate(viewDialog.flight.date_retour)}
                </Typography>
                <Typography variant="body1">
                  {viewDialog.flight.airport_arrivee?.nom || '-'} ({viewDialog.flight.airport_arrivee?.code || '-'})
                </Typography>
                <Typography variant="body2">
                  {viewDialog.flight.airport_arrivee?.location?.ville || '-'}, {viewDialog.flight.airport_arrivee?.pays || '-'}
                </Typography>
              </Grid>

              {viewDialog.flight.aller_retour && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3 }}>Vol de retour</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Informations sur le vol de retour
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Départ du retour</Typography>
                    <Typography variant="body1">
                      {viewDialog.flight.retour_depart_date ? formatDate(viewDialog.flight.retour_depart_date) : '-'}
                    </Typography>
                    <Typography variant="body1">
                      {viewDialog.flight.airport_arrivee?.nom || '-'} ({viewDialog.flight.airport_arrivee?.code || '-'})
                    </Typography>
                    <Typography variant="body2">
                      {viewDialog.flight.airport_arrivee?.location?.ville || '-'}, {viewDialog.flight.airport_arrivee?.pays || '-'}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2 }}>Arrivée du retour</Typography>
                    <Typography variant="body1">
                      {viewDialog.flight.retour_arrive_date ? formatDate(viewDialog.flight.retour_arrive_date) : '-'}
                    </Typography>
                    <Typography variant="body1">
                      {viewDialog.flight.airport_depart?.nom || '-'} ({viewDialog.flight.airport_depart?.code || '-'})
                    </Typography>
                    <Typography variant="body2">
                      {viewDialog.flight.airport_depart?.location?.ville || '-'}, {viewDialog.flight.airport_depart?.pays || '-'}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Modifier le Vol</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
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
                  label="Date et heure de retour"
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
                  name="duree"
                  label="Durée"
                  value={formData.duree}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
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
                  {planes.map((plane) => (
                    <MenuItem key={plane.idPlane} value={plane.idPlane}>
                      {plane.planeModel} ({plane.totalSeats} sièges)
                    </MenuItem>
                  ))}
                </TextField>
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
                <>
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
                </>
              )}

              <Grid item xs={12}>
                <div style={{ marginTop: 16 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="edit-image-upload"
                    type="file"
                    onChange={handleEditImageChange}
                  />
                  <label htmlFor="edit-image-upload">
                    <Button variant="outlined" component="span">
                      {editPreviewUrl ? 'Changer l\'image' : 'Ajouter une image'}
                    </Button>
                  </label>
                </div>
                {editPreviewUrl && (
                  <div style={{ marginTop: 16 }}>
                    <Typography variant="subtitle1">Aperçu de l'image:</Typography>
                    <img
                      src={editPreviewUrl}
                      alt="Aperçu"
                      style={{ maxWidth: '100%', maxHeight: 200, marginTop: 8 }}
                    />
                  </div>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              Mettre à jour
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Restart Dialog */}
      <Dialog open={restartDialog.open} onClose={handleRestartClose} maxWidth="md" fullWidth>
        <DialogTitle>Redémarrer le Vol</DialogTitle>
        <form onSubmit={handleRestart}>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Vous pouvez redémarrer ce vol avec de nouvelles dates. Les autres informations seront conservées.
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  name="titre"
                  label="Titre"
                  value={restartFormData.titre}
                  onChange={handleRestartChange}
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
                  value={restartFormData.prix}
                  onChange={handleRestartChange}
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
                  label="Nouvelle date et heure de départ"
                  type="datetime-local"
                  value={restartFormData.date_depart}
                  onChange={handleRestartChange}
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="date_retour"
                  label="Nouvelle date et heure de retour"
                  type="datetime-local"
                  value={restartFormData.date_retour}
                  onChange={handleRestartChange}
                  fullWidth
                  required
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="duree"
                  label="Durée"
                  value={restartFormData.duree}
                  onChange={handleRestartChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="plane_id"
                  label="Avion"
                  select
                  value={restartFormData.plane_id}
                  onChange={handleRestartChange}
                  fullWidth
                  required
                  margin="normal"
                >
                  <MenuItem value="">Sélectionner un avion</MenuItem>
                  {planes.map((plane) => (
                    <MenuItem key={plane.idPlane} value={plane.idPlane}>
                      {plane.planeModel} ({plane.totalSeats} sièges)
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  name="airport_depart_id"
                  label="Aéroport de départ"
                  select
                  value={restartFormData.airport_depart_id}
                  onChange={handleRestartChange}
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
                  value={restartFormData.airport_arrivee_id}
                  onChange={handleRestartChange}
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

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="aller_retour"
                      checked={restartFormData.aller_retour}
                      onChange={(e) => setRestartFormData({
                        ...restartFormData,
                        aller_retour: e.target.checked
                      })}
                    />
                  }
                  label="Vol aller-retour"
                />
              </Grid>

              {restartFormData.aller_retour && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="retour_depart_date"
                      label="Date et heure de départ du retour"
                      type="datetime-local"
                      value={restartFormData.retour_depart_date}
                      onChange={handleRestartChange}
                      fullWidth
                      required={restartFormData.aller_retour}
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      name="retour_arrive_date"
                      label="Date et heure d'arrivée du retour"
                      type="datetime-local"
                      value={restartFormData.retour_arrive_date}
                      onChange={handleRestartChange}
                      fullWidth
                      required={restartFormData.aller_retour}
                      margin="normal"
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <div style={{ marginTop: 16 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="restart-image-upload"
                    type="file"
                    onChange={handleRestartImageChange}
                  />
                  <label htmlFor="restart-image-upload">
                    <Button variant="outlined" component="span">
                      {restartPreviewUrl ? 'Changer l\'image' : 'Ajouter une image'}
                    </Button>
                  </label>
                </div>
                {restartPreviewUrl && (
                  <div style={{ marginTop: 16 }}>
                    <Typography variant="subtitle1">Aperçu de l'image:</Typography>
                    <img
                      src={restartPreviewUrl}
                      alt="Aperçu"
                      style={{ maxWidth: '100%', maxHeight: 200, marginTop: 8 }}
                    />
                  </div>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRestartClose}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              Redémarrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Removed Recreate Dialog - now navigating to AddFlight page instead */}

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

export default Flights;