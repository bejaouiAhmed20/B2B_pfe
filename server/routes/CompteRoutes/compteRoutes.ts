import express from 'express';
import {
  getComptes,
  getCompteById,
  getCompteByUserId,
  addCompte,
  updateCompte,
  deleteCompte,
  addFunds,
  withdrawFunds,
  addFundsByUserId,
  updateBalance,
  refundReservation
} from '../../controllers/CompteController/compteController';
import { auth, adminAuth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Get all accounts - Admin only
router.get('/', auth as express.RequestHandler, adminAuth as express.RequestHandler, getComptes);

// Get account by ID - Authenticated users
router.get('/:id', auth as express.RequestHandler, getCompteById as express.RequestHandler);

// Get account by user ID - Authenticated users
router.get('/user/:userId', auth as express.RequestHandler, getCompteByUserId as express.RequestHandler);

// Create a new account - Admin only
router.post('/', auth as express.RequestHandler, adminAuth as express.RequestHandler, addCompte as express.RequestHandler);

// Update account - Admin only
router.put('/:id', auth as express.RequestHandler, adminAuth as express.RequestHandler, updateCompte as express.RequestHandler);

// Add funds to account - Admin only
router.post('/:id/add-funds', auth as express.RequestHandler, adminAuth as express.RequestHandler, addFunds as express.RequestHandler);

// Add funds to account by user ID - Authenticated users
router.post('/deposit', auth as express.RequestHandler, addFundsByUserId as express.RequestHandler);

// Process refund for cancelled reservation - Authenticated users
router.post('/refund', auth as express.RequestHandler, refundReservation as express.RequestHandler);

// Withdraw funds from account - Admin only
router.post('/:id/withdraw-funds', auth as express.RequestHandler, adminAuth as express.RequestHandler, withdrawFunds as express.RequestHandler);

// Delete account - Admin only
router.delete('/:id', auth as express.RequestHandler, adminAuth as express.RequestHandler, deleteCompte as express.RequestHandler);

// Update account balance - Admin only
router.put('/update/:userId', auth as express.RequestHandler, adminAuth as express.RequestHandler, updateBalance as express.RequestHandler);


export default router;