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
  Alert,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  HourglassEmpty
} from '@mui/icons-material';
import api from '../../services/api';

const RequestSoldeManagement = () => {
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // Added missing error state
  const [viewDialog, setViewDialog] = useState({ open: false, request: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', request: null });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setError('Authentication required');
        setSnackbar({
          open: true,
          message: 'Authentication required',
          severity: 'error'
        });
        setLoading(false);
        return;
      }

      console.log('Fetching requests with token:', token.substring(0, 20) + '...');

      // Utiliser le service API qui gère automatiquement les headers d'authentification
      const response = await api.get('/request-solde');

      setRequests(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      // More detailed error logging
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }

      setError('Erreur lors du chargement des demandes');
      setSnackbar({
        open: true,
        message: 'Erreur lors du chargement des demandes: ' + (error.response?.data?.message || error.message),
        severity: 'error'
      });
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleViewRequest = (request) => {
    setViewDialog({ open: true, request });
  };

  const handleCloseViewDialog = () => {
    setViewDialog({ open: false, request: null });
  };

  const handleConfirmDialogOpen = (type, request) => {
    setConfirmDialog({ open: true, type, request });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({ open: false, type: '', request: null });
  };

  const handleApproveRequest = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const request = confirmDialog.request;

      if (!token) {
        showSnackbar('Authentification requise', 'error');
        return;
      }

      const response = await api.put(`/request-solde/${request.id}/approve`, {});

      showSnackbar(`Demande approuvée avec succès. ${parseFloat(request.montant).toFixed(2)} € ajoutés au compte client.`);
      handleConfirmDialogClose();
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'approbation de la demande';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleRejectRequest = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const request = confirmDialog.request;

      if (!token) {
        showSnackbar('Authentification requise', 'error');
        return;
      }

      const response = await api.put(`/request-solde/${request.id}/reject`, {});

      showSnackbar('Demande rejetée avec succès');
      handleConfirmDialogClose();
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du rejet de la demande';
      showSnackbar(errorMessage, 'error');
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<HourglassEmpty />} label="En attente" color="warning" />;
      case 'approved':
        return <Chip icon={<CheckCircle />} label="Approuvée" color="success" />;
      case 'rejected':
        return <Chip icon={<Cancel />} label="Rejetée" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gestion des Demandes de Solde
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Montant</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Chargement...</TableCell>
              </TableRow>
            ) : requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Aucune demande trouvée</TableCell>
              </TableRow>
            ) : (
              requests
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.id}</TableCell>
                    <TableCell>{request.client?.nom || 'Client inconnu'}</TableCell>
                    <TableCell>{parseFloat(request.montant).toFixed(2)} €</TableCell>
                    <TableCell>{formatDate(request.date)}</TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleViewRequest(request)}
                          size="small"
                        >
                          <Visibility />
                        </IconButton>

                        {request.status === 'pending' && (
                          <>
                            <IconButton
                              color="success"
                              onClick={() => handleConfirmDialogOpen('approve', request)}
                              size="small"
                            >
                              <CheckCircle />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleConfirmDialogOpen('reject', request)}
                              size="small"
                            >
                              <Cancel />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={requests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* View Request Dialog */}
      <Dialog open={viewDialog.open} onClose={handleCloseViewDialog} maxWidth="md">
        <DialogTitle>Détails de la Demande</DialogTitle>
        <DialogContent>
          {viewDialog.request && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Informations de la Demande</Typography>
                    <Typography><strong>ID:</strong> {viewDialog.request.id}</Typography>
                    <Typography><strong>Montant:</strong> {parseFloat(viewDialog.request.montant).toFixed(2)} €</Typography>
                    <Typography><strong>Date:</strong> {formatDate(viewDialog.request.date)}</Typography>
                    <Typography><strong>Statut:</strong> {getStatusChip(viewDialog.request.status)}</Typography>
                    <Typography sx={{ mt: 2 }}><strong>Description:</strong></Typography>
                    <Typography>{viewDialog.request.description}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Informations du Client</Typography>
                    <Typography><strong>Nom:</strong> {viewDialog.request.client?.nom || 'Non disponible'}</Typography>
                    <Typography><strong>Email:</strong> {viewDialog.request.client?.email || 'Non disponible'}</Typography>
                    <Typography><strong>Téléphone:</strong> {viewDialog.request.client?.numero_telephone || 'Non disponible'}</Typography>
                  </CardContent>
                </Card>

                {viewDialog.request.imageUrl && (
                  <Card sx={{ mt: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Justificatif</Typography>
                      <Box sx={{ textAlign: 'center', mt: 2 }}>
                        <img
                          src={`http://localhost:5000${viewDialog.request.imageUrl}`}
                          alt="Justificatif"
                          style={{ maxWidth: '100%', maxHeight: '300px' }}
                        />
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => window.open(`http://localhost:5000${viewDialog.request.imageUrl}`, '_blank')}
                      >
                        Voir en plein écran
                      </Button>
                    </CardActions>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {viewDialog.request && viewDialog.request.status === 'pending' && (
            <>
              <Button
                onClick={() => {
                  handleCloseViewDialog();
                  handleConfirmDialogOpen('approve', viewDialog.request);
                }}
                color="success"
              >
                Approuver
              </Button>
              <Button
                onClick={() => {
                  handleCloseViewDialog();
                  handleConfirmDialogOpen('reject', viewDialog.request);
                }}
                color="error"
              >
                Rejeter
              </Button>
            </>
          )}
          <Button onClick={handleCloseViewDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleConfirmDialogClose}>
        <DialogTitle>
          {confirmDialog.type === 'approve' ? 'Approuver la demande' : 'Rejeter la demande'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {confirmDialog.type === 'approve'
              ? `Êtes-vous sûr de vouloir approuver cette demande de ${confirmDialog.request?.montant} € ? Le montant sera ajouté au solde du client.`
              : 'Êtes-vous sûr de vouloir rejeter cette demande ?'
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogClose}>Annuler</Button>
          <Button
            onClick={confirmDialog.type === 'approve' ? handleApproveRequest : handleRejectRequest}
            color={confirmDialog.type === 'approve' ? 'success' : 'error'}
            variant="contained"
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default RequestSoldeManagement;