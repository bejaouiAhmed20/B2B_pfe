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