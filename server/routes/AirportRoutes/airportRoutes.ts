import express from 'express';
import { getAirports, addAirport, updateAirport, deleteAirport, getAirportById } from '../../controllers/AirportController/airportController';

const router = express.Router();

router.get('/', getAirports);
router.get('/:id', getAirportById as express.RequestHandler);
router.post('/', addAirport);
router.put('/:id', updateAirport as express.RequestHandler);
router.delete('/:id', deleteAirport as express.RequestHandler);

export default router;