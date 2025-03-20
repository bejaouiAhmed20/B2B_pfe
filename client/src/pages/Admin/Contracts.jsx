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
  FormControlLabel
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Contracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [clients, setClients] = useState([]);
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
    enableInternetFees: false,
    modifiedFeeAmount: '',
    toxlFee: '',
    twoHourConstraint: '',
    payLater: false,
    payLaterTimeLimit: '',
    minTimeBeforeCCFlight: '',
    minTimeBeforeBalanceFlight: '',
    invoiceStamp: '',
    finalClientAdditionalFees: '',
    discount: ''
  });

  useEffect(() => {
    fetchContracts();
    fetchClients();
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
      enableInternetFees: contract.enableInternetFees,
      modifiedFeeAmount: contract.modifiedFeeAmount || '',
      toxlFee: contract.toxlFee || '',
      twoHourConstraint: contract.twoHourConstraint || '',
      payLater: contract.payLater,
      payLaterTimeLimit: contract.payLaterTimeLimit || '',
      minTimeBeforeCCFlight: contract.minTimeBeforeCCFlight || '',
      minTimeBeforeBalanceFlight: contract.minTimeBeforeBalanceFlight || '',
      invoiceStamp: contract.invoiceStamp || '',
      finalClientAdditionalFees: contract.finalClientAdditionalFees || '',
      discount: contract.discount || ''
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
      showSnackbar('Erreur lors de la mise à jour du contrat', 'error');
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

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Contrats
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => navigate('/admin/add-contract')}
        sx={{ mb: 3 }}
      >
        Ajouter un Contrat
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type de Client</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Libellé</TableCell>
              <TableCell>Date Début</TableCell>
              <TableCell>Date Fin</TableCell>
              <TableCell>Minimum Garanti</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contracts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Aucun contrat trouvé</TableCell>
              </TableRow>
            ) : (
              contracts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.clientType}</TableCell>
                    <TableCell>{contract.client?.nom || 'N/A'}</TableCell>
                    <TableCell>{contract.label}</TableCell>
                    <TableCell>{formatDate(contract.contractStartDate)}</TableCell>
                    <TableCell>{formatDate(contract.contractEndDate)}</TableCell>
                    <TableCell>{contract.guaranteedMinimum} €</TableCell>
                    <TableCell>
                      <Chip 
                        label={contract.isActive ? 'Actif' : 'Inactif'} 
                        color={contract.isActive ? 'success' : 'default'} 
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton color="info" onClick={() => handleViewOpen(contract)}>
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton color="primary" onClick={() => handleEditOpen(contract)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(contract.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={contracts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* View Contract Dialog */}
      <Dialog open={viewDialog.open} onClose={handleViewClose} maxWidth="md" fullWidth>
        <DialogTitle>Détails du Contrat</DialogTitle>
        <DialogContent>
          {viewDialog.contract && (
            <div>
              <Typography variant="h6" gutterBottom>Informations Générales</Typography>
              <Typography><strong>Type de Client:</strong> {viewDialog.contract.clientType}</Typography>
              <Typography><strong>Client:</strong> {viewDialog.contract.client?.nom}</Typography>
              <Typography><strong>Libellé:</strong> {viewDialog.contract.label}</Typography>
              <Typography><strong>Période du Contrat:</strong> {formatDate(viewDialog.contract.contractStartDate)} - {formatDate(viewDialog.contract.contractEndDate)}</Typography>
              <Typography><strong>Période de Voyage:</strong> {formatDate(viewDialog.contract.travelStartDate)} - {formatDate(viewDialog.contract.travelEndDate)}</Typography>
              <Typography><strong>Minimum Garanti:</strong> {viewDialog.contract.guaranteedMinimum} €</Typography>
              <Typography><strong>Statut:</strong> {viewDialog.contract.isActive ? 'Actif' : 'Inactif'}</Typography>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Paramètres de Paiement</Typography>
              <Typography><strong>Frais Internet:</strong> {viewDialog.contract.enableInternetFees ? 'Activés' : 'Désactivés'}</Typography>
              {viewDialog.contract.modifiedFeeAmount && (
                <Typography><strong>Montant des Frais Modifié:</strong> {viewDialog.contract.modifiedFeeAmount} €</Typography>
              )}
              {viewDialog.contract.toxlFee && (
                <Typography><strong>TOXL:</strong> {viewDialog.contract.toxlFee} €</Typography>
              )}
              {viewDialog.contract.twoHourConstraint && (
                <Typography><strong>Contrainte 2H:</strong> {viewDialog.contract.twoHourConstraint}</Typography>
              )}
              <Typography><strong>Payer Plus Tard:</strong> {viewDialog.contract.payLater ? 'Activé' : 'Désactivé'}</Typography>
              {viewDialog.contract.payLaterTimeLimit && (
                <Typography><strong>Limite de Temps pour Payer Plus Tard:</strong> {viewDialog.contract.payLaterTimeLimit} heures</Typography>
              )}
              {viewDialog.contract.minTimeBeforeCCFlight && (
                <Typography><strong>Temps Minimum Avant Vol CC:</strong> {viewDialog.contract.minTimeBeforeCCFlight} heures</Typography>
              )}
              {viewDialog.contract.minTimeBeforeBalanceFlight && (
                <Typography><strong>Temps Minimum Avant Vol Balance:</strong> {viewDialog.contract.minTimeBeforeBalanceFlight} heures</Typography>
              )}
              {viewDialog.contract.invoiceStamp && (
                <Typography><strong>Timbre de Facture:</strong> {viewDialog.contract.invoiceStamp} €</Typography>
              )}
              {viewDialog.contract.finalClientAdditionalFees && (
                <Typography><strong>Frais Supplémentaires Client Final:</strong> {viewDialog.contract.finalClientAdditionalFees} €</Typography>
              )}
              {viewDialog.contract.discount && (
                <Typography><strong>Remise:</strong> {viewDialog.contract.discount} €</Typography>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Contract Dialog */}
      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Modifier le Contrat</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
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
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Annuler</Button>
          <Button onClick={handleSubmit} color="primary">Enregistrer</Button>
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

export default Contracts;