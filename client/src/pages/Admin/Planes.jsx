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
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Planes = () => {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, plane: null });
  const [viewDialog, setViewDialog] = useState({ open: false, plane: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    planeModel: '',
    totalSeats: '',
    seatConfiguration: ''
  });

  useEffect(() => {
    fetchPlanes();
  }, []);

  const fetchPlanes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/planes');
      setPlanes(response.data);
    } catch (error) {
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

  const handleEditOpen = (plane) => {
    setEditDialog({ open: true, plane });
    setFormData({
      planeModel: plane.planeModel,
      totalSeats: plane.totalSeats,
      seatConfiguration: plane.seatConfiguration
    });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, plane: null });
  };

  const handleViewOpen = (plane) => {
    setViewDialog({ open: true, plane });
  };

  const handleViewClose = () => {
    setViewDialog({ open: false, plane: null });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/planes/${editDialog.plane.idPlane}`, formData);
      showSnackbar('Avion mis à jour avec succès', 'success');
      handleEditClose();
      fetchPlanes();
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour de l\'avion', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet avion ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/planes/${id}`);
        showSnackbar('Avion supprimé avec succès', 'success');
        fetchPlanes();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression de l\'avion', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Gestion des Avions
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        sx={{ mb: 2 }}
        onClick={() => navigate('/admin/planes/add')}
      >
        Ajouter un Avion
      </Button>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Modèle</TableCell>
              <TableCell>Nombre de Sièges</TableCell>
              <TableCell>Configuration</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {planes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((plane) => (
                <TableRow key={plane.idPlane}>
                  <TableCell>{plane.idPlane}</TableCell>
                  <TableCell>{plane.planeModel}</TableCell>
                  <TableCell>{plane.totalSeats}</TableCell>
                  <TableCell>{plane.seatConfiguration}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewOpen(plane)}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditOpen(plane)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(plane.idPlane)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={planes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditClose}>
        <DialogTitle>Modifier l'Avion</DialogTitle>
        <DialogContent>
          <TextField
            name="planeModel"
            label="Modèle"
            value={formData.planeModel}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="totalSeats"
            label="Nombre de Sièges"
            type="number"
            value={formData.totalSeats}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="seatConfiguration"
            label="Configuration des Sièges"
            value={formData.seatConfiguration}
            onChange={handleChange}
            fullWidth
            margin="normal"
            helperText="Ex: 3-3, 2-2"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Annuler</Button>
          <Button onClick={handleUpdate} color="primary">Mettre à jour</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialog.open} onClose={handleViewClose} maxWidth="md">
        <DialogTitle>Détails de l'Avion</DialogTitle>
        <DialogContent>
          {viewDialog.plane && (
            <>
              <Typography variant="h6">Informations Générales</Typography>
              <Typography>ID: {viewDialog.plane.idPlane}</Typography>
              <Typography>Modèle: {viewDialog.plane.planeModel}</Typography>
              <Typography>Nombre de Sièges: {viewDialog.plane.totalSeats}</Typography>
              <Typography>Configuration: {viewDialog.plane.seatConfiguration}</Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }}>Sièges</Typography>
              {viewDialog.plane.seats && viewDialog.plane.seats.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Numéro</TableCell>
                        <TableCell>Classe</TableCell>
                        <TableCell>Disponibilité</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewDialog.plane.seats.map((seat) => (
                        <TableRow key={seat.idSeat}>
                          <TableCell>{seat.seatNumber}</TableCell>
                          <TableCell>{seat.classType}</TableCell>
                          <TableCell>{seat.availability ? 'Disponible' : 'Réservé'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>Aucun siège disponible</Typography>
              )}
              
              <Typography variant="h6" sx={{ mt: 2 }}>Vols</Typography>
              {viewDialog.plane.flights && viewDialog.plane.flights.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Titre</TableCell>
                        <TableCell>Date de Départ</TableCell>
                        <TableCell>Compagnie</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {viewDialog.plane.flights.map((flight) => (
                        <TableRow key={flight.id}>
                          <TableCell>{flight.titre}</TableCell>
                          <TableCell>{new Date(flight.date_depart).toLocaleDateString()}</TableCell>
                          <TableCell>{flight.compagnie_aerienne}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>Aucun vol assigné</Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Planes;