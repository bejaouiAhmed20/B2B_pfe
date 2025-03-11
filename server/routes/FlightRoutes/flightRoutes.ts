import express from 'express';
import { getFlights, addFlight, updateFlight, deleteFlight, getFlightById,searchFlights } from '../../controllers/FlightController/flightController';

const router = express.Router();

router.get('/', getFlights);
router.get('/:id', getFlightById as express.RequestHandler);
router.post('/', addFlight);
router.put('/:id', updateFlight as express.RequestHandler);
router.delete('/:id', deleteFlight as express.RequestHandler);
router.get('/search', searchFlights);

export default router;