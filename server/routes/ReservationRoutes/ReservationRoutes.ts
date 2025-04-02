import express from 'express';
import { 
  getReservations, 
  getReservationById, 
  createReservation, 
  updateReservation, 
  deleteReservation,
  getReservationsByFlightId,
  getReservationsByUserId,
  cancelReservation
} from '../../controllers/ReservationController/ReservationController';
import { auth, adminAuth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Specific routes first
router.get('/flight/:flightId', getReservationsByFlightId as express.RequestHandler);
router.get('/user/:userId', getReservationsByUserId as express.RequestHandler);
router.put('/:id/cancel', auth as express.RequestHandler, cancelReservation as express.RequestHandler);

// Then more generic routes
router.get('/:id', getReservationById as express.RequestHandler);
router.put('/:id', auth as express.RequestHandler, updateReservation as express.RequestHandler);
router.delete('/:id', auth as express.RequestHandler, deleteReservation as express.RequestHandler);

// Most generic routes last
router.get('/', getReservations);
router.post('/', createReservation as express.RequestHandler);

export default router;