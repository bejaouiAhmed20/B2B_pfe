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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Seats = () => {
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, seat: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    seatNumber: '',
    classType: '',
    availability: true,
    idPlane: ''
  });

  useEffect(() => {
    fetchSeats();
    fetchPlanes();
  }, []);

  const fetchSeats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/seats');
      setSeats(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des sièges', 'error');
    }
  };

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

  const handleEditOpen = (seat) => {
    setEditDialog({ open: true, seat });
    setFormData({
      seatNumber: seat.seatNumber,
      classType: seat.classType,
      availability: seat.availability,
      idPlane: seat.plane.idPlane
    });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, seat: null });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`http://localhost:5000/api/seats/${editDialog.seat.idSeat}`, formData);
      showSnackbar('Siège mis à jour avec succès', 'success');
      handleEditClose();
      fetchSeats();
    } catch (error) {
      showSnackbar('Erreur lors de la mise à jour du siège', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce siège ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/seats/${id}`);
        showSnackbar('Siège supprimé avec succès', 'success');
        fetchSeats();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression du siège', 'error');
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
        Gestion des Sièges
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        sx={{ mb: 2 }}
        onClick={() => navigate('/admin/seats/add')}
      >
        Ajouter un Siège
      </Button>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Numéro</TableCell>
              <TableCell>Classe</TableCell>
              <TableCell>Disponibilité</TableCell>
              <TableCell>Avion</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {seats
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((seat) => (
                <TableRow key={seat.idSeat}>
                  <TableCell>{seat.idSeat}</TableCell>
                  <TableCell>{seat.seatNumber}</TableCell>
                  <TableCell>
                    {seat.classType === 'economy' && 'Économique'}
                    {seat.classType === 'business' && 'Affaires'}
                    {seat.classType === 'first' && 'Première'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={seat.availability ? 'Disponible' : 'Réservé'} 
                      color={seat.availability ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{seat.plane?.planeModel || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditOpen(seat)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(seat.idSeat)}>
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
        count={seats.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditClose}>
        <DialogTitle>Modifier le Siège</DialogTitle>
        <DialogContent>
          <TextField
            name="seatNumber"
            label="Numéro de Siège"
            value={formData.seatNumber}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Classe</InputLabel>
            <Select
              name="classType"
              value={formData.classType}
              onChange={handleChange}
              label="Classe"
            >
              <MenuItem value="economy">Économique</MenuItem>
              <MenuItem value="business">Affaires</MenuItem>
              <MenuItem value="first">Première</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Disponibilité</InputLabel>
            <Select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              label="Disponibilité"
            >
              <MenuItem value={true}>Disponible</MenuItem>
              <MenuItem value={false}>Réservé</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Avion</InputLabel>
            <Select
              name="idPlane"
              value={formData.idPlane}
              onChange={handleChange}
              label="Avion"
            >
              {planes.map((plane) => (
                <MenuItem key={plane.idPlane} value={plane.idPlane}>
                  {plane.planeModel} (ID: {plane.idPlane})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Annuler</Button>
          <Button onClick={handleUpdate} color="primary">Mettre à jour</Button>
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

export default Seats;