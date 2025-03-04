import express from 'express';
import { getLocations, addLocation, updateLocation, deleteLocation, getLocationById } from '../../controllers/LocationController/locationController';

const router = express.Router();

router.get('/', getLocations);
router.get('/:id', getLocationById as express.RequestHandler);
router.post('/', addLocation);
router.put('/:id', updateLocation as express.RequestHandler);
router.delete('/:id', deleteLocation as express.RequestHandler);

export default router;