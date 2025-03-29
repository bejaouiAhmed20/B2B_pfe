import express from 'express';
import { getPlanes, getPlaneById, addPlane, updatePlane, deletePlane } from '../../controllers/PlaneController/planeController';

const router = express.Router();

// GET all planes
router.get('/', getPlanes);

// GET a specific plane by ID
router.get('/:id', getPlaneById as express.RequestHandler);

// POST a new plane
router.post('/', addPlane);

// PUT (update) an existing plane
router.put('/:id', updatePlane as express.RequestHandler);

// DELETE a plane
router.delete('/:id', deletePlane as express.RequestHandler);

export default router;