import express from 'express';
import { getSeats, getSeatById, addSeat, updateSeat, deleteSeat } from '../../controllers/SeatController/seatController';

const router = express.Router();

// GET all seats
router.get('/', getSeats);

// GET a specific seat by ID
router.get('/:id', getSeatById as express.RequestHandler);

// POST a new seat
router.post('/', addSeat as express.RequestHandler);

// PUT (update) an existing seat
router.put('/:id', updateSeat as express.RequestHandler);

// DELETE a seat
router.delete('/:id', deleteSeat as express.RequestHandler);

export default router;