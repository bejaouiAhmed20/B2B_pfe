import { Request, Response } from 'express';
import { Flight } from '../../models/Flight';
import { Airport } from '../../models/Airport';

export const getFlights = async (req: Request, res: Response) => {
  try {
    const flights = await Flight.find({
      relations: ['airport_depart', 'airport_arrivee']
    });
    res.json(flights);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const getFlightById = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.findOne({
      where: { id: req.params.id },
      relations: ['airport_depart', 'airport_arrivee']
    });
    
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
    const { 
      titre, 
      prix, 
      date_depart, 
      date_retour, 
      compagnie_aerienne, 
      duree,
      airport_depart_id,
      airport_arrivee_id
    } = req.body;

    // Find the departure airport
    const departureAirport = await Airport.findOneBy({ id: airport_depart_id });
    if (!departureAirport) {
      return res.status(404).json({ message: "Departure airport not found" });
    }

    // Find the arrival airport
    const arrivalAirport = await Airport.findOneBy({ id: airport_arrivee_id });
    if (!arrivalAirport) {
      return res.status(404).json({ message: "Arrival airport not found" });
    }

    // Create a new flight
    const flight = new Flight();
    flight.titre = titre;
    flight.prix = prix;
    flight.date_depart = new Date(date_depart);
    flight.date_retour = new Date(date_retour);
    flight.compagnie_aerienne = compagnie_aerienne;
    flight.duree = duree;
    flight.airport_depart = departureAirport;
    flight.airport_arrivee = arrivalAirport;

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

    const { 
      titre, 
      prix, 
      date_depart, 
      date_retour, 
      compagnie_aerienne, 
      duree,
      airport_depart_id,
      airport_arrivee_id
    } = req.body;

    // Update basic properties
    if (titre) flight.titre = titre;
    if (prix) flight.prix = prix;
    if (date_depart) flight.date_depart = new Date(date_depart);
    if (date_retour) flight.date_retour = new Date(date_retour);
    if (compagnie_aerienne) flight.compagnie_aerienne = compagnie_aerienne;
    if (duree) flight.duree = duree;

    // Update departure airport if provided
    if (airport_depart_id) {
      const departureAirport = await Airport.findOneBy({ id: airport_depart_id });
      if (!departureAirport) {
        return res.status(404).json({ message: "Departure airport not found" });
      }
      flight.airport_depart = departureAirport;
    }

    // Update arrival airport if provided
    if (airport_arrivee_id) {
      const arrivalAirport = await Airport.findOneBy({ id: airport_arrivee_id });
      if (!arrivalAirport) {
        return res.status(404).json({ message: "Arrival airport not found" });
      }
      flight.airport_arrivee = arrivalAirport;
    }

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