import express from 'express';
import { 
  getSeatReservations, 
  getSeatReservationById, 
  getSeatReservationsByFlight,
  getSeatReservationsByReservation,
  createSeatReservation, 
  deleteSeatReservation 
} from '../../controllers/SeatReservationController/seatReservationController';
import { auth, adminAuth } from '../../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', getSeatReservations);
router.get('/:id', getSeatReservationById as express.RequestHandler);
router.get('/flight/:flightId', getSeatReservationsByFlight);
router.get('/reservation/:reservationId', getSeatReservationsByReservation);

// Protected routes
router.post('/', auth as express.RequestHandler, createSeatReservation as express.RequestHandler);
router.delete('/:id', auth as express.RequestHandler, deleteSeatReservation as express.RequestHandler);

export default router;