import { Request, Response } from 'express';
import { Seat } from '../../models/Seat';
import { Plane } from '../../models/Plane';

export const getSeats = async (req: Request, res: Response) => {
  try {
    const seats = await Seat.find({
      relations: ['plane']
    });
    res.json(seats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch seats" });
  }
};

export const getSeatById = async (req: Request, res: Response) => {
  try {
    const seat = await Seat.findOne({
      where: { idSeat: parseInt(req.params.id) },
      relations: ['plane']
    });
    
    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }
    
    res.json(seat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch seat" });
  }
};

export const addSeat = async (req: Request, res: Response) => {
  try {
    const { seatNumber, classType, availability, idPlane } = req.body;

    // Find the plane
    const plane = await Plane.findOneBy({ idPlane });
    if (!plane) {
      return res.status(404).json({ message: "Plane not found" });
    }

    // Create a new seat
    const seat = new Seat();
    seat.seatNumber = seatNumber;
    seat.classType = classType;
    seat.availability = availability;
    seat.plane = plane;

    await seat.save();
    res.status(201).json(seat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to add seat" });
  }
};

export const updateSeat = async (req: Request, res: Response) => {
  try {
    const seat = await Seat.findOneBy({ idSeat: parseInt(req.params.id) });
    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }

    const { seatNumber, classType, availability, idPlane } = req.body;

    // Update seat properties
    if (seatNumber) seat.seatNumber = seatNumber;
    if (classType) seat.classType = classType;
    if (availability !== undefined) seat.availability = availability;

    // Update plane if provided
    if (idPlane) {
      const plane = await Plane.findOneBy({ idPlane });
      if (!plane) {
        return res.status(404).json({ message: "Plane not found" });
      }
      seat.plane = plane;
    }

    await seat.save();
    res.json(seat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update seat" });
  }
};

export const deleteSeat = async (req: Request, res: Response) => {
  try {
    const seat = await Seat.findOneBy({ idSeat: parseInt(req.params.id) });
    
    if (!seat) {
      return res.status(404).json({ message: "Seat not found" });
    }
    
    await seat.remove();
    res.status(200).json({ message: "Seat deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete seat" });
  }
};