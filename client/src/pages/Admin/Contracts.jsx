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
  Chip,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Grid
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Contracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewDialog, setViewDialog] = useState({ open: false, contract: null });
  const [editDialog, setEditDialog] = useState({ open: false, contract: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    clientType: '',
    client_id: '',
    label: '',
    contractStartDate: '',
    contractEndDate: '',
    guaranteedMinimum: '',
    travelStartDate: '',
    travelEndDate: '',
    isActive: true,
    modifiedFeeAmount: '',
    payLater: false,
    payLaterTimeLimit: '',
    minTimeBeforeBalanceFlight: '',
    invoiceStamp: '',
    finalClientAdditionalFees: '',
    fixedTicketPrice: '',
    coupons: []
  });

  useEffect(() => {
    fetchContracts();
    fetchClients();
    fetchCoupons();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/contracts');
      setContracts(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des contrats', 'error');
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setClients(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des clients', 'error');
    }
  };

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

  const handleViewOpen = (contract) => {
    setViewDialog({ open: true, contract });
  };

  const handleViewClose = () => {
    setViewDialog({ open: false, contract: null });
  };

  const handleEditOpen = (contract) => {
    setEditDialog({ open: true, contract });

    // Extract coupon IDs from the contract's coupons array
    const couponIds = contract.coupons ? contract.coupons.map(coupon => coupon.id) : [];

    setFormData({
      clientType: contract.clientType,
      client_id: contract.client.id,
      label: contract.label,
      contractStartDate: formatDateForInput(contract.contractStartDate),
      contractEndDate: formatDateForInput(contract.contractEndDate),
      guaranteedMinimum: contract.guaranteedMinimum,
      travelStartDate: formatDateForInput(contract.travelStartDate),
      travelEndDate: formatDateForInput(contract.travelEndDate),
      isActive: contract.isActive,
      modifiedFeeAmount: contract.modifiedFeeAmount || '',
      payLater: contract.payLater,
      payLaterTimeLimit: contract.payLaterTimeLimit || '',
      minTimeBeforeBalanceFlight: contract.minTimeBeforeBalanceFlight || '',
      invoiceStamp: contract.invoiceStamp || '',
      finalClientAdditionalFees: contract.finalClientAdditionalFees || '',
      fixedTicketPrice: contract.fixedTicketPrice || '',
      coupons: couponIds
    });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, contract: null });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/contracts/${editDialog.contract.id}`, formData);
      showSnackbar('Contrat mis à jour avec succès');
      handleEditClose();
      fetchContracts();
    } catch (error) {
      console.error('Error updating contract:', error);
      if (error.response?.data?.existingContract) {
        // Show more detailed error message with existing contract info
        const existingContract = error.response.data.existingContract;
        const clientName = clients.find(c => c.id === existingContract.client.id)?.nom || 'Client';
        const endDate = new Date(existingContract.contractEndDate).toLocaleDateString('fr-FR');

        showSnackbar(
          `Ce client a déjà un contrat actif (${existingContract.label}) qui se termine le ${endDate}. Veuillez désactiver ce contrat avant d'en activer un autre.`,
          'error'
        );
      } else {
        showSnackbar(error.response?.data?.message || 'Erreur lors de la mise à jour du contrat', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat?')) {
      try {
        await axios.delete(`http://localhost:5000/api/contracts/${id}`);
        showSnackbar('Contrat supprimé avec succès');
        fetchContracts();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression du contrat', 'error');
      }
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Client type options
  const clientTypeOptions = [
    { value: 'b2b', label: 'B2B Client' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'agence', label: 'Agence' },
    { value: 'tour_operator', label: 'Tour Operator' },
    { value: 'other', label: 'Autre' }
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Contrats B2B
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('add')}
        sx={{ mb: 3 }}
      >
        Ajouter un Contrat B2B
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Libellé</TableCell>
              <TableCell>Période du Contrat</TableCell>
              <TableCell>Minimum Garanti</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>{contract.client?.nom || 'N/A'}</TableCell>
                  <TableCell>
                    {clientTypeOptions.find(type => type.value === contract.clientType)?.label || contract.clientType}
                  </TableCell>
                  <TableCell>{contract.label}</TableCell>
                  <TableCell>
                    {formatDate(contract.contractStartDate)} - {formatDate(contract.contractEndDate)}
                  </TableCell>
                  <TableCell>{contract.guaranteedMinimum} €</TableCell>
                  <TableCell>
                    <Chip
                      label={contract.isActive ? 'Actif' : 'Inactif'}
                      color={contract.isActive ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleViewOpen(contract)} color="info">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditOpen(contract)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(contract.id)} color="error">
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
        count={contracts.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
      />

      {/* View Contract Dialog */}
      <Dialog open={viewDialog.open} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>Détails du Contrat B2B</DialogTitle>
        <DialogContent dividers>
          {viewDialog.contract && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Client:</Typography>
                <Typography>{viewDialog.contract.client?.nom || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Type de Client:</Typography>
                <Typography>
                  {clientTypeOptions.find(type => type.value === viewDialog.contract.clientType)?.label || viewDialog.contract.clientType}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Libellé:</Typography>
                <Typography>{viewDialog.contract.label}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Date Début du Contrat:</Typography>
                <Typography>{formatDate(viewDialog.contract.contractStartDate)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Date Fin du Contrat:</Typography>
                <Typography>{formatDate(viewDialog.contract.contractEndDate)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Minimum Garanti:</Typography>
                <Typography>{viewDialog.contract.guaranteedMinimum} €</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Prix Fixe des Billets:</Typography>
                <Typography>{viewDialog.contract.fixedTicketPrice ? `${viewDialog.contract.fixedTicketPrice} €` : 'Non défini'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">Statut:</Typography>
                <Chip
                  label={viewDialog.contract.isActive ? 'Actif' : 'Inactif'}
                  color={viewDialog.contract.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">Codes Promo Associés:</Typography>
                {viewDialog.contract.coupons && viewDialog.contract.coupons.length > 0 ? (
                  <List dense>
                    {viewDialog.contract.coupons.map(coupon => (
                      <ListItem key={coupon.id}>
                        <ListItemText
                          primary={`${coupon.code} - ${coupon.reduction_type === 'percentage' ? `${coupon.reduction}%` : `${coupon.reduction}€`}`}
                          secondary={`Expire le: ${formatDate(coupon.date_fin)}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>Aucun code promo associé</Typography>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Contract Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Modifier le Contrat B2B</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <TextField
                name="clientType"
                label="Type de Client"
                value={formData.clientType}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />

              <TextField
                name="client_id"
                label="Client"
                select
                value={formData.client_id}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.nom}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                name="label"
                label="Libellé"
                value={formData.label}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />

              <TextField
                name="contractStartDate"
                label="Date Début du Contrat"
                type="date"
                value={formData.contractStartDate}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                name="contractEndDate"
                label="Date Fin du Contrat"
                type="date"
                value={formData.contractEndDate}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                name="guaranteedMinimum"
                label="Minimum Garanti (€)"
                type="number"
                value={formData.guaranteedMinimum}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                inputProps={{ step: "0.01" }}
              />

              <TextField
                name="travelStartDate"
                label="Date Début de Voyage"
                type="date"
                value={formData.travelStartDate}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                name="travelEndDate"
                label="Date Fin de Voyage"
                type="date"
                value={formData.travelEndDate}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={handleChange}
                    name="isActive"
                    color="primary"
                  />
                }
                label="Actif"
                sx={{ mt: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enableInternetFees}
                    onChange={handleChange}
                    name="enableInternetFees"
                    color="primary"
                  />
                }
                label="Activer les Frais Internet"
                sx={{ mt: 1 }}
              />

              <TextField
                name="modifiedFeeAmount"
                label="Montant des Frais Modifié (€)"
                type="number"
                value={formData.modifiedFeeAmount}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.01" }}
              />

              <TextField
                name="toxlFee"
                label="TOXL (€)"
                type="number"
                value={formData.toxlFee}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.01" }}
              />

              <TextField
                name="twoHourConstraint"
                label="Contrainte 2H"
                type="number"
                value={formData.twoHourConstraint}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.payLater}
                    onChange={handleChange}
                    name="payLater"
                    color="primary"
                  />
                }
                label="Payer Plus Tard"
                sx={{ mt: 1 }}
              />

              <TextField
                name="payLaterTimeLimit"
                label="Limite de Temps pour Payer Plus Tard (heures)"
                type="number"
                value={formData.payLaterTimeLimit}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />

              <TextField
                name="minTimeBeforeCCFlight"
                label="Temps Minimum Avant Vol CC (heures)"
                type="number"
                value={formData.minTimeBeforeCCFlight}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />

              <TextField
                name="minTimeBeforeBalanceFlight"
                label="Temps Minimum Avant Vol Balance (heures)"
                type="number"
                value={formData.minTimeBeforeBalanceFlight}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />

              <TextField
                name="invoiceStamp"
                label="Timbre de Facture (€)"
                type="number"
                value={formData.invoiceStamp}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.01" }}
              />

              <TextField
                name="finalClientAdditionalFees"
                label="Frais Supplémentaires Client Final (€)"
                type="number"
                value={formData.finalClientAdditionalFees}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.01" }}
              />

              <TextField
                name="discount"
                label="Remise (€)"
                type="number"
                value={formData.discount}
                onChange={handleChange}
                fullWidth
                margin="normal"
                inputProps={{ step: "0.01" }}
              />
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Annuler</Button>
            <Button type="submit" variant="contained" color="primary">
              Enregistrer
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Contracts;