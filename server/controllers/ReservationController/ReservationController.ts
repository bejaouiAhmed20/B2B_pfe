import { Request, Response } from 'express';
import { Reservation } from '../../models/Reservation';
import { User } from '../../models/User';
import { Flight } from '../../models/Flight';

// Afficher toutes les réservations
export const getReservations = async (req: Request, res: Response) => {
  try {
    const reservations = await Reservation.find({
      relations: ['user', 'flight'], // Charge les relations User et Flight
    });
    res.json(reservations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Afficher une réservation par son ID
export const getReservationById = async (req: Request, res: Response) => {
  try {
    const reservation = await Reservation.findOne({
      where: { id: req.params.id },
      relations: ['user', 'flight'], // Charge les relations User et Flight
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    res.json(reservation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Ajouter une réservation
export const addReservation = async (req: Request, res: Response) => {
  try {
    const { date_reservation, statut, prix_total, nombre_passagers, user_id, flight_id } = req.body;

    // Vérifie si l'utilisateur existe
    const user = await User.findOneBy({ id: user_id });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie si le vol existe
    const flight = await Flight.findOneBy({ id: flight_id });
    if (!flight) {
      return res.status(404).json({ message: "Vol non trouvé" });
    }

    // Crée la réservation
    const reservation = Reservation.create({
      date_reservation,
      statut,
      prix_total,
      nombre_passagers,
      user,
      flight,
    });

    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Mettre à jour une réservation
export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { date_reservation, statut, prix_total, nombre_passagers, user_id, flight_id } = req.body;
    
    // Vérifie si la réservation existe
    const reservation = await Reservation.findOneBy({ id: req.params.id });
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // Si user_id est fourni, vérifie si l'utilisateur existe
    let user = undefined;
    if (user_id) {
      user = await User.findOneBy({ id: user_id });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
    }

    // Si flight_id est fourni, vérifie si le vol existe
    let flight = undefined;
    if (flight_id) {
      flight = await Flight.findOneBy({ id: flight_id });
      if (!flight) {
        return res.status(404).json({ message: "Vol non trouvé" });
      }
    }

    // Met à jour la réservation
    if (date_reservation) reservation.date_reservation = date_reservation;
    if (statut) reservation.statut = statut;
    if (prix_total) reservation.prix_total = prix_total;
    if (nombre_passagers) reservation.nombre_passagers = nombre_passagers;
    if (user) reservation.user = user;
    if (flight) reservation.flight = flight;

    await reservation.save();
    res.json(reservation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const reservation = await Reservation.findOneBy({ id: req.params.id });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    await reservation.remove();
    res.status(200).json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

export const getReservationsByFlightId = async (req: Request, res: Response) => {
  try {
    const flightId = req.params.flightId;
    const reservations = await Reservation.find({
      where: { flight: { id: flightId } },
      relations: ['user', 'flight']
    });
    
    if (reservations.length === 0) {
      return res.status(404).json({ message: "No reservations found for this flight" });
    }
    
    res.json(reservations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue retrieving reservations" });
  }
};

export const getReservationsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const reservations = await Reservation.find({
      where: { user: { id: userId } },
      relations: ['user', 'flight']
    });
    
    if (reservations.length === 0) {
      return res.status(404).json({ message: "No reservations found for this user" });
    }
    
    res.json(reservations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue retrieving reservations" });
  }
};

