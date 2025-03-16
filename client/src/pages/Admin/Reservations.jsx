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
  Snackbar,
  Alert,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, reservation: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, reservation: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    date_reservation: '',
    statut: '',
    prix_total: '',
    nombre_passagers: '',
    user_id: '',
    flight_id: ''
  });

  useEffect(() => {
    fetchReservations();
    fetchFlights();
    fetchUsers();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reservations');
      setReservations(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des réservations', 'error');
    }
  };

  const fetchFlights = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/flights');
      setFlights(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des vols', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des utilisateurs', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditOpen = (reservation) => {
    const formattedDate = new Date(reservation.date_reservation).toISOString().split('T')[0];
    
    setEditDialog({ open: true, reservation });
    setFormData({
      date_reservation: formattedDate,
      statut: reservation.statut,
      prix_total: reservation.prix_total,
      nombre_passagers: reservation.nombre_passagers,
      user_id: reservation.user?.id || '',
      flight_id: reservation.flight?.id || ''
    });
  };

  const handleDetailsOpen = (reservation) => {
    setDetailsDialog({ open: true, reservation });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, reservation: null });
    resetFormData();
  };

  const handleDetailsClose = () => {
    setDetailsDialog({ open: false, reservation: null });
  };

  const resetFormData = () => {
    setFormData({
      date_reservation: '',
      statut: '',
      prix_total: '',
      nombre_passagers: '',
      user_id: '',
      flight_id: ''
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
      await axios.put(`http://localhost:5000/api/reservations/${editDialog.reservation.id}`, formData);
      showSnackbar('Réservation modifiée avec succès');
      handleEditClose();
      fetchReservations();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reservations/${id}`);
        showSnackbar('Réservation supprimée avec succès');
        fetchReservations();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmée':
        return '#4CAF50';
      case 'en attente':
        return '#FFC107';
      case 'annulée':
        return '#F44336';
      default:
        return 'inherit';
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.nom : 'Utilisateur inconnu';
  };

  const getFlightTitle = (flightId) => {
    const flight = flights.find(f => f.id === flightId);
    return flight ? flight.titre : 'Vol inconnu';
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Réservations
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/reservations/add')}
          style={{ backgroundColor: '#CC0A2B' }}
        >
          Ajouter une Réservation
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Vol</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Prix Total</TableCell>
              <TableCell>Passagers</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.id.substring(0, 8)}...</TableCell>
                  <TableCell>{formatDate(reservation.date_reservation)}</TableCell>
                  <TableCell>{reservation.user ? reservation.user.nom : getUserName(reservation.user_id)}</TableCell>
                  <TableCell>{reservation.flight ? reservation.flight.titre : getFlightTitle(reservation.flight_id)}</TableCell>
                  <TableCell>
                    <span style={{ 
                      color: getStatusColor(reservation.statut),
                      fontWeight: 'bold'
                    }}>
                      {reservation.statut}
                    </span>
                  </TableCell>
                  <TableCell>{reservation.prix_total} €</TableCell>
                  <TableCell>{reservation.nombre_passagers}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDetailsOpen(reservation)} color="info">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditOpen(reservation)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(reservation.id)} color="error">
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
        count={reservations.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
        }
      />

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier la Réservation</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <TextField
              name="date_reservation"
              label="Date de réservation"
              type="date"
              value={formData.date_reservation}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Statut</InputLabel>
              <Select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                required
              >
                <MenuItem value="Confirmée">Confirmée</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Annulée">Annulée</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              name="prix_total"
              label="Prix Total"
              type="number"
              value={formData.prix_total}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            
            <TextField
              name="nombre_passagers"
              label="Nombre de passagers"
              type="number"
              value={formData.nombre_passagers}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Client</InputLabel>
              <Select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>{user.nom} ({user.email})</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Vol</InputLabel>
              <Select
                name="flight_id"
                value={formData.flight_id}
                onChange={handleChange}
                required
              >
                {flights.map(flight => (
                  <MenuItem key={flight.id} value={flight.id}>
                    {flight.titre} ({flight.ville_depart} - {flight.ville_arrivee})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

      {/* Details Dialog */}
      <Dialog open={detailsDialog.open} onClose={handleDetailsClose} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la Réservation</DialogTitle>
        <DialogContent>
          {detailsDialog.reservation && (
            <div>
              <Typography variant="h6" gutterBottom>Informations de réservation</Typography>
              <Typography><strong>ID:</strong> {detailsDialog.reservation.id}</Typography>
              <Typography><strong>Date:</strong> {formatDate(detailsDialog.reservation.date_reservation)}</Typography>
              <Typography><strong>Statut:</strong> 
                <span style={{ 
                  color: getStatusColor(detailsDialog.reservation.statut),
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}>
                  {detailsDialog.reservation.statut}
                </span>
              </Typography>
              <Typography><strong>Prix Total:</strong> {detailsDialog.reservation.prix_total} €</Typography>
              <Typography><strong>Nombre de passagers:</strong> {detailsDialog.reservation.nombre_passagers}</Typography>
              
              <Typography variant="h6" style={{ marginTop: '20px' }} gutterBottom>Informations du client</Typography>
              {detailsDialog.reservation.user ? (
                <>
                  <Typography><strong>Nom:</strong> {detailsDialog.reservation.user.nom}</Typography>
                  <Typography><strong>Email:</strong> {detailsDialog.reservation.user.email}</Typography>
                  <Typography><strong>Téléphone:</strong> {detailsDialog.reservation.user.numero_telephone || '-'}</Typography>
                </>
              ) : (
                <Typography>Informations client non disponibles</Typography>
              )}
              
              <Typography variant="h6" style={{ marginTop: '20px' }} gutterBottom>Informations du vol</Typography>
              {detailsDialog.reservation.flight ? (
                <>
                  <Typography><strong>Titre:</strong> {detailsDialog.reservation.flight.titre}</Typography>
                  <Typography><strong>Départ:</strong> {detailsDialog.reservation.flight.ville_depart}</Typography>
                  <Typography><strong>Arrivée:</strong> {detailsDialog.reservation.flight.ville_arrivee}</Typography>
                  <Typography><strong>Date de départ:</strong> {formatDate(detailsDialog.reservation.flight.date_depart)}</Typography>
                  <Typography><strong>Date de retour:</strong> {formatDate(detailsDialog.reservation.flight.date_retour)}</Typography>
                  <Typography><strong>Compagnie:</strong> {detailsDialog.reservation.flight.compagnie_aerienne}</Typography>
                </>
              ) : (
                <Typography>Informations vol non disponibles</Typography>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsClose}>Fermer</Button>
        </DialogActions>
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

export default Reservations;