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
  updateBalance
} from '../../controllers/CompteController/compteController';

const router = express.Router();

// Get all accounts
router.get('/', getComptes);

// Get account by ID
router.get('/:id', getCompteById as express.RequestHandler);

// Get account by user ID
router.get('/user/:userId', getCompteByUserId as express.RequestHandler);

// Create a new account
router.post('/', addCompte as express.RequestHandler);

// Update account
router.put('/:id', updateCompte as express.RequestHandler);

// Add funds to account
router.post('/:id/add-funds', addFunds as express.RequestHandler);

// Add funds to account by user ID
router.post('/deposit', addFundsByUserId as express.RequestHandler);

// Withdraw funds from account
router.post('/:id/withdraw-funds', withdrawFunds as express.RequestHandler );

// Delete account
router.delete('/:id', deleteCompte as express.RequestHandler);
// ... existing code ...

// Add this route to update account balance
router.put('/update/:userId', updateBalance as express.RequestHandler);


export default router;