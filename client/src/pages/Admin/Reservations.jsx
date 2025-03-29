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
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Visibility as VisibilityIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Reservations = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [flights, setFlights] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editDialog, setEditDialog] = useState({ open: false, reservation: null });
  const [detailsDialog, setDetailsDialog] = useState({ open: false, reservation: null });
  const [invoiceDialog, setInvoiceDialog] = useState({ open: false, reservation: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    date_reservation: '',
    statut: '',
    prix_total: '',
    nombre_passagers: '',
    user_id: '',
    flight_id: ''
  });

  useEffect(() => {
    fetchReservations();
    fetchFlights();
    fetchUsers();
  }, []);

  // Existing fetch functions remain the same
  const fetchReservations = async () => {
    try {
      // Use query parameter to include relations
      const response = await axios.get('http://localhost:5000/api/reservations?relations=true');
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      showSnackbar('Erreur lors du chargement des réservations', 'error');
    }
  };

  // Modify the fetchFlights function to handle errors better
  const fetchFlights = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/flights');
      setFlights(response.data);
    } catch (error) {
      console.error('Error fetching flights:', error);
      showSnackbar('Erreur lors du chargement des vols', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
    } catch (error) {
      showSnackbar('Erreur lors du chargement des utilisateurs', 'error');
    }
  };

  // Existing handlers remain the same
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditOpen = (reservation) => {
    const formattedDate = new Date(reservation.date_reservation).toISOString().split('T')[0];
    
    setEditDialog({ open: true, reservation });
    setFormData({
      date_reservation: formattedDate,
      statut: reservation.statut,
      prix_total: reservation.prix_total,
      nombre_passagers: reservation.nombre_passagers,
      user_id: reservation.user?.id || '',
      flight_id: reservation.flight?.id || ''
    });
  };

  const handleDetailsOpen = (reservation) => {
    setDetailsDialog({ open: true, reservation });
  };

  // New handler for invoice dialog
  const handleInvoiceOpen = (reservation) => {
    setInvoiceDialog({ open: true, reservation });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, reservation: null });
    resetFormData();
  };

  const handleDetailsClose = () => {
    setDetailsDialog({ open: false, reservation: null });
  };

  // New handler for closing invoice dialog
  const handleInvoiceClose = () => {
    setInvoiceDialog({ open: false, reservation: null });
  };

  const resetFormData = () => {
    setFormData({
      date_reservation: '',
      statut: '',
      prix_total: '',
      nombre_passagers: '',
      user_id: '',
      flight_id: ''
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
      await axios.put(`http://localhost:5000/api/reservations/${editDialog.reservation.id}`, formData);
      showSnackbar('Réservation modifiée avec succès');
      handleEditClose();
      fetchReservations();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        await axios.delete(`http://localhost:5000/api/reservations/${id}`);
        showSnackbar('Réservation supprimée avec succès');
        fetchReservations();
      } catch (error) {
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmée':
        return '#4CAF50';
      case 'en attente':
        return '#FFC107';
      case 'annulée':
        return '#F44336';
      default:
        return 'inherit';
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.nom : 'Utilisateur inconnu';
  };

  const getFlightTitle = (flightId) => {
    const flight = flights.find(f => f.id === flightId);
    return flight ? flight.titre : 'Vol inconnu';
  };

  // New function to generate and download PDF invoice
  const generateInvoicePDF = (reservation) => {
    const doc = new jsPDF();
    const user = reservation.user || users.find(u => u.id === reservation.user_id) || {};
    const flight = reservation.flight || getFlightData(reservation.flight_id) || {};
    
    // Add company logo/header
    doc.setFontSize(20);
    doc.setTextColor(204, 10, 43); // #CC0A2B
    doc.text("B2B Airlines", 105, 20, { align: 'center' });
    
    // Add invoice title
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("FACTURE", 105, 30, { align: 'center' });
    
    // Add invoice number and date
    doc.setFontSize(10);
    doc.text(`Facture N°: INV-${reservation.id.substring(0, 8)}`, 20, 40);
    doc.text(`Date: ${formatDate(new Date())}`, 20, 45);
    
    // Add client information
    doc.setFontSize(12);
    doc.text("Informations Client", 20, 55);
    doc.setFontSize(10);
    doc.text(`Nom: ${user.nom || 'N/A'}`, 20, 62);
    doc.text(`Email: ${user.email || 'N/A'}`, 20, 67);
    doc.text(`Téléphone: ${user.numero_telephone || 'N/A'}`, 20, 72);
    
    // Add reservation details
    doc.setFontSize(12);
    doc.text("Détails de la Réservation", 20, 85);
    doc.setFontSize(10);
    doc.text(`ID Réservation: ${reservation.id}`, 20, 92);
    doc.text(`Date de réservation: ${formatDate(reservation.date_reservation)}`, 20, 97);
    doc.text(`Statut: ${reservation.statut}`, 20, 102);
    doc.text(`Nombre de passagers: ${reservation.nombre_passagers}`, 20, 107);
    
    // Add flight details
    doc.setFontSize(12);
    doc.text("Détails du Vol", 20, 120);
    doc.setFontSize(10);
    doc.text(`Vol: ${flight.titre || 'N/A'}`, 20, 127);
    doc.text(`Départ: ${flight.ville_depart || 'N/A'}`, 20, 132);
    doc.text(`Arrivée: ${flight.ville_arrivee || 'N/A'}`, 20, 137);
    doc.text(`Date de départ: ${flight.date_depart ? formatDate(flight.date_depart) : 'N/A'}`, 20, 142);
    doc.text(`Date de retour: ${flight.date_retour ? formatDate(flight.date_retour) : 'N/A'}`, 20, 147);
    doc.text(`Compagnie: ${flight.compagnie_aerienne || 'N/A'}`, 20, 152);
    
    // Add pricing table
    doc.setFontSize(12);
    doc.text("Détails du Prix", 20, 165);
    
    const tableColumn = ["Description", "Quantité", "Prix unitaire", "Total"];
    const tableRows = [
      ["Billet d'avion", reservation.nombre_passagers, 
       `${(reservation.prix_total / reservation.nombre_passagers).toFixed(2)} €`, 
       `${reservation.prix_total} €`]
    ];
    
    // Add discount if applicable
    if (reservation.discountAmount && reservation.discountAmount > 0) {
      tableRows.push([
        `Réduction (Coupon: ${reservation.coupon || 'N/A'})`, 
        "1", 
        `- ${reservation.discountAmount} €`, 
        `- ${reservation.discountAmount} €`
      ]);
    }
    
    // Add total row
    tableRows.push([
      "TOTAL", "", "", `${reservation.prix_total} €`
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 170,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [204, 10, 43] }
    });
    
    // Add footer
    const finalY = doc.lastAutoTable.finalY || 220;
    doc.setFontSize(10);
    doc.text("Merci pour votre confiance!", 105, finalY + 10, { align: 'center' });
    doc.text("Pour toute question concernant cette facture, veuillez nous contacter.", 105, finalY + 15, { align: 'center' });
    doc.text("B2B Airlines - contact@b2bairlines.com - +33 1 23 45 67 89", 105, finalY + 20, { align: 'center' });
    
    // Save the PDF
    doc.save(`Facture_${reservation.id.substring(0, 8)}.pdf`);
    showSnackbar('Facture téléchargée avec succès');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Réservations
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/admin/reservations/add')}
          style={{ backgroundColor: '#CC0A2B' }}
        >
          Ajouter une Réservation
        </Button>
      </div>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Vol</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Prix Total</TableCell>
              <TableCell>Passagers</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell>{reservation.id.substring(0, 8)}...</TableCell>
                  <TableCell>{formatDate(reservation.date_reservation)}</TableCell>
                  <TableCell>{reservation.user ? reservation.user.nom : getUserName(reservation.user_id)}</TableCell>
                  <TableCell>{reservation.flight ? reservation.flight.titre : getFlightTitle(reservation.flight_id)}</TableCell>
                  <TableCell>
                    <span style={{ 
                      color: getStatusColor(reservation.statut),
                      fontWeight: 'bold'
                    }}>
                      {reservation.statut}
                    </span>
                  </TableCell>
                  <TableCell>{reservation.prix_total} €</TableCell>
                  <TableCell>{reservation.nombre_passagers}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDetailsOpen(reservation)} color="info" title="Voir détails">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleInvoiceOpen(reservation)} color="success" title="Voir facture">
                      <ReceiptIcon />
                    </IconButton>
                    <IconButton onClick={() => handleEditOpen(reservation)} color="primary" title="Modifier">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(reservation.id)} color="error" title="Supprimer">
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
        count={reservations.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Lignes par page"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} sur ${count !== -1 ? count : `plus de ${to}`}`
        }
      />

      {/* Edit Dialog - Unchanged */}
      <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier la Réservation</DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <TextField
              name="date_reservation"
              label="Date de réservation"
              type="date"
              value={formData.date_reservation}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Statut</InputLabel>
              <Select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                required
              >
                <MenuItem value="Confirmée">Confirmée</MenuItem>
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="Annulée">Annulée</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              name="prix_total"
              label="Prix Total"
              type="number"
              value={formData.prix_total}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            
            <TextField
              name="nombre_passagers"
              label="Nombre de passagers"
              type="number"
              value={formData.nombre_passagers}
              onChange={handleChange}
              fullWidth
              required
              margin="dense"
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Client</InputLabel>
              <Select
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                required
              >
                {users.map(user => (
                  <MenuItem key={user.id} value={user.id}>{user.nom} ({user.email})</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="dense">
              <InputLabel>Vol</InputLabel>
              <Select
                name="flight_id"
                value={formData.flight_id}
                onChange={handleChange}
                required
              >
                {flights.map(flight => (
                  <MenuItem key={flight.id} value={flight.id}>
                    {flight.titre} ({flight.ville_depart} - {flight.ville_arrivee})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

      {/* Details Dialog - Unchanged */}
      <Dialog open={detailsDialog.open} onClose={handleDetailsClose} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la Réservation</DialogTitle>
        <DialogContent>
          {detailsDialog.reservation && (
            <div>
              <Typography variant="h6" gutterBottom>Informations de réservation</Typography>
              <Typography><strong>ID:</strong> {detailsDialog.reservation.id}</Typography>
              <Typography><strong>Date:</strong> {formatDate(detailsDialog.reservation.date_reservation)}</Typography>
              <Typography><strong>Statut:</strong> 
                <span style={{ 
                  color: getStatusColor(detailsDialog.reservation.statut),
                  fontWeight: 'bold',
                  marginLeft: '5px'
                }}>
                  {detailsDialog.reservation.statut}
                </span>
              </Typography>
              <Typography><strong>Prix Total:</strong> {detailsDialog.reservation.prix_total} €</Typography>
              <Typography><strong>Nombre de passagers:</strong> {detailsDialog.reservation.nombre_passagers}</Typography>
              
              <Typography variant="h6" style={{ marginTop: '20px' }} gutterBottom>Informations du client</Typography>
              {detailsDialog.reservation.user ? (
                <>
                  <Typography><strong>Nom:</strong> {detailsDialog.reservation.user.nom}</Typography>
                  <Typography><strong>Email:</strong> {detailsDialog.reservation.user.email}</Typography>
                  <Typography><strong>Téléphone:</strong> {detailsDialog.reservation.user.numero_telephone || '-'}</Typography>
                </>
              ) : (
                <Typography>Informations client non disponibles</Typography>
              )}
              
              <Typography variant="h6" style={{ marginTop: '20px' }} gutterBottom>Informations du vol</Typography>
              {detailsDialog.reservation.flight ? (
                <>
                  <Typography><strong>Titre:</strong> {detailsDialog.reservation.flight.titre}</Typography>
                  <Typography><strong>Départ:</strong> {detailsDialog.reservation.flight.ville_depart}</Typography>
                  <Typography><strong>Arrivée:</strong> {detailsDialog.reservation.flight.ville_arrivee}</Typography>
                  <Typography><strong>Date de départ:</strong> {formatDate(detailsDialog.reservation.flight.date_depart)}</Typography>
                  <Typography><strong>Date de retour:</strong> {formatDate(detailsDialog.reservation.flight.date_retour)}</Typography>
                  <Typography><strong>Compagnie:</strong> {detailsDialog.reservation.flight.compagnie_aerienne}</Typography>
                </>
              ) : (
                <Typography>Informations vol non disponibles</Typography>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDetailsClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* New Invoice Dialog */}
      <Dialog open={invoiceDialog.open} onClose={handleInvoiceClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Facture de Réservation</Typography>
            {invoiceDialog.reservation && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => generateInvoicePDF(invoiceDialog.reservation)}
                style={{ backgroundColor: '#4CAF50' }}
              >
                Télécharger PDF
              </Button>
            )}
          </div>
        </DialogTitle>
        <DialogContent>
          {invoiceDialog.reservation && (
            <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f9f9f9' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Typography variant="h4" style={{ color: '#CC0A2B' }}>B2B Airlines</Typography>
                <Typography variant="h5">FACTURE</Typography>
                <Typography variant="body2">Facture N°: INV-{invoiceDialog.reservation.id.substring(0, 8)}</Typography>
                <Typography variant="body2">Date: {formatDate(new Date())}</Typography>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                  <Typography variant="h6">Informations Client</Typography>
                  <Typography>
                    <strong>Nom:</strong> {invoiceDialog.reservation.user ? invoiceDialog.reservation.user.nom : getUserName(invoiceDialog.reservation.user_id)}
                  </Typography>
                  <Typography>
                    <strong>Email:</strong> {invoiceDialog.reservation.user ? invoiceDialog.reservation.user.email : 'N/A'}
                  </Typography>
                  <Typography>
                    <strong>Téléphone:</strong> {invoiceDialog.reservation.user ? (invoiceDialog.reservation.user.numero_telephone || '-') : '-'}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="h6">Détails de la Réservation</Typography>
                  <Typography><strong>ID Réservation:</strong> {invoiceDialog.reservation.id}</Typography>
                  <Typography><strong>Date de réservation:</strong> {formatDate(invoiceDialog.reservation.date_reservation)}</Typography>
                  <Typography>
                    <strong>Statut:</strong> 
                    <span style={{ color: getStatusColor(invoiceDialog.reservation.statut), marginLeft: '5px' }}>
                      {invoiceDialog.reservation.statut}
                    </span>
                  </Typography>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <Typography variant="h6">Détails du Vol</Typography>
                <Typography>
                  <strong>Vol:</strong> {
                    invoiceDialog.reservation.flight ? 
                    invoiceDialog.reservation.flight.titre : 
                    getFlightTitle(invoiceDialog.reservation.flight_id)
                  }
                </Typography>
                <Typography>
                  <strong>Trajet:</strong> {
                    invoiceDialog.reservation.flight ? 
                    `${invoiceDialog.reservation.flight.ville_depart || 'N/A'} - ${invoiceDialog.reservation.flight.ville_arrivee || 'N/A'}` : 
                    'N/A'
                  }
                </Typography>
                <Typography>
                  <strong>Date de départ:</strong> {
                    invoiceDialog.reservation.flight && invoiceDialog.reservation.flight.date_depart ? 
                    formatDate(invoiceDialog.reservation.flight.date_depart) : 
                    'N/A'
                  }
                </Typography>
                <Typography>
                  <strong>Date de retour:</strong> {
                    invoiceDialog.reservation.flight && invoiceDialog.reservation.flight.date_retour ? 
                    formatDate(invoiceDialog.reservation.flight.date_retour) : 
                    'N/A'
                  }
                </Typography>
                <Typography>
                  <strong>Compagnie:</strong> {
                    invoiceDialog.reservation.flight ? 
                    invoiceDialog.reservation.flight.compagnie_aerienne || 'N/A' : 
                    'N/A'
                  }
                </Typography>
              </div>
              
              <div>
                <Typography variant="h6">Détails du Prix</Typography>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Description</TableCell>
                        <TableCell align="center">Quantité</TableCell>
                        <TableCell align="right">Prix unitaire</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell>Billet d'avion</TableCell>
                        <TableCell align="center">{invoiceDialog.reservation.nombre_passagers}</TableCell>
                        <TableCell align="right">
                          {(invoiceDialog.reservation.prix_total / invoiceDialog.reservation.nombre_passagers).toFixed(2)} €
                        </TableCell>
                        <TableCell align="right">{invoiceDialog.reservation.prix_total} €</TableCell>
                      </TableRow>
                      
                      {/* Add discount row if applicable */}
                      {invoiceDialog.reservation.discountAmount && invoiceDialog.reservation.discountAmount > 0 && (
                        <TableRow>
                          <TableCell>Réduction (Coupon: {invoiceDialog.reservation.coupon || 'N/A'})</TableCell>
                          <TableCell align="center">1</TableCell>
                          <TableCell align="right">- {invoiceDialog.reservation.discountAmount} €</TableCell>
                          <TableCell align="right">- {invoiceDialog.reservation.discountAmount} €</TableCell>
                        </TableRow>
                      )}
                      
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell align="right"><strong>TOTAL</strong></TableCell>
                        <TableCell align="right"><strong>{invoiceDialog.reservation.prix_total} €</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              
              <div style={{ marginTop: '30px', textAlign: 'center' }}>
                <Typography variant="body2">Merci pour votre confiance!</Typography>
                <Typography variant="body2">Pour toute question concernant cette facture, veuillez nous contacter.</Typography>
                <Typography variant="body2">B2B Airlines - contact@b2bairlines.com - +33 1 23 45 67 89</Typography>
              </div>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleInvoiceClose}>Fermer</Button>
          {invoiceDialog.reservation && (
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={() => generateInvoicePDF(invoiceDialog.reservation)}
              style={{ backgroundColor: '#4CAF50' }}
            >
              Télécharger PDF
            </Button>
          )}
        </DialogActions>
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

export default Reservations;