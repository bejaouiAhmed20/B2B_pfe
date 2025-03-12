import express from 'express';
import { getFlights, addFlight, updateFlight, deleteFlight, getFlightById } from '../../controllers/FlightController/flightController';

const router = express.Router();

router.get('/', getFlights);
router.get('/:id', getFlightById as express.RequestHandler);
router.post('/', addFlight as express.RequestHandler);
router.put('/:id', updateFlight as express.RequestHandler);
router.delete('/:id', deleteFlight as express.RequestHandler);

export default router;