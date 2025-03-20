import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert,
  Grid,
  FormControlLabel,
  Switch
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddContract = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
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
      await axios.post('http://localhost:5000/api/contracts', formData);
      showSnackbar('Contrat créé avec succès');
      setTimeout(() => navigate('/admin/contracts'), 2000);
    } catch (error) {
      console.error('Error creating contract:', error);
      showSnackbar(error.response?.data?.message || 'Erreur lors de la création du contrat', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Ajouter un Contrat
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Type de Client
            </Typography>
            <TextField
              name="clientType"
              select
              value={formData.clientType}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            >
              {clientTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Client
            </Typography>
            <TextField
              name="client_id"
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
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Libellé
            </Typography>
            <TextField
              name="label"
              value={formData.label}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Date Début du Contrat
            </Typography>
            <TextField
              name="contractStartDate"
              type="date"
              value={formData.contractStartDate}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Date Fin du Contrat
            </Typography>
            <TextField
              name="contractEndDate"
              type="date"
              value={formData.contractEndDate}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Minimum Garanti (€)
            </Typography>
            <TextField
              name="guaranteedMinimum"
              type="number"
              value={formData.guaranteedMinimum}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              inputProps={{ step: "0.01" }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Date Début de Voyage
            </Typography>
            <TextField
              name="travelStartDate"
              type="date"
              value={formData.travelStartDate}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Date Fin de Voyage
            </Typography>
            <TextField
              name="travelEndDate"
              type="date"
              value={formData.travelEndDate}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
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
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Paramètres de Paiement
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
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
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Montant des Frais Modifié (€)
            </Typography>
            <TextField
              name="modifiedFeeAmount"
              type="number"
              value={formData.modifiedFeeAmount}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ step: "0.01" }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              TOXL (€)
            </Typography>
            <TextField
              name="toxlFee"
              type="number"
              value={formData.toxlFee}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ step: "0.01" }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Contrainte 2H
            </Typography>
            <TextField
              name="twoHourConstraint"
              type="number"
              value={formData.twoHourConstraint}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
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
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Limite de Temps pour Payer Plus Tard (heures)
            </Typography>
            <TextField
              name="payLaterTimeLimit"
              type="number"
              value={formData.payLaterTimeLimit}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Temps Minimum Avant Vol CC (heures)
            </Typography>
            <TextField
              name="minTimeBeforeCCFlight"
              type="number"
              value={formData.minTimeBeforeCCFlight}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Temps Minimum Avant Vol Balance (heures)
            </Typography>
            <TextField
              name="minTimeBeforeBalanceFlight"
              type="number"
              value={formData.minTimeBeforeBalanceFlight}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Timbre de Facture (€)
            </Typography>
            <TextField
              name="invoiceStamp"
              type="number"
              value={formData.invoiceStamp}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ step: "0.01" }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Frais Supplémentaires Client Final (€)
            </Typography>
            <TextField
              name="finalClientAdditionalFees"
              type="number"
              value={formData.finalClientAdditionalFees}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ step: "0.01" }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Remise (€)
            </Typography>
            <TextField
              name="discount"
              type="number"
              value={formData.discount}
              onChange={handleChange}
              fullWidth
              margin="normal"
              inputProps={{ step: "0.01" }}
            />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={() => navigate('/admin/contracts')}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
            >
              Créer le Contrat
            </Button>
          </Grid>
        </Grid>
      </form>
      
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddContract;