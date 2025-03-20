import express from 'express';
import {
  getReservations,
  getReservationById,
  addReservation,
  updateReservation,
  deleteReservation,
  getReservationsByFlightId,
  getReservationsByUserId
} from '../../controllers/ReservationController/ReservationController';

const router = express.Router();

// Route pour récupérer toutes les réservations
router.get('/', getReservations);

// Route pour récupérer une réservation par son ID
router.get('/:id', getReservationById as express.RequestHandler);

// Route pour ajouter une réservation
router.post('/', addReservation as express.RequestHandler);

// Route pour mettre à jour une réservation
router.put('/:id', updateReservation as express.RequestHandler);

// Route pour supprimer une réservation
router.delete('/:id', deleteReservation as express.RequestHandler);

// Important: These routes need to be placed AFTER the /:id route to avoid conflicts
// Route pour récupérer les réservations par ID de vol
router.get('/flight/:flightId', getReservationsByFlightId as express.RequestHandler);

// Route pour récupérer les réservations par ID d'utilisateur
router.get('/user/:userId', getReservationsByUserId as express.RequestHandler);

export default router;