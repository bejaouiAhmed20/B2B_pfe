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

const Coupons = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, coupon: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    code: '',
    reduction: '',
    reduction_type: 'percentage',
    date_fin: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/coupons');
      setCoupons(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des coupons', 'error');
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditOpen = (coupon) => {
    setEditDialog({ open: true, coupon });
    setFormData({
      code: coupon.code,
      reduction: coupon.reduction,
      reduction_type: coupon.reduction_type,
      date_fin: formatDateForInput(coupon.date_fin)
    });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, coupon: null });
    setFormData({
      code: '',
      reduction: '',
      reduction_type: 'percentage',
      date_fin: ''
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
      await axios.put(
        `http://localhost:5000/api/coupons/${editDialog.coupon.id}`, 
        formData
      );
      showSnackbar('Coupon modifié avec succès');
      handleEditClose();
      fetchCoupons();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce coupon ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/coupons/${id}`);
        showSnackbar('Coupon supprimé avec succès');
        fetchCoupons();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Coupons
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/coupons/add')}
          style={{ backgroundColor: '#CC0A2B' }}
        >
          Ajouter un Coupon
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Réduction</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date d'expiration</TableCell>
              <TableCell>Date de création</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>{coupon.code}</TableCell>
                  <TableCell>{coupon.reduction}</TableCell>
                  <TableCell>
                    {coupon.reduction_type === 'percentage' ? 'Pourcentage (%)' : 'Montant fixe'}
                  </TableCell>
                  <TableCell>{formatDate(coupon.date_fin)}</TableCell>
                  <TableCell>{formatDate(coupon.date_creation)}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditOpen(coupon)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(coupon.id)} color="error">
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
        count={coupons.length}
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
        <DialogTitle>Modifier le Coupon</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
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
              name="reduction"
              label="Réduction"
              value={formData.reduction}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              type="number"
              inputProps={{ min: 0, step: formData.reduction_type === 'percentage' ? 1 : 0.01 }}
            />
            <TextField
              name="reduction_type"
              label="Type de réduction"
              value={formData.reduction_type}
              onChange={handleChange}
              select
              fullWidth
              required
              margin="dense"
            >
              <MenuItem value="percentage">Pourcentage (%)</MenuItem>
              <MenuItem value="fixed">Montant fixe</MenuItem>
            </TextField>
            <TextField
              name="date_fin"
              label="Date d'expiration"
              value={formData.date_fin}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              type="date"
              InputLabelProps={{ shrink: true }}
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

export default Coupons;