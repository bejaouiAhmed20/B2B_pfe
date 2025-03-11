import express from 'express';
import {
  getReservations,
  getReservationById,
  addReservation,
  updateReservation,
  deleteReservation,
} from '../../controllers/ReservationController/ReservationController'; // Assure-toi d'importer correctement les méthodes

const router = express.Router();

// Route pour récupérer toutes les réservations
router.get('/', getReservations);

// Route pour récupérer une réservation par son ID
router.get('/:id', getReservationById as express.RequestHandler);

// Route pour ajouter une réservation
router.post('/',addReservation as express.RequestHandler );

// Route pour mettre à jour une réservation
router.put('/:id', updateReservation as express.RequestHandler);

// Route pour supprimer une réservation
router.delete('/:id', deleteReservation as express.RequestHandler);

export default router;