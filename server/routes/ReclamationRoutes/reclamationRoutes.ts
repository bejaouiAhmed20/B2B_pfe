import express from 'express';
import { 
  getReclamations, 
  getReclamationById, 
  getReclamationsByUserId,
  createReclamation, 
  updateReclamation, 
  deleteReclamation 
} from '../../controllers/ReclamationController/ReclamationController';
const router = express.Router();

// Get all reclamations (admin only)
router.get('/', getReclamations);

// Get reclamations by user ID
router.get('/user/:userId', getReclamationsByUserId);

// Get reclamation by ID
router.get('/:id', getReclamationById as express.RequestHandler);

// Create a new reclamation
router.post('/', createReclamation as express.RequestHandler);

// Update reclamation (admin response)
router.put('/:id', updateReclamation as express.RequestHandler);

// Delete reclamation
router.delete('/:id', deleteReclamation as express.RequestHandler);

export default router;