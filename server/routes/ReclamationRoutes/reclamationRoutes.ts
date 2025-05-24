import express from 'express';
import {
  getReclamations,
  getReclamationById,
  getReclamationsByUserId,
  createReclamation,
  updateReclamation,
  deleteReclamation
} from '../../controllers/ReclamationController/ReclamationController';
import { auth, adminAuth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Get all reclamations (admin only)
router.get('/', auth as express.RequestHandler, adminAuth as express.RequestHandler, getReclamations);

// Get reclamations by user ID (authenticated users)
router.get('/user/:userId', auth as express.RequestHandler, getReclamationsByUserId);

// Get reclamation by ID (authenticated users)
router.get('/:id', auth as express.RequestHandler, getReclamationById as express.RequestHandler);

// Create a new reclamation (authenticated users)
router.post('/', auth as express.RequestHandler, createReclamation as express.RequestHandler);

// Update reclamation (admin response)
router.put('/:id', auth as express.RequestHandler, adminAuth as express.RequestHandler, updateReclamation as express.RequestHandler);

// Delete reclamation (admin only)
router.delete('/:id', auth as express.RequestHandler, adminAuth as express.RequestHandler, deleteReclamation as express.RequestHandler);

export default router;