import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility,
  Reply,
  Delete,
  CheckCircle,
  HourglassEmpty,
  Cancel
} from '@mui/icons-material';
import axios from 'axios';

const Reclamations = () => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [replyDialog, setReplyDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [replyForm, setReplyForm] = useState({
    reponse: '',
    statut: 'Traitée'
  });

  useEffect(() => {
    fetchReclamations();
  }, []);

  const fetchReclamations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('http://localhost:5000/api/reclamations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReclamations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reclamations:', error);
      setError('Impossible de charger les réclamations');
      setLoading(false);
    }
  };

  const handleReplyChange = (e) => {
    setReplyForm({
      ...replyForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitReply = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Use the selected status from the dropdown instead of hardcoding to 'Traitée'
      await axios.put(`http://localhost:5000/api/reclamations/${selectedReclamation.id}`, {
        reponse: replyForm.reponse,
        statut: replyForm.statut // Use the selected status from the dropdown
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      // Update local state with the selected status
      setReclamations(reclamations.map(rec => 
        rec.id === selectedReclamation.id 
          ? { 
              ...rec, 
              reponse: replyForm.reponse, 
              statut: replyForm.statut, // Use the selected status
              date_reponse: new Date() 
            } 
          : rec
      ));
  
      setReplyDialog(false);
      setReplyForm({ reponse: '', statut: 'Traitée' }); // Reset form with default status
    } catch (error) {
      console.error('Error submitting reply:', error);
      setError('Impossible de soumettre la réponse');
    }
  };

  const handleDeleteReclamation = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/reclamations/${selectedReclamation.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state
      setReclamations(reclamations.filter(rec => rec.id !== selectedReclamation.id));
      setDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting reclamation:', error);
      setError('Impossible de supprimer la réclamation');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Traitée':
        return 'success';
      case 'En cours':
        return 'info';
      case 'En attente':
        return 'warning';
      case 'Rejetée':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Traitée':
        return <CheckCircle />;
      case 'En cours':
        return <HourglassEmpty />;
      case 'En attente':
        return <HourglassEmpty />;
      case 'Rejetée':
        return <Cancel />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des Réclamations
      </Typography>
      
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Sujet</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reclamations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Aucune réclamation trouvée
                </TableCell>
              </TableRow>
            ) : (
              reclamations.map((reclamation) => (
                <TableRow key={reclamation.id}>
                  <TableCell>
                    {reclamation.user?.prenom} {reclamation.user?.nom}
                  </TableCell>
                  <TableCell>{reclamation.sujet}</TableCell>
                  <TableCell>{formatDate(reclamation.date_creation)}</TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(reclamation.statut)}
                      label={reclamation.statut} 
                      color={getStatusColor(reclamation.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Voir détails">
                        <IconButton 
                          color="primary"
                          onClick={() => {
                            setSelectedReclamation(reclamation);
                            setViewDialog(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Répondre">
                        <IconButton 
                          color="success"
                          onClick={() => {
                            setSelectedReclamation(reclamation);
                            setReplyForm({
                              reponse: reclamation.reponse || '',
                              statut: reclamation.statut
                            });
                            setReplyDialog(true);
                          }}
                        >
                          <Reply />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Supprimer">
                        <IconButton 
                          color="error"
                          onClick={() => {
                            setSelectedReclamation(reclamation);
                            setDeleteDialog(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View Dialog */}
      <Dialog open={viewDialog} onClose={() => setViewDialog(false)} maxWidth="md" fullWidth>
        {selectedReclamation && (
          <>
            <DialogTitle>
              Détails de la réclamation
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Client
                </Typography>
                <Typography variant="body1">
                  {selectedReclamation.user?.prenom} {selectedReclamation.user?.nom}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedReclamation.user?.email}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sujet
                </Typography>
                <Typography variant="body1">
                  {selectedReclamation.sujet}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date de soumission
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedReclamation.date_creation)}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Statut
                </Typography>
                <Chip 
                  icon={getStatusIcon(selectedReclamation.statut)}
                  label={selectedReclamation.statut} 
                  color={getStatusColor(selectedReclamation.statut)}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Typography variant="body1">
                    {selectedReclamation.description}
                  </Typography>
                </Paper>
              </Box>
              
              {selectedReclamation.reponse && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Réponse ({formatDate(selectedReclamation.date_reponse)})
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#f8f9fa' }}>
                    <Typography variant="body1">
                      {selectedReclamation.reponse}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialog(false)}>
                Fermer
              </Button>
              <Button 
                variant="contained" 
                startIcon={<Reply />}
                onClick={() => {
                  setViewDialog(false);
                  setReplyForm({
                    reponse: selectedReclamation.reponse || '',
                    statut: selectedReclamation.statut
                  });
                  setReplyDialog(true);
                }}
              >
                Répondre
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="md" fullWidth>
        {selectedReclamation && (
          <>
            <DialogTitle>
              Répondre à la réclamation
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Sujet
                </Typography>
                <Typography variant="body1">
                  {selectedReclamation.sujet}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Description
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                  <Typography variant="body1">
                    {selectedReclamation.description}
                  </Typography>
                </Paper>
              </Box>
              
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Statut</InputLabel>
                <Select
                  name="statut"
                  value={replyForm.statut}
                  onChange={handleReplyChange}
                  label="Statut"
                >
                  <MenuItem value="En attente">En attente</MenuItem>
                  <MenuItem value="En cours">En cours</MenuItem>
                  <MenuItem value="Traitée">Traitée</MenuItem>
                  <MenuItem value="Rejetée">Rejetée</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Réponse"
                name="reponse"
                value={replyForm.reponse}
                onChange={handleReplyChange}
                multiline
                rows={6}
                required
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReplyDialog(false)}>
                Annuler
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSubmitReply}
                disabled={!replyForm.reponse}
              >
                Envoyer la réponse
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        {selectedReclamation && (
          <>
            <DialogTitle>
              Confirmer la suppression
            </DialogTitle>
            <DialogContent>
              <Typography>
                Êtes-vous sûr de vouloir supprimer cette réclamation ? Cette action est irréversible.
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>
                Annuler
              </Button>
              <Button 
                variant="contained" 
                color="error"
                onClick={handleDeleteReclamation}
              >
                Supprimer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Reclamations;