import { Request, Response } from 'express';
import { RequestSolde, RequestStatus } from '../../models/RequestSolde';
import { User } from '../../models/User';
import { Compte } from '../../models/Compte';

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
      where: { id }
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
    
    res.status(200).json({ 
      message: 'Request rejected successfully',
      request
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ message: 'Failed to reject request' });
  }
};