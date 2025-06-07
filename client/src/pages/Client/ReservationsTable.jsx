import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { 
  PictureAsPdf, 
  FlightTakeoff, 
  Person, 
  AttachMoney 
} from '@mui/icons-material';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import axios from 'axios';
import { API_BASE_URL, getAuthToken, getAxiosConfig } from '../../utils/api';

const ReservationsTable = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/reservations/user/${user.id}`, getAxiosConfig());
      setReservations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setError('Impossible de charger les réservations. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmé':
      case 'confirme':
      case 'confirmed':
        return 'success';
      case 'en attente':
      case 'pending':
        return 'warning';
      case 'annulé':
      case 'annule':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const generatePDF = (reservation) => {
    try {
      console.log('Starting PDF generation for reservation:', reservation.id);
      
      // Create a new jsPDF instance with portrait orientation
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add Tunisair logo/header with improved styling
      doc.setFillColor(204, 10, 43); // Tunisair red color
      doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('TUNISAIR B2B - FACTURE', 105, 16, { align: 'center' });
      doc.setFont(undefined, 'normal');
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Add a subtle background for the main content area
      doc.setFillColor(250, 250, 250);
      doc.rect(0, 25, 210, 252, 'F');
      
      // Reservation details with improved styling
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Détails de la Réservation', 14, 35);
      doc.setFont(undefined, 'normal');
      
      // Add a subtle divider line
      doc.setDrawColor(204, 10, 43);
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);
      
      doc.setFontSize(11);
      doc.text(`Numéro de Réservation: ${reservation.id}`, 14, 45);
      doc.text(`Date de Réservation: ${formatDate(reservation.date_reservation)}`, 14, 53);
      doc.text(`Statut: ${reservation.statut || 'Confirmée'}`, 14, 61);
      doc.text(`Nombre de Passagers: ${reservation.nombre_passagers || 1}`, 14, 69);
      
      // Make the price more prominent with a box around it
      doc.setFillColor(240, 240, 240);
      doc.rect(120, 65, 76, 20, 'F');
      doc.setDrawColor(204, 10, 43);
      doc.setLineWidth(1);
      doc.rect(120, 65, 76, 20, 'S'); // Add a red border
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('MONTANT TOTAL:', 125, 73);
      doc.setFontSize(16);
      doc.setTextColor(204, 10, 43);
      doc.text(`${reservation.prix_total || 0} DT`, 185, 78, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      doc.setLineWidth(0.5);
      
      // Flight details with improved styling
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Détails du Vol', 14, 95);
      doc.setFont(undefined, 'normal');
      
      // Add a subtle divider line
      doc.line(14, 98, 196, 98);
      
      if (reservation.flight) {
        doc.setFontSize(11);
        doc.text(`Vol: ${reservation.flight.titre || 'Tunis - Paris'}`, 14, 105);
        doc.text(`Départ: ${reservation.flight.ville_depart || 'Tunis'}`, 14, 113);
        doc.text(`Arrivée: ${reservation.flight.ville_arrivee || 'Paris'}`, 14, 121);
        
        // Handle potential date formatting issues
        let departDate = 'N/A';
        let arriveDate = 'N/A';
        
        try {
          departDate = formatDate(reservation.flight.date_depart);
        } catch (e) {
          console.error('Error formatting departure date:', e);
        }
        
        try {
          arriveDate = formatDate(reservation.flight.date_arrivee);
        } catch (e) {
          console.error('Error formatting arrival date:', e);
        }
        
        doc.text(`Date de Départ: ${departDate}`, 14, 129);
        doc.text(`Date d'Arrivée: ${arriveDate}`, 14, 137);
        doc.text(`Compagnie: Tunisair`, 14, 145);
      } else {
        // Same fallback as before
        doc.setFontSize(11);
        doc.text('Vol: Tunis - Paris', 14, 105);
        doc.text('Départ: Tunis', 14, 113);
        doc.text('Arrivée: Paris', 14, 121);
        doc.text(`Date de Départ: ${formatDate(new Date())}`, 14, 129);
        doc.text(`Date d'Arrivée: ${formatDate(new Date())}`, 14, 137);
        doc.text('Compagnie: Tunisair', 14, 145);
      }
      
      // Add passenger information with improved styling
      // Modify passenger information section
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Information Passager', 14, 163);
      doc.setFont(undefined, 'normal');
      
      // Add a subtle divider line
      doc.line(14, 166, 196, 166);
      
      doc.setFontSize(11);
      doc.text(`Nom: ${user.nom || user.name || 'N/A'}`, 14, 173);
      doc.text(`Email: ${user.email || 'N/A'}`, 14, 181);
      doc.text(`Téléphone: ${user.telephone || user.phone || 'N/A'}`, 14, 189);
      
      // Add payment summary box
      doc.setFillColor(240, 240, 240);
      doc.rect(120, 170, 76, 40, 'F');
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('RÉCAPITULATIF', 158, 178, { align: 'center' });
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text('Sous-total:', 125, 188);
      doc.text(`${reservation.prix_total || 0} DT`, 185, 188, { align: 'right' });
      doc.text('TVA (0%):', 125, 196);
      doc.text('0.00 DT', 185, 196, { align: 'right' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Total:', 125, 204);
      doc.setTextColor(204, 10, 43);
      doc.text(`${reservation.prix_total || 0} DT`, 185, 204, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      // Add terms and conditions section
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Conditions Importantes', 14, 210);
      doc.setFont(undefined, 'normal');
      
      doc.setFontSize(9);
      doc.text('• Veuillez vous présenter à l\'aéroport au moins 2 heures avant le départ.', 14, 220);
      doc.text('• Pièce d\'identité obligatoire pour l\'embarquement.', 14, 228);
      doc.text('• Pour toute modification ou annulation, veuillez contacter notre service client.', 14, 244);
      
      // Add barcode (simulated with lines)
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('RÉFÉRENCE RÉSERVATION', 158, 220, { align: 'center' });
      doc.setFont(undefined, 'normal');
      
      // Create a simple barcode representation
      const barcodeX = 130;
      const barcodeY = 230;
      const barcodeWidth = 70;
      const barcodeHeight = 15;
      
      // Draw barcode background
      doc.setFillColor(255, 255, 255);
      doc.rect(barcodeX, barcodeY, barcodeWidth, barcodeHeight, 'F');
      
      // Convert reservation ID to a series of bars
      const id = reservation.id.toString();
      const barWidth = 0.8;
      const spacing = 0.3;
      
      doc.setFillColor(0, 0, 0);
      let currentX = barcodeX + 2;
      
      // Create barcode pattern based on ID characters
      for (let i = 0; i < id.length; i++) {
        const charCode = id.charCodeAt(i);
        const barHeight = (charCode % 3) + 1; // Vary height based on character
        
        // Draw a bar for each character
        doc.setFillColor(0, 0, 0);
        doc.rect(currentX, barcodeY + 2, barWidth, barcodeHeight - (4 - barHeight), 'F');
        currentX += barWidth + spacing;
        
        // Add some variation
        if (i % 2 === 0) {
          doc.rect(currentX, barcodeY + 2, barWidth * 2, barcodeHeight - 4, 'F');
          currentX += (barWidth * 2) + spacing;
        }
      }
      
      // Add ID below barcode
      doc.setFontSize(8);
      doc.text(id, barcodeX + (barcodeWidth / 2), barcodeY + barcodeHeight + 5, { align: 'center' });
      
      // Footer with improved styling
      doc.setFillColor(204, 10, 43);
      doc.rect(0, 277, 210, 20, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('Tunisair B2B - Document officiel', 50, 285);
      doc.setFontSize(8);
      doc.text('Document généré le ' + new Date().toLocaleDateString(), 150, 285);
      
      // Save the PDF
      console.log('Saving PDF...');
      doc.save(`Facture-${reservation.id}.pdf`);
      console.log('PDF generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Chargement des réservations...
        </Typography>
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
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mes Réservations
      </Typography>
      
      {reservations.length === 0 ? (
        <Alert severity="info">
          Vous n'avez pas encore de réservations.
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Vol</strong></TableCell>
                <TableCell><strong>Passagers</strong></TableCell>
                <TableCell><strong>Prix</strong></TableCell>
                <TableCell><strong>Statut</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reservations.map((reservation) => (
                <TableRow key={reservation.id} hover>
                  <TableCell>{reservation.id}</TableCell>
                  <TableCell>{formatDate(reservation.date_reservation)}</TableCell>
                  <TableCell>
                    {reservation.flight ? (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <FlightTakeoff fontSize="small" sx={{ mr: 1 }} />
                          {reservation.flight.titre || 'N/A'}
                        </Box>
                        <Typography variant="caption" display="block">
                          {reservation.flight.ville_depart || 'N/A'} → {reservation.flight.ville_arrivee || 'N/A'}
                        </Typography>
                      </>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person fontSize="small" sx={{ mr: 1 }} />
                      {reservation.nombre_passagers || 'N/A'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AttachMoney fontSize="small" sx={{ mr: 1 }} />
                      {reservation.prix_total || 0} DT
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={reservation.statut || 'N/A'} 
                      color={getStatusColor(reservation.statut)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PictureAsPdf />}
                      size="small"
                      onClick={() => generatePDF(reservation)}
                      sx={{ backgroundColor: '#CC0A2B' }}
                    >
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ReservationsTable;