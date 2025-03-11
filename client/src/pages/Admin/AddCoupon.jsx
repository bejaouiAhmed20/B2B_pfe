import React, { useState } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCoupon = () => {
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    code: '',
    reduction: '',
    reduction_type: 'percentage',
    date_fin: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('http://localhost:5000/api/coupons', formData);
      
      setSnackbar({ open: true, message: 'Coupon ajouté avec succès', severity: 'success' });
      setTimeout(() => navigate('/admin/coupons'), 2000);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Une erreur est survenue', 
        severity: 'error' 
      });
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Ajouter un Coupon
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          name="code"
          label="Code"
          value={formData.code}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          helperText="Code unique pour le coupon"
        />
        
        <TextField
          name="reduction"
          label="Réduction"
          value={formData.reduction}
          onChange={handleChange}
          fullWidth
          required
          margin="normal"
          type="number"
          inputProps={{ 
            min: 0, 
            step: formData.reduction_type === 'percentage' ? 1 : 0.01 
          }}
          helperText={formData.reduction_type === 'percentage' ? 'Valeur en pourcentage (%)' : 'Montant fixe'}
        />
        
        <TextField
          name="reduction_type"
          label="Type de réduction"
          value={formData.reduction_type}
          onChange={handleChange}
          select
          fullWidth
          required
          margin="normal"
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
          margin="normal"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        
        <div style={{ marginTop: 24, display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/admin/coupons')}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            style={{ backgroundColor: '#CC0A2B' }}
          >
            Ajouter
          </Button>
        </div>
      </form>

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

export default AddCoupon;