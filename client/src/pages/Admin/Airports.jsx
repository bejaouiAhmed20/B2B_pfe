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
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Airports = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, airport: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nom: '',
    code_iata: '',
    ville: '',
    pays: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchAirports();
  }, []);

  const fetchAirports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/airports');
      setAirports(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des aéroports', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditOpen = (airport) => {
    setEditDialog({ open: true, airport });
    setFormData({
      nom: airport.nom,
      code_iata: airport.code_iata,
      ville: airport.ville,
      pays: airport.pays,
      latitude: airport.latitude,
      longitude: airport.longitude
    });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, airport: null });
    setFormData({
      nom: '',
      code_iata: '',
      ville: '',
      pays: '',
      latitude: '',
      longitude: ''
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
      await axios.put(`http://localhost:5000/api/airports/${editDialog.airport.id}`, formData);
      showSnackbar('Aéroport modifié avec succès');
      handleEditClose();
      fetchAirports();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet aéroport ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/airports/${id}`);
        showSnackbar('Aéroport supprimé avec succès');
        fetchAirports();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Aéroports
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/airports/add')}
          style={{ backgroundColor: '#CC0A2B' }}
        >
          Ajouter un Aéroport
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Code IATA</TableCell>
              <TableCell>Ville</TableCell>
              <TableCell>Pays</TableCell>
              <TableCell>Latitude</TableCell>
              <TableCell>Longitude</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {airports
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((airport) => (
                <TableRow key={airport.id}>
                  <TableCell>{airport.nom}</TableCell>
                  <TableCell>{airport.code_iata}</TableCell>
                  <TableCell>{airport.ville}</TableCell>
                  <TableCell>{airport.pays}</TableCell>
                  <TableCell>{airport.latitude}</TableCell>
                  <TableCell>{airport.longitude}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditOpen(airport)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(airport.id)} color="error">
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
        count={airports.length}
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
        <DialogTitle>Modifier l'Aéroport</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <TextField
              name="nom"
              label="Nom de l'aéroport"
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              name="code_iata"
              label="Code IATA"
              value={formData.code_iata}
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
              name="latitude"
              label="Latitude"
              type="number"
              value={formData.latitude}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              inputProps={{ step: "any" }}
            />
            <TextField
              name="longitude"
              label="Longitude"
              type="number"
              value={formData.longitude}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              inputProps={{ step: "any" }}
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

export default Airports;