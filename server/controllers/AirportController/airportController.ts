import { Request, Response } from 'express';
import { Airport } from '../../models/Airport';

export const getAirports = async (req: Request, res: Response) => {
  try {
    const airports = await Airport.find();
    res.json(airports);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const getAirportById = async (req: Request, res: Response) => {
  try {
    const airport = await Airport.findOneBy({ id: req.params.id });
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
    const airport = Airport.create(req.body);
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
    Airport.merge(airport, req.body);
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