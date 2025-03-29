import { Request, Response } from 'express';
import { Plane } from '../../models/Plane';

export const getPlanes = async (req: Request, res: Response) => {
  try {
    const planes = await Plane.find({
      relations: ['seats', 'flights']
    });
    res.json(planes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch planes" });
  }
};

export const getPlaneById = async (req: Request, res: Response) => {
  try {
    const plane = await Plane.findOne({
      where: { idPlane: parseInt(req.params.id) },
      relations: ['seats', 'flights']
    });
    
    if (!plane) {
      return res.status(404).json({ message: "Plane not found" });
    }
    
    res.json(plane);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch plane" });
  }
};

export const addPlane = async (req: Request, res: Response) => {
  try {
    const { planeModel, totalSeats, seatConfiguration } = req.body;

    // Create a new plane
    const plane = new Plane();
    plane.planeModel = planeModel;
    plane.totalSeats = totalSeats;
    plane.seatConfiguration = seatConfiguration;

    await plane.save();
    res.status(201).json(plane);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add plane" });
  }
};

export const updatePlane = async (req: Request, res: Response) => {
  try {
    const plane = await Plane.findOneBy({ idPlane: parseInt(req.params.id) });
    if (!plane) {
      return res.status(404).json({ message: "Plane not found" });
    }

    const { planeModel, totalSeats, seatConfiguration } = req.body;

    // Update plane properties
    if (planeModel) plane.planeModel = planeModel;
    if (totalSeats) plane.totalSeats = totalSeats;
    if (seatConfiguration) plane.seatConfiguration = seatConfiguration;

    await plane.save();
    res.json(plane);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update plane" });
  }
};

export const deletePlane = async (req: Request, res: Response) => {
  try {
    const plane = await Plane.findOneBy({ idPlane: parseInt(req.params.id) });
    
    if (!plane) {
      return res.status(404).json({ message: "Plane not found" });
    }
    
    await plane.remove();
    res.status(200).json({ message: "Plane deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete plane" });
  }
};