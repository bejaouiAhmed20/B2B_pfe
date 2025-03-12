import { Request, Response } from 'express';
import { Airport } from '../../models/Airport';
import { Location } from '../../models/Location';

export const getAirports = async (req: Request, res: Response) => {
  try {
    const airports = await Airport.find({
      relations: ['location']
    });
    res.json(airports);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const getAirportById = async (req: Request, res: Response) => {
  try {
    const airport = await Airport.findOne({
      where: { id: req.params.id },
      relations: ['location']
    });
    
    if (!airport) {
      return res.status(404).json({ message: "Airport not found" });
    }
    
    res.json(airport);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const addAirport = async (req: Request, res: Response) => {
  try {
    const { nom, code, pays, description, est_actif, location_id } = req.body;
    
    // Find the location
    const location = await Location.findOneBy({ id: location_id });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    
    // Create a new airport
    const airport = new Airport();
    airport.nom = nom;
    airport.code = code;
    airport.pays = pays;
    airport.description = description;
    airport.est_actif = est_actif !== undefined ? est_actif : true;
    airport.location = location;
    
    await airport.save();
    res.status(201).json(airport);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const updateAirport = async (req: Request, res: Response) => {
  try {
    const airport = await Airport.findOneBy({ id: req.params.id });
    if (!airport) {
      return res.status(404).json({ message: "Airport not found" });
    }
    
    const { nom, code, pays, description, est_actif, location_id } = req.body;
    
    // Update basic properties
    if (nom) airport.nom = nom;
    if (code) airport.code = code;
    if (pays) airport.pays = pays;
    if (description !== undefined) airport.description = description;
    if (est_actif !== undefined) airport.est_actif = est_actif;
    
    // Update location if provided
    if (location_id) {
      const location = await Location.findOneBy({ id: location_id });
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      airport.location = location;
    }
    
    await airport.save();
    res.json(airport);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const deleteAirport = async (req: Request, res: Response) => {
  try {
    const airport = await Airport.findOneBy({ id: req.params.id });
    
    if (!airport) {
      return res.status(404).json({ message: "Airport not found" });
    }
    
    await airport.remove();
    res.status(200).json({ message: "Airport deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};