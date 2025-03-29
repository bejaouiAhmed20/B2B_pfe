import { Request, Response } from 'express';
import { Flight } from '../../models/Flight';
import { Airport } from '../../models/Airport';
import { Plane } from '../../models/Plane';

export const getFlights = async (req: Request, res: Response) => {
  try {
    const flights = await Flight.find({
      relations: ['airport_depart', 'arrival_airport', 'plane']
    });
    res.json(flights);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const getFlightById = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.findOne({
      where: { id: req.params.id },
      relations: ['airport_depart', 'arrival_airport', 'plane']
    });
    
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    
    res.json(flight);
  } catch (error) {
    console.error(error);
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
      duree,
      airport_depart_id,
      airport_arrivee_id,
      plane_id
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

    // Find the plane
    const plane = await Plane.findOneBy({ idPlane: plane_id });
    if (!plane) {
      return res.status(404).json({ message: "Plane not found" });
    }

    // Create a new flight
    const flight = new Flight();
    flight.titre = titre;
    flight.prix = prix;
    flight.date_depart = new Date(date_depart);
    flight.date_retour = new Date(date_retour);
    flight.duree = duree;
    flight.airport_depart = departureAirport;
    flight.arrival_airport = arrivalAirport;
    flight.plane = plane;

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
      duree,
      airport_depart_id,
      airport_arrivee_id,
      plane_id
    } = req.body;

    // Update basic properties
    if (titre) flight.titre = titre;
    if (prix) flight.prix = prix;
    if (date_depart) flight.date_depart = new Date(date_depart);
    if (date_retour) flight.date_retour = new Date(date_retour);
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
      flight.arrival_airport = arrivalAirport;
    }

    // Update plane if provided
    if (plane_id) {
      const plane = await Plane.findOneBy({ idPlane: plane_id });
      if (!plane) {
        return res.status(404).json({ message: "Plane not found" });
      }
      flight.plane = plane;
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

export const assignPlaneToFlight = async (req: Request, res: Response) => {
  try {
    const { flightId, planeId } = req.body;
    
    const flight = await Flight.findOneBy({ id: flightId });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    const plane = await Plane.findOneBy({ idPlane: planeId });
    if (!plane) {
      return res.status(404).json({ message: 'Plane not found' });
    }
    
    flight.plane = plane;
    await flight.save();
    
    res.status(200).json({ message: 'Plane assigned to flight successfully', flight });
  } catch (error) {
    console.error('Failed to assign plane to flight:', error);
    res.status(500).json({ message: 'Failed to assign plane to flight' });
  }
};