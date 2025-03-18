import express from 'express';
import { 
  getRequests, 
  getRequestById, 
  getRequestsByClientId, 
  createRequest, 
  updateRequestStatus, 
  deleteRequest,
  approveRequest,
  rejectRequest
} from '../../controllers/RequestSoldeController/requestSoldeController';

const router = express.Router();

// Get all requests
router.get('/', getRequests);

// Get request by ID
router.get('/:id', getRequestById as express.RequestHandler);

// Get requests by client ID
router.get('/client/:clientId', getRequestsByClientId);

// Create a new request
router.post('/', createRequest as express.RequestHandler);

// Update request status
router.put('/:id/status', updateRequestStatus as express.RequestHandler);

// Approve a request
router.put('/:id/approve', approveRequest as express.RequestHandler);

// Reject a request
router.put('/:id/reject', rejectRequest as express.RequestHandler);

// Delete request
router.delete('/:id', deleteRequest as express.RequestHandler);

export default router;