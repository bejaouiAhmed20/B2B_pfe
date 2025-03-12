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
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Airports = () => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, airport: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nom: '',
    code: '',
    pays: '',
    description: '',
    est_actif: true,
    location_id: ''
  });

  useEffect(() => {
    fetchAirports();
    fetchLocations();
  }, []);

  const fetchAirports = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/airports');
      setAirports(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des aéroports', 'error');
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/locations');
      setLocations(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des locations', 'error');
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
      code: airport.code,
      pays: airport.pays,
      description: airport.description || '',
      est_actif: airport.est_actif,
      location_id: airport.location?.id || ''
    });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, airport: null });
    setFormData({
      nom: '',
      code: '',
      pays: '',
      description: '',
      est_actif: true,
      location_id: ''
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
              <TableCell>Code</TableCell>
              <TableCell>Pays</TableCell>
              <TableCell>Ville (Location)</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {airports
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((airport) => (
                <TableRow key={airport.id}>
                  <TableCell>{airport.nom}</TableCell>
                  <TableCell>{airport.code}</TableCell>
                  <TableCell>{airport.pays}</TableCell>
                  <TableCell>{airport.location ? `${airport.location.ville}, ${airport.location.pays}` : '-'}</TableCell>
                  <TableCell>{airport.description || '-'}</TableCell>
                  <TableCell>{airport.est_actif ? 'Actif' : 'Inactif'}</TableCell>
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
              name="code"
              label="Code"
              value={formData.code}
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
              name="location_id"
              label="Location"
              select
              value={formData.location_id}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            >
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.ville}, {location.pays}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="description"
              label="Description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              margin="dense"
            />
            <TextField
              name="est_actif"
              label="Statut"
              select
              value={formData.est_actif}
              onChange={handleChange}
              fullWidth
              margin="dense"
            >
              <MenuItem value={true}>Actif</MenuItem>
              <MenuItem value={false}>Inactif</MenuItem>
            </TextField>
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