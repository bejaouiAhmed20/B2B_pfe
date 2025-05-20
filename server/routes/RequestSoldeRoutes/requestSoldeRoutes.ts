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
import { auth, adminAuth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Get all requests - Admin only
router.get('/', auth as any, adminAuth as any, getRequests as express.RequestHandler);

// Get requests by client ID - Authenticated users
// IMPORTANT: Cette route doit être définie AVANT la route /:id pour éviter les conflits
router.get('/client/:clientId', auth as any, getRequestsByClientId as express.RequestHandler);

// Get request by ID - Authenticated users
router.get('/:id', auth as any, getRequestById as express.RequestHandler);

// Create a new request - Authenticated users
router.post('/', auth as any, createRequest as express.RequestHandler);

// Update request status - Admin only
router.put('/:id/status', auth as any, adminAuth as any, updateRequestStatus as express.RequestHandler);

// Approve a request - Admin only
router.put('/:id/approve', auth as any, adminAuth as any, approveRequest as express.RequestHandler);

// Reject a request - Admin only
router.put('/:id/reject', auth as any, adminAuth as any, rejectRequest as express.RequestHandler);

// Delete request - Admin only
router.delete('/:id', auth as any, adminAuth as any, deleteRequest as express.RequestHandler);

export default router;