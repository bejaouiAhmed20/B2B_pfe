import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Container
} from '@mui/material';
import {
  Download as DownloadIcon,
  Description as DescriptionIcon,
  CalendarToday as CalendarIcon,
  AccountBalance as AccountBalanceIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import axios from 'axios';
import jsPDF from 'jspdf';

const Contract = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContract();
  }, []);

  const fetchContract = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.id) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:5000/api/contracts/client/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.length > 0) {
        // Get the active contract or the most recent one
        const activeContract = response.data.find(c => c.isActive) || response.data[0];
        setContract(activeContract);
      } else {
        setError('Aucun contrat trouvé pour votre compte');
      }
    } catch (error) {
      console.error('Erreur lors du chargement du contrat:', error);
      setError('Erreur lors du chargement du contrat');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'TND'
    }).format(amount);
  };

  const generatePDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/contracts/${contract.id}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const contractData = response.data;
      
      // Create PDF
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(204, 10, 43); // Tunisair red
      doc.text('TUNISAIR PARTNER HUB', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('CONTRAT B2B', 105, 35, { align: 'center' });
      
      // Contract details
      let yPosition = 55;
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('INFORMATIONS DU CONTRAT', 20, yPosition);
      yPosition += 10;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Référence: ${contractData.id}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Libellé: ${contractData.label}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Type de client: ${contractData.clientType}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Statut: ${contractData.isActive ? 'Actif' : 'Inactif'}`, 20, yPosition);
      yPosition += 15;
      
      // Client information
      doc.setFont(undefined, 'bold');
      doc.text('INFORMATIONS CLIENT', 20, yPosition);
      yPosition += 10;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Nom: ${contractData.client.nom}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Email: ${contractData.client.email}`, 20, yPosition);
      yPosition += 7;
      if (contractData.client.numero_telephone) {
        doc.text(`Téléphone: ${contractData.client.numero_telephone}`, 20, yPosition);
        yPosition += 7;
      }
      if (contractData.client.adresse) {
        doc.text(`Adresse: ${contractData.client.adresse}`, 20, yPosition);
        yPosition += 7;
      }
      if (contractData.client.pays) {
        doc.text(`Pays: ${contractData.client.pays}`, 20, yPosition);
        yPosition += 7;
      }
      yPosition += 10;
      
      // Contract periods
      doc.setFont(undefined, 'bold');
      doc.text('PÉRIODES DU CONTRAT', 20, yPosition);
      yPosition += 10;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Période du contrat: ${contractData.contractStartDate} - ${contractData.contractEndDate}`, 20, yPosition);
      yPosition += 7;
      doc.text(`Période de voyage: ${contractData.travelStartDate} - ${contractData.travelEndDate}`, 20, yPosition);
      yPosition += 15;
      
      // Financial information
      doc.setFont(undefined, 'bold');
      doc.text('INFORMATIONS FINANCIÈRES', 20, yPosition);
      yPosition += 10;
      
      doc.setFont(undefined, 'normal');
      doc.text(`Minimum garanti: ${formatCurrency(contractData.guaranteedMinimum)}`, 20, yPosition);
      yPosition += 7;
      
      if (contractData.modifiedFeeAmount) {
        doc.text(`Montant des frais modifié: ${formatCurrency(contractData.modifiedFeeAmount)}`, 20, yPosition);
        yPosition += 7;
      }
      
      if (contractData.fixedTicketPrice) {
        doc.text(`Prix fixe des billets: ${formatCurrency(contractData.fixedTicketPrice)}`, 20, yPosition);
        yPosition += 7;
      }
      
      if (contractData.invoiceStamp) {
        doc.text(`Timbre de facture: ${formatCurrency(contractData.invoiceStamp)}`, 20, yPosition);
        yPosition += 7;
      }
      
      if (contractData.finalClientAdditionalFees) {
        doc.text(`Frais supplémentaires: ${formatCurrency(contractData.finalClientAdditionalFees)}`, 20, yPosition);
        yPosition += 7;
      }
      
      // Coupon information
      if (contractData.coupon) {
        yPosition += 10;
        doc.setFont(undefined, 'bold');
        doc.text('CODE PROMO ASSOCIÉ', 20, yPosition);
        yPosition += 10;
        
        doc.setFont(undefined, 'normal');
        doc.text(`Code: ${contractData.coupon.code}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Réduction: ${contractData.coupon.reduction}${contractData.coupon.reduction_type === 'percentage' ? '%' : ' TND'}`, 20, yPosition);
        yPosition += 7;
      }
      
      // Footer
      yPosition = 270;
      doc.setFontSize(10);
      doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, yPosition);
      doc.text('Tunisair Partner Hub - Contrat B2B', 105, yPosition + 5, { align: 'center' });
      
      // Save PDF
      doc.save(`Contrat_${contractData.id.substring(0, 8)}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      setError('Erreur lors de la génération du PDF');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!contract) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">Aucun contrat trouvé pour votre compte.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" gutterBottom color="primary">
              Mon Contrat B2B
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Référence: {contract.id}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={generatePDF}
            size="large"
          >
            Télécharger PDF
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Contract Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Informations du Contrat</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Libellé</Typography>
                  <Typography variant="body1" fontWeight="bold">{contract.label}</Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Type de Client</Typography>
                  <Typography variant="body1">{contract.clientType}</Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Statut</Typography>
                  <Chip 
                    label={contract.isActive ? 'Actif' : 'Inactif'} 
                    color={contract.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Dates */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Périodes</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Période du Contrat</Typography>
                  <Typography variant="body1">
                    {formatDate(contract.contractStartDate)} - {formatDate(contract.contractEndDate)}
                  </Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Période de Voyage</Typography>
                  <Typography variant="body1">
                    {formatDate(contract.travelStartDate)} - {formatDate(contract.travelEndDate)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Financial Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Informations Financières</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Minimum Garanti</Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(contract.guaranteedMinimum)}
                  </Typography>
                </Box>
                
                {contract.modifiedFeeAmount && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Montant des Frais Modifié</Typography>
                    <Typography variant="body1">{formatCurrency(contract.modifiedFeeAmount)}</Typography>
                  </Box>
                )}
                
                {contract.fixedTicketPrice && (
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Prix Fixe des Billets</Typography>
                    <Typography variant="body1">{formatCurrency(contract.fixedTicketPrice)}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Coupon Information */}
          {contract.coupon && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Code Promo Associé</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Code</Typography>
                    <Typography variant="h6" color="secondary">
                      {contract.coupon.code}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="body2" color="text.secondary">Réduction</Typography>
                    <Typography variant="body1">
                      {contract.coupon.reduction}{contract.coupon.reduction_type === 'percentage' ? '%' : ' TND'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Additional Information */}
        {(contract.invoiceStamp || contract.finalClientAdditionalFees || contract.minTimeBeforeBalanceFlight) && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Informations Complémentaires</Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                {contract.invoiceStamp && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Timbre de Facture</Typography>
                    <Typography variant="body1">{formatCurrency(contract.invoiceStamp)}</Typography>
                  </Grid>
                )}
                
                {contract.finalClientAdditionalFees && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Frais Supplémentaires</Typography>
                    <Typography variant="body1">{formatCurrency(contract.finalClientAdditionalFees)}</Typography>
                  </Grid>
                )}
                
                {contract.minTimeBeforeBalanceFlight && (
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Temps Min. Avant Vol Balance</Typography>
                    <Typography variant="body1">{contract.minTimeBeforeBalanceFlight} heures</Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Container>
  );
};

export default Contract;
