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
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Flights = () => {
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState([]);
  const [planes, setPlanes] = useState([]); // Add state for planes
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, flight: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    titre: '',
    prix: '',
    date_depart: '',
    date_retour: '',
    duree: '',
    airport_depart_id: '',
    airport_arrivee_id: '',
    plane_id: '' // Changed from compagnie_aerienne
  });
  const [restartDialog, setRestartDialog] = useState({ open: false, flight: null });
  const [restartFormData, setRestartFormData] = useState({
    titre: '',
    prix: '',
    date_depart: '',
    date_retour: '',
    duree: '',
    airport_depart_id: '',
    airport_arrivee_id: '',
    plane_id: ''
  });

  useEffect(() => {
    fetchFlights();
    fetchAirports();
    fetchPlanes(); // Add function to fetch planes
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

  // Add function to fetch planes
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

  const handleEditOpen = (flight) => {
    setEditDialog({ open: true, flight });
    setFormData({
      titre: flight.titre,
      prix: flight.prix,
      date_depart: formatDateForInput(flight.date_depart),
      date_retour: formatDateForInput(flight.date_retour),
      duree: flight.duree,
      airport_depart_id: flight.airport_depart?.id || '',
      airport_arrivee_id: flight.arrival_airport?.id || '', // Changed from airport_arrivee
      plane_id: flight.plane?.idPlane || '' // Changed from compagnie_aerienne
    });
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
      plane_id: '' // Changed from compagnie_aerienne
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/flights/${editDialog.flight.id}`, formData);
      showSnackbar('Vol modifié avec succès');
      handleEditClose();
      fetchFlights();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce vol ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/flights/${id}`);
        showSnackbar('Vol supprimé avec succès');
        fetchFlights();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleRestartOpen = (flight) => {
    setRestartDialog({ open: true, flight });
    // Pre-fill form with flight data but with empty dates and price
    setRestartFormData({
      titre: flight.titre,
      prix: '', // Empty price for user to fill
      date_depart: '', // Empty date for user to fill
      date_retour: '', // Empty date for user to fill
      duree: flight.duree,
      airport_depart_id: flight.airport_depart?.id || '',
      airport_arrivee_id: flight.arrival_airport?.id || '',
      plane_id: flight.plane?.idPlane || ''
    });
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
      plane_id: ''
    });
  };

  const handleRestartChange = (e) => {
    setRestartFormData({
      ...restartFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleRestartFlight = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/flights', restartFormData);
      showSnackbar('Vol recréé avec succès');
      handleRestartClose();
      fetchFlights();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue lors de la recréation du vol', 'error');
    }
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
              <TableCell>Titre</TableCell>
              <TableCell>Prix</TableCell>
              <TableCell>Départ</TableCell>
              <TableCell>Retour</TableCell>
              <TableCell>Aéroport de départ</TableCell>
              <TableCell>Aéroport d'arrivée</TableCell>
              <TableCell>Avion</TableCell>
              <TableCell>Durée</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {flights
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell>{flight.titre}</TableCell>
                  <TableCell>
                        {flight.prix} DT
                  </TableCell>
                  <TableCell>{formatDate(flight.date_depart)}</TableCell>
                  <TableCell>{formatDate(flight.date_retour)}</TableCell>
                  <TableCell>{flight.airport_depart ? `${flight.airport_depart.nom} (${flight.airport_depart.code})` : '-'}</TableCell>
                  <TableCell>{flight.arrival_airport ? `${flight.arrival_airport.nom} (${flight.arrival_airport.code})` : '-'}</TableCell>
                  <TableCell>{flight.plane ? `${flight.plane.planeModel}` : '-'}</TableCell>
                  <TableCell>{flight.duree}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleRestartOpen(flight)} color="success" title="Recréer ce vol">
                      <RefreshIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditOpen(flight)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(flight.id)} color="error">
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

      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Modifier le Vol</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <TextField
              name="titre"
              label="Titre"
              value={formData.titre}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              name="prix"
              label="Prix"
              type="number"
              value={formData.prix}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              InputProps={{
                startAdornment: <span>€</span>,
              }}
            />
            <TextField
              name="date_depart"
              label="Date et heure de départ"
              type="datetime-local"
              value={formData.date_depart}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="date_retour"
              label="Date et heure de retour"
              type="datetime-local"
              value={formData.date_retour}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="airport_depart_id"
              label="Aéroport de départ"
              select
              value={formData.airport_depart_id}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            >
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.nom} ({airport.code})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="airport_arrivee_id"
              label="Aéroport d'arrivée"
              select
              value={formData.airport_arrivee_id}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            >
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.nom} ({airport.code})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="plane_id"
              label="Avion"
              select
              value={formData.plane_id}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            >
              {planes.map((plane) => (
                <MenuItem key={plane.idPlane} value={plane.idPlane}>
                  {plane.planeModel} ({plane.totalSeats} sièges)
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="duree"
              label="Durée"
              value={formData.duree}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              placeholder="Ex: 2h 30m"
            />
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

      <Dialog open={restartDialog.open} onClose={handleRestartClose} maxWidth="md" fullWidth>
        <DialogTitle>Recréer le Vol</DialogTitle>
        <form onSubmit={handleRestartFlight}>
          <DialogContent>
            <TextField
              name="titre"
              label="Titre"
              value={restartFormData.titre}
              onChange={handleRestartChange}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              name="prix"
              label="Prix"
              type="number"
              value={restartFormData.prix}
              onChange={handleRestartChange}
              fullWidth
              required
              margin="dense"
              InputProps={{
                startAdornment: <span>DT</span>,
              }}
            />
            <TextField
              name="date_depart"
              label="Date et heure de départ"
              type="datetime-local"
              value={restartFormData.date_depart}
              onChange={handleRestartChange}
              fullWidth
              required
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="date_retour"
              label="Date et heure de retour"
              type="datetime-local"
              value={restartFormData.date_retour}
              onChange={handleRestartChange}
              fullWidth
              required
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="airport_depart_id"
              label="Aéroport de départ"
              select
              value={restartFormData.airport_depart_id}
              onChange={handleRestartChange}
              fullWidth
              required
              margin="dense"
            >
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.nom} ({airport.code})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="airport_arrivee_id"
              label="Aéroport d'arrivée"
              select
              value={restartFormData.airport_arrivee_id}
              onChange={handleRestartChange}
              fullWidth
              required
              margin="dense"
            >
              {airports.map((airport) => (
                <MenuItem key={airport.id} value={airport.id}>
                  {airport.nom} ({airport.code})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="plane_id"
              label="Avion"
              select
              value={restartFormData.plane_id}
              onChange={handleRestartChange}
              fullWidth
              required
              margin="dense"
            >
              {planes.map((plane) => (
                <MenuItem key={plane.idPlane} value={plane.idPlane}>
                  {plane.planeModel} ({plane.totalSeats} sièges)
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="duree"
              label="Durée"
              value={restartFormData.duree}
              onChange={handleRestartChange}
              fullWidth
              required
              margin="dense"
              placeholder="Ex: 2h 30m"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRestartClose}>Annuler</Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="success"
            >
              Recréer le Vol
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

export default Flights;