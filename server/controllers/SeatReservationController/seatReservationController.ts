import { Request, Response } from 'express';
import { SeatReservation } from '../../models/SeatReservation';
import { Seat } from '../../models/Seat';
import { Reservation } from '../../models/Reservation';
import { Flight } from '../../models/Flight';

export const getSeatReservations = async (req: Request, res: Response) => {
  try {
    const seatReservations = await SeatReservation.find({
      relations: ['seat', 'reservation', 'flight']
    });
    res.json(seatReservations);
  } catch (error) {
    console.error('Failed to fetch seat reservations:', error);
    res.status(500).json({ message: 'Failed to fetch seat reservations' });
  }
};

export const getSeatReservationById = async (req: Request, res: Response) => {
  try {
    const seatReservation = await SeatReservation.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['seat', 'reservation', 'flight']
    });
    
    if (!seatReservation) {
      return res.status(404).json({ message: 'Seat reservation not found' });
    }
    
    res.json(seatReservation);
  } catch (error) {
    console.error('Failed to fetch seat reservation:', error);
    res.status(500).json({ message: 'Failed to fetch seat reservation' });
  }
};

export const getSeatReservationsByFlight = async (req: Request, res: Response) => {
  try {
    const seatReservations = await SeatReservation.find({
      where: { flight: { id: req.params.flightId } },
      relations: ['seat', 'reservation', 'flight']
    });
    
    res.json(seatReservations);
  } catch (error) {
    console.error('Failed to fetch seat reservations by flight:', error);
    res.status(500).json({ message: 'Failed to fetch seat reservations by flight' });
  }
};

export const getSeatReservationsByReservation = async (req: Request, res: Response) => {
  try {
    const seatReservations = await SeatReservation.find({
      where: { reservation: { id: req.params.reservationId } },
      relations: ['seat', 'reservation', 'flight']
    });
    
    res.json(seatReservations);
  } catch (error) {
    console.error('Failed to fetch seat reservations by reservation:', error);
    res.status(500).json({ message: 'Failed to fetch seat reservations by reservation' });
  }
};

export const createSeatReservation = async (req: Request, res: Response) => {
  try {
    const { seatId, reservationId, flightId } = req.body;
    
    // Check if seat exists
    const seat = await Seat.findOneBy({ idSeat: seatId });
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }
    
    // Check if reservation exists
    const reservation = await Reservation.findOneBy({ id: reservationId });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }
    
    // Check if flight exists
    const flight = await Flight.findOneBy({ id: flightId });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    // Check if seat is already reserved for this flight
    const existingSeatReservation = await SeatReservation.findOne({
      where: {
        seat: { idSeat: seatId },
        flight: { id: flightId }
      }
    });
    
    if (existingSeatReservation) {
      return res.status(400).json({ message: 'This seat is already reserved for this flight' });
    }
    
    // Create new seat reservation
    const seatReservation = new SeatReservation();
    seatReservation.seat = seat;
    seatReservation.reservation = reservation;
    seatReservation.flight = flight;
    
    await seatReservation.save();
    
    // Update seat availability
    seat.availability = false;
    await seat.save();
    
    res.status(201).json(seatReservation);
  } catch (error) {
    console.error('Failed to create seat reservation:', error);
    res.status(500).json({ message: 'Failed to create seat reservation' });
  }
};

export const deleteSeatReservation = async (req: Request, res: Response) => {
  try {
    const seatReservation = await SeatReservation.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['seat']
    });
    
    if (!seatReservation) {
      return res.status(404).json({ message: 'Seat reservation not found' });
    }
    
    // Update seat availability
    const seat = seatReservation.seat;
    seat.availability = true;
    await seat.save();
    
    await seatReservation.remove();
    
    res.status(200).json({ message: 'Seat reservation deleted successfully' });
  } catch (error) {
    console.error('Failed to delete seat reservation:', error);
    res.status(500).json({ message: 'Failed to delete seat reservation' });
  }
};