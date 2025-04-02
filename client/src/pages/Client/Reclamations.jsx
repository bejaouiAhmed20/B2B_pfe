import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { Add, Send, CheckCircle, HourglassEmpty, Cancel } from '@mui/icons-material';
import axios from 'axios';

const ClientReclamations = () => {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newReclamationDialog, setNewReclamationDialog] = useState(false);
  const [discussionDialog, setDiscussionDialog] = useState(false);
  const [selectedReclamation, setSelectedReclamation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [newReclamation, setNewReclamation] = useState({
    sujet: '',
    description: ''
  });

  useEffect(() => {
    fetchUserReclamations();
  }, []);

  const fetchUserReclamations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.get(`http://localhost:5000/api/reclamations/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setReclamations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reclamations:', error);
      setError('Impossible de charger vos réclamations');
      setLoading(false);
    }
  };

  const fetchReclamationDetails = async (reclamationId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:5000/api/reclamations/${reclamationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSelectedReclamation(response.data);
    } catch (error) {
      console.error('Error fetching reclamation details:', error);
      setError('Impossible de charger les détails de la réclamation');
    }
  };

  const handleNewReclamationChange = (e) => {
    setNewReclamation({
      ...newReclamation,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitNewReclamation = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await axios.post('http://localhost:5000/api/reclamations', {
        sujet: newReclamation.sujet,
        description: newReclamation.description,
        user_id: user.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add new reclamation to state
      setReclamations([response.data, ...reclamations]);
      
      // Reset form and close dialog
      setNewReclamation({ sujet: '', description: '' });
      setNewReclamationDialog(false);
    } catch (error) {
      console.error('Error creating reclamation:', error);
      setError('Impossible de créer la réclamation');
    }
  };

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      await axios.post(`http://localhost:5000/api/reclamations/${selectedReclamation.id}/messages`, {
        content: messageText,
        sender_id: user.id,
        sender_type: 'client'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear message input
      setMessageText('');
      
      // Refresh reclamation details
      fetchReclamationDetails(selectedReclamation.id);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Impossible d\'envoyer le message');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Mes Réclamations
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setNewReclamationDialog(true)}
        >
          Nouvelle Réclamation
        </Button>
      </Box>

      {reclamations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Vous n'avez pas encore de réclamations
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setNewReclamationDialog(true)}
            sx={{ mt: 2 }}
          >
            Créer une réclamation
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reclamations.map((reclamation) => (
            <Grid item xs={12} md={6} key={reclamation.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2">
                      {reclamation.sujet}
                    </Typography>
                    <Chip 
                      icon={getStatusIcon(reclamation.statut)}
                      label={reclamation.statut} 
                      color={getStatusColor(reclamation.statut)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Créée le {formatDate(reclamation.date_creation)}
                  </Typography>
                  
                  <Typography variant="body1" sx={{ 
                    mt: 2, 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {reclamation.description}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => {
                      fetchReclamationDetails(reclamation.id);
                      setDiscussionDialog(true);
                    }}
                  >
                    Voir la discussion
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* New Reclamation Dialog */}
      <Dialog 
        open={newReclamationDialog} 
        onClose={() => setNewReclamationDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Nouvelle Réclamation
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Sujet"
            name="sujet"
            value={newReclamation.sujet}
            onChange={handleNewReclamationChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={newReclamation.description}
            onChange={handleNewReclamationChange}
            multiline
            rows={6}
            margin="normal"
            required
            helperText="Veuillez décrire votre problème en détail"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewReclamationDialog(false)}>
            Annuler
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitNewReclamation}
            disabled={!newReclamation.sujet || !newReclamation.description}
          >
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>

      {/* Discussion Dialog */}
      <Dialog 
        open={discussionDialog} 
        onClose={() => setDiscussionDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        {selectedReclamation && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {selectedReclamation.sujet}
                </Typography>
                <Chip 
                  label={selectedReclamation.statut} 
                  color={getStatusColor(selectedReclamation.statut)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Créée le {formatDate(selectedReclamation.date_creation)}
              </Typography>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  bgcolor: '#f5f5f5',
                  maxHeight: '400px',
                  overflow: 'auto'
                }}
              >
                {/* Initial reclamation */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Votre réclamation
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: '#fff' }}>
                    <Typography variant="body1">
                      {selectedReclamation.description}
                    </Typography>
                  </Paper>
                </Box>
                
                {/* Messages in the discussion */}
                {selectedReclamation.messages && selectedReclamation.messages.map((message, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      mb: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: message.sender_type === 'client' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {message.sender_type === 'client' ? 'Vous' : 'Support'} - {formatDate(message.created_at)}
                    </Typography>
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2, 
                        mt: 0.5, 
                        maxWidth: '80%',
                        bgcolor: message.sender_type === 'client' ? '#e3f2fd' : '#fff',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body1">
                        {message.content}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Paper>
              
              {/* Message input - only show if not rejected */}
              {selectedReclamation.statut !== 'Rejetée' && (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Votre message"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    multiline
                    rows={2}
                    variant="outlined"
                  />
                  <Button 
                    variant="contained" 
                    color="primary"
                    disabled={!messageText.trim()}
                    onClick={handleSendMessage}
                    sx={{ alignSelf: 'flex-end' }}
                    endIcon={<Send />}
                  >
                    Envoyer
                  </Button>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDiscussionDialog(false)}>
                Fermer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ClientReclamations;