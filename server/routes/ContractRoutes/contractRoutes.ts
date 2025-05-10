import express from 'express';
import { 
  getContracts, 
  getContractById, 
  getContractsByClientId, 
  createContract, 
  updateContract, 
  deleteContract 
} from '../../controllers/ContractController/contractController';

const router = express.Router();

// Get all contracts
router.get('/', getContracts);

// Get contract by ID
router.get('/:id', getContractById as express.RequestHandler);

// Get contracts by client ID
router.get('/client/:clientId', getContractsByClientId);

// Create a new contract
router.post('/', createContract as express.RequestHandler);

// Update contract
router.put('/:id', updateContract as express.RequestHandler);

// Delete contract
router.delete('/:id', deleteContract as express.RequestHandler);

export default router;

