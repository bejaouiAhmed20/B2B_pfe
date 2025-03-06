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

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, client: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    numero_telephone: '',
    pays: '',
    adresse: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setClients(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des clients', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditOpen = (client) => {
    setEditDialog({ open: true, client });
    setFormData({
      nom: client.nom,
      email: client.email,
      numero_telephone: client.numero_telephone || '',
      pays: client.pays || '',
      adresse: client.adresse || ''
    });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, client: null });
    setFormData({
      nom: '',
      email: '',
      numero_telephone: '',
      pays: '',
      adresse: ''
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
      await axios.put(`http://localhost:5000/api/users/${editDialog.client.id}`, formData);
      showSnackbar('Client modifié avec succès');
      handleEditClose();
      fetchClients();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${id}`);
        showSnackbar('Client supprimé avec succès');
        fetchClients();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Clients
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/clients/add')}
          style={{ backgroundColor: '#CC0A2B' }}
        >
          Ajouter un Client
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Téléphone</TableCell>
              <TableCell>Pays</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.nom}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.numero_telephone || '-'}</TableCell>
                  <TableCell>{client.pays || '-'}</TableCell>
                  <TableCell>{client.adresse || '-'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditOpen(client)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(client.id)} color="error">
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
        count={clients.length}
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
        <DialogTitle>Modifier le Client</DialogTitle>
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
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            <TextField
              name="numero_telephone"
              label="Téléphone"
              value={formData.numero_telephone}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              name="pays"
              label="Pays"
              value={formData.pays}
              onChange={handleChange}
              fullWidth
              margin="dense"
            />
            <TextField
              name="adresse"
              label="Adresse"
              value={formData.adresse}
              onChange={handleChange}
              fullWidth
              margin="dense"
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

export default Clients;