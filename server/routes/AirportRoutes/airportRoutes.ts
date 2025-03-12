import express from 'express';
import { getAirports, getAirportById, addAirport, updateAirport, deleteAirport } from '../../controllers/AirportController/airportController';

const router = express.Router();

router.get('/', getAirports);
router.get('/:id', getAirportById as express.RequestHandler);
router.post('/', addAirport as express.RequestHandler);
router.put('/:id', updateAirport as express.RequestHandler);
router.delete('/:id', deleteAirport as express.RequestHandler);

export default router;