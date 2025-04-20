import { Request, Response } from 'express';
import { RequestSolde, RequestStatus } from '../../models/RequestSolde';
import { User } from '../../models/User';
import { Compte } from '../../models/Compte';
import { emailTransporter, formatDateFr, formatEuro } from '../../utils/emailConfig';

// Get all requests
export const getRequests = async (req: Request, res: Response) => {
  try {
    const requests = await RequestSolde.find({
      relations: ['client']
    });
    res.json(requests);
  } catch (error) {
    console.error('Failed to fetch requests:', error);
    res.status(500).json({ message: 'Failed to fetch requests' });
  }
};

// Get request by ID
export const getRequestById = async (req: Request, res: Response) => {
  try {
    const request = await RequestSolde.findOne({
      where: { id: req.params.id },
      relations: ['client']
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Failed to fetch request:', error);
    res.status(500).json({ message: 'Failed to fetch request' });
  }
};

// Get requests by client ID
export const getRequestsByClientId = async (req: Request, res: Response) => {
  try {
    const requests = await RequestSolde.find({
      where: { client: { id: req.params.clientId } },
      relations: ['client'],
      order: { date: 'DESC' }
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Failed to fetch client requests:', error);
    res.status(500).json({ message: 'Failed to fetch client requests' });
  }
};

// Create a new request
export const createRequest = async (req: Request, res: Response) => {
  try {
    const { client_id, montant, description, imageUrl } = req.body;
    
    // Check if client exists
    const client = await User.findOneBy({ id: client_id });
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    
    const request = new RequestSolde();
    request.client = client;
    request.montant = montant;
    request.description = description;
    request.imageUrl = imageUrl;
    request.status = RequestStatus.PENDING;
    
    await request.save();
    res.status(201).json(request);
  } catch (error) {
    console.error('Failed to create request:', error);
    res.status(500).json({ message: 'Failed to create request' });
  }
};

// Update request status
export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    if (!Object.values(RequestStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const request = await RequestSolde.findOne({
      where: { id: req.params.id },
      relations: ['client']
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // If approving the request, add the amount to the client's account
    if (status === RequestStatus.APPROVED && request.status !== RequestStatus.APPROVED) {
      const compte = await Compte.findOne({
        where: { user: { id: request.client.id } }
      });
      
      if (!compte) {
        return res.status(404).json({ message: 'Client account not found' });
      }
      
      compte.solde += Number(request.montant);
      await compte.save();
    }
    
    request.status = status;
    await request.save();
    
    res.json(request);
  } catch (error) {
    console.error('Failed to update request status:', error);
    res.status(500).json({ message: 'Failed to update request status' });
  }
};

// Delete request
export const deleteRequest = async (req: Request, res: Response) => {
  try {
    const request = await RequestSolde.findOneBy({ id: req.params.id });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    await request.remove();
    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Failed to delete request:', error);
    res.status(500).json({ message: 'Failed to delete request' });
  }
};

// Approve a request
export const approveRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const request = await RequestSolde.findOne({
      where: { id },
      relations: ['client']
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== RequestStatus.PENDING) {
      return res.status(400).json({ message: 'This request has already been processed' });
    }
    
    // Update request status to approved
    request.status = RequestStatus.APPROVED;
    await request.save();
    
    // Find the client's account
    const compte = await Compte.findOne({
      where: { user: { id: request.client.id } }
    });
    
    if (!compte) {
      return res.status(404).json({ message: 'Client account not found' });
    }
    
    // Add the requested amount to the client's account
    const currentSolde = parseFloat(compte.solde.toString());
    const amountToAdd = parseFloat(request.montant.toString());
    compte.solde = currentSolde + amountToAdd;
    await compte.save();
    
    // Send email notification
    try {
      // Make sure we have a valid email address
      if (!request.client.email) {
        console.error('Client email is missing, cannot send approval notification');
      } else {
        const clientName = request.client.nom || 'Client';
        const requestDate = formatDateFr(request.date);
        const approvalDate = formatDateFr(new Date());
        const montantFormatted = formatEuro(parseFloat(request.montant.toString()));
        
        console.log(`Preparing to send approval email to: ${request.client.email}`);
        
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #CC0A2B; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .details { background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .success { color: #4CAF50; font-weight: bold; }
              .footer { font-size: 12px; text-align: center; margin-top: 30px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Tunisair B2B</h1>
              </div>
              <div class="content">
                <h2>Notification de Demande de Solde</h2>
                <p>Bonjour ${clientName},</p>
                <p>Nous vous informons que votre demande de solde a été <span class="success">approuvée</span>.</p>
                
                <div class="details">
                  <h3>Détails de la demande:</h3>
                  <p><strong>Montant:</strong> ${montantFormatted}</p>
                  <p><strong>Date de la demande:</strong> ${requestDate}</p>
                  <p><strong>Date d'approbation:</strong> ${approvalDate}</p>
                  <p><strong>Statut:</strong> <span class="success">Approuvée</span></p>
                </div>
                
                <p>Le montant a été ajouté à votre compte. Votre nouveau solde est de ${formatEuro(parseFloat(compte.solde.toString()))}.</p>
                <p>Merci de votre confiance.</p>
                <p>Cordialement,<br>L'équipe Tunisair B2B</p>
              </div>
              <div class="footer">
                <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        const mailResult = await emailTransporter.sendMail({
          from: process.env.EMAIL_USER || 'noreply@tunisairb2b.com',
          to: request.client.email,
          subject: 'Tunisair B2B - Votre demande de solde a été approuvée',
          html: htmlContent
        });
        
        console.log('Approval email sent successfully:', mailResult.messageId);
      }
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Continue with the process even if email fails
    }
    
    res.status(200).json({ 
      message: 'Request approved successfully',
      request,
      compte: {
        id: compte.id,
        solde: parseFloat(compte.solde.toString())
      }
    });
  } catch (error: any) {
    console.error('Error approving request:', error);
    res.status(500).json({ 
      message: 'Failed to approve request',
      error: error.message 
    });
  }
};

// Reject a request
export const rejectRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const request = await RequestSolde.findOne({
      where: { id },
      relations: ['client']
    });
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    if (request.status !== RequestStatus.PENDING) {
      return res.status(400).json({ message: 'This request has already been processed' });
    }
    
    // Update request status to rejected
    request.status = RequestStatus.REJECTED;
    await request.save();
    
    // Send email notification
    try {
      // Make sure we have a valid email address
      if (!request.client.email) {
        console.error('Client email is missing, cannot send rejection notification');
      } else {
        const clientName = request.client.nom || 'Client';
        const requestDate = formatDateFr(request.date);
        const rejectionDate = formatDateFr(new Date());
        const montantFormatted = formatEuro(parseFloat(request.montant.toString()));
        
        console.log(`Preparing to send rejection email to: ${request.client.email}`);
        
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #CC0A2B; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .details { background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .rejected { color: #f44336; font-weight: bold; }
              .footer { font-size: 12px; text-align: center; margin-top: 30px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Tunisair B2B</h1>
              </div>
              <div class="content">
                <h2>Notification de Demande de Solde</h2>
                <p>Bonjour ${clientName},</p>
                <p>Nous vous informons que votre demande de solde a été <span class="rejected">rejetée</span>.</p>
                
                <div class="details">
                  <h3>Détails de la demande:</h3>
                  <p><strong>Montant:</strong> ${montantFormatted}</p>
                  <p><strong>Date de la demande:</strong> ${requestDate}</p>
                  <p><strong>Date de rejet:</strong> ${rejectionDate}</p>
                  <p><strong>Statut:</strong> <span class="rejected">Rejetée</span></p>
                </div>
                
                <p>Pour plus d'informations, veuillez contacter notre service client.</p>
                <p>Cordialement,<br>L'équipe Tunisair B2B</p>
              </div>
              <div class="footer">
                <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        const mailResult = await emailTransporter.sendMail({
          from: process.env.EMAIL_USER || 'noreply@tunisairb2b.com',
          to: request.client.email,
          subject: 'Tunisair B2B - Votre demande de solde a été rejetée',
          html: htmlContent
        });
        
        console.log('Rejection email sent successfully:', mailResult.messageId);
      }
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Continue with the process even if email fails
    }
    
    res.status(200).json({ 
      message: 'Request rejected successfully',
      request
    });
  } catch (error: any) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ 
      message: 'Failed to reject request', 
      error: error.message 
    });
  }
};