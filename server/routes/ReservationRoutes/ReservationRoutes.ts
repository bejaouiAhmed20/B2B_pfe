import express from 'express';
import { 
  getReservations, 
  getReservationById, 
  createReservation, 
  updateReservation, 
  deleteReservation,
  getReservationsByFlightId,
  getReservationsByUserId
} from '../../controllers/ReservationController/ReservationController';
import { auth, adminAuth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getReservations);
router.get('/:id', getReservationById as express.RequestHandler);
router.get('/flight/:flightId', getReservationsByFlightId as express.RequestHandler);
router.get('/user/:userId', getReservationsByUserId as express.RequestHandler);

// Make the POST route public (no auth middleware)
router.post('/', createReservation as express.RequestHandler);

// Protected routes
router.put('/:id', auth as express.RequestHandler, updateReservation as express.RequestHandler);
router.delete('/:id', auth as express.RequestHandler, deleteReservation as express.RequestHandler);

export default router;