import express from 'express';
import { getFlights, addFlight, updateFlight, deleteFlight, getFlightById } from '../../controllers/FlightController/flightController';
import { assignPlaneToFlight } from '../../controllers/FlightController/flightController';
import { adminAuth } from '../../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getFlights);
router.get('/:id', getFlightById as express.RequestHandler);
router.post('/', addFlight as express.RequestHandler);
router.put('/:id', updateFlight as express.RequestHandler);
router.delete('/:id', deleteFlight as express.RequestHandler);
// Add this route to the existing router
router.post('/assign-plane', adminAuth as express.RequestHandler, assignPlaneToFlight as express.RequestHandler);

export default router;