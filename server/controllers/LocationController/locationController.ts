import { Request, Response } from 'express';
import { Location } from '../../models/Location';

export const getLocations = async (req: Request, res: Response) => {
  try {
    const locations = await Location.find();
    res.json(locations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const getLocationById = async (req: Request, res: Response) => {
  try {
    const location = await Location.findOneBy({ id: req.params.id });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    res.json(location);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const addLocation = async (req: Request, res: Response) => {
  try {
    const location = Location.create(req.body);
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const location = await Location.findOneBy({ id: req.params.id });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    Location.merge(location, req.body);
    await location.save();
    res.json(location);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  try {
    const location = await Location.findOneBy({ id: req.params.id });
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }
    await location.remove();
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue" });
  }
};