import { Request, Response } from 'express';
import { Flight } from '../../models/Flight';

export const getFlights = async (req: Request, res: Response) => {
  try {
    const flights = await Flight.find();
    res.json(flights);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const getFlightById = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.findOneBy({ id: req.params.id });
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    res.json(flight);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const addFlight = async (req: Request, res: Response) => {
  try {
    const flight = Flight.create(req.body);
    await flight.save();
    res.status(201).json(flight);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const updateFlight = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.findOneBy({ id: req.params.id });
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    
    Flight.merge(flight, req.body);
    await flight.save();
    res.json(flight);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const deleteFlight = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.findOneBy({ id: req.params.id });
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    
    await flight.remove();
    res.status(200).json({ message: "Flight deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const searchFlights = async (req: Request, res: Response) => {
  try {
    const {
      titre,
      prix_min,
      prix_max,
      date_depart_debut,
      date_depart_fin,
      date_retour_debut,
      date_retour_fin,
      ville_depart,
      ville_arrivee,
      compagnie_aerienne,
      duree
    } = req.query;

    const queryBuilder = Flight.createQueryBuilder('flight');

    if (titre) {
      queryBuilder.andWhere('flight.titre LIKE :titre', { titre: `%${titre}%` });
    }

    if (prix_min) {
      queryBuilder.andWhere('flight.prix >= :prix_min', { prix_min: Number(prix_min) });
    }

    if (prix_max) {
      queryBuilder.andWhere('flight.prix <= :prix_max', { prix_max: Number(prix_max) });
    }

    if (date_depart_debut) {
      queryBuilder.andWhere('flight.date_depart >= :date_depart_debut', { date_depart_debut: new Date(date_depart_debut as string) });
    }

    if (date_depart_fin) {
      queryBuilder.andWhere('flight.date_depart <= :date_depart_fin', { date_depart_fin: new Date(date_depart_fin as string) });
    }

    if (date_retour_debut) {
      queryBuilder.andWhere('flight.date_retour >= :date_retour_debut', { date_retour_debut: new Date(date_retour_debut as string) });
    }

    if (date_retour_fin) {
      queryBuilder.andWhere('flight.date_retour <= :date_retour_fin', { date_retour_fin: new Date(date_retour_fin as string) });
    }

    if (ville_depart) {
      queryBuilder.andWhere('flight.ville_depart LIKE :ville_depart', { ville_depart: `%${ville_depart}%` });
    }

    if (ville_arrivee) {
      queryBuilder.andWhere('flight.ville_arrivee LIKE :ville_arrivee', { ville_arrivee: `%${ville_arrivee}%` });
    }

    if (compagnie_aerienne) {
      queryBuilder.andWhere('flight.compagnie_aerienne LIKE :compagnie_aerienne', { compagnie_aerienne: `%${compagnie_aerienne}%` });
    }

    if (duree) {
      queryBuilder.andWhere('flight.duree LIKE :duree', { duree: `%${duree}%` });
    }

    const flights = await queryBuilder.getMany();
    res.json(flights);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};