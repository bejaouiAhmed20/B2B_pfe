import { Request, Response } from 'express';
import { Flight } from '../../models/Flight';
import { Airport } from '../../models/Airport';
import { Plane } from '../../models/Plane';
import { Reservation } from '../../models/Reservation';
import { Seat } from '../../models/Seat';
import { SeatReservation } from '../../models/SeatReservation';
import { FlightSeatReservation } from '../../models/FlightSeatReservation';
import fs from 'fs';
import path from 'path';

import { MoreThan } from 'typeorm';
export const getFlights = async (req: Request, res: Response) => {
  try {
    const now = new Date();

    const flights = await Flight.find({
      where: {
        date_depart: MoreThan(now)
      },
      relations: ['airport_depart', 'arrival_airport', 'plane']
    });

    res.json(flights);
  } catch (error) {
    console.error('Error fetching flights:', error);
    res.status(500).json({ message: "There is an issue" });
  }
};


export const getFlightById = async (req: Request, res: Response) => {
  try {
    const flight = await Flight.findOne({
      where: { id: req.params.id },
      relations: ['airport_depart', 'arrival_airport', 'plane', 'plane.seats', 'seatReservations', 'seatReservations.seat']
    });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // Get all seats for this flight
    const allSeats = flight.plane?.seats || [];

    // Get reserved seats using FlightSeatReservation
    const reservedSeats = flight.seatReservations?.filter(sr => sr.isReserved) || [];
    const reservedSeatIds = reservedSeats.map(sr => sr.seat.idSeat);

    // Calculate available seats
    const availableSeats = allSeats.filter(seat => !reservedSeatIds.includes(seat.idSeat));

    // Count seats by class
    const economySeats = availableSeats.filter(seat => seat.classType === 'economy').length;
    const businessSeats = availableSeats.filter(seat => seat.classType === 'business').length;
    const firstClassSeats = availableSeats.filter(seat => seat.classType === 'first').length;

    // Add seat availability to the response
    const flightWithSeats = {
      ...flight,
      availableSeats: {
        economy: economySeats,
        business: businessSeats,
        first: firstClassSeats,
        total: availableSeats.length
      }
    };

    res.json(flightWithSeats);

    console.log('Flight ID:', req.params.id);
    console.log('All seats count:', allSeats.length);
    console.log('Reserved seats count:', reservedSeats.length);
    console.log('Available seats count:', availableSeats.length);
    console.log('Economy seats:', economySeats);
    console.log('Business seats:', businessSeats);
    console.log('First class seats:', firstClassSeats);
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
      plane_id,
      aller_retour,
      retour_depart_date,
      retour_arrive_date
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
    flight.aller_retour = aller_retour === 'true' || aller_retour === true;

    // Set return flight details if it's a round trip
    if (flight.aller_retour) {
      if (retour_depart_date) {
        flight.retour_depart_date = new Date(retour_depart_date);
      }
      if (retour_arrive_date) {
        flight.retour_arrive_date = new Date(retour_arrive_date);
      }
    }

    // Handle image upload
    if (req.file) {
      // Save the relative path to the image
      flight.image_url = `/uploads/${req.file.filename}`;
    }

    await flight.save();

    // Get all seats for this plane
    const seats = await Seat.find({
      where: { plane: { idPlane: plane_id } }
    });

    // Create flight seat reservation records for each seat
    const flightSeatReservations = [];
    for (const seat of seats) {
      const flightSeatReservation = new FlightSeatReservation();
      flightSeatReservation.flight = flight;
      flightSeatReservation.seat = seat;
      flightSeatReservation.isReserved = false; // Initially not reserved

      await flightSeatReservation.save();
      flightSeatReservations.push(flightSeatReservation);
    }

    console.log(`Created ${flightSeatReservations.length} seat reservation records for flight ${flight.id}`);

    res.status(201).json({
      ...flight,
      seatReservationsCreated: flightSeatReservations.length
    });
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
      plane_id,
      aller_retour,
      retour_depart_date,
      retour_arrive_date
    } = req.body;

    // Update basic properties
    if (titre) flight.titre = titre;
    if (prix) flight.prix = prix;
    if (date_depart) flight.date_depart = new Date(date_depart);
    if (date_retour) flight.date_retour = new Date(date_retour);
    if (duree) flight.duree = duree;

    // Update aller_retour status
    if (aller_retour !== undefined) {
      flight.aller_retour = aller_retour === 'true' || aller_retour === true;

      // Update return flight details if it's a round trip
      if (flight.aller_retour) {
        if (retour_depart_date) {
          flight.retour_depart_date = new Date(retour_depart_date);
        }
        if (retour_arrive_date) {
          flight.retour_arrive_date = new Date(retour_arrive_date);
        }
      } else {
        // Clear return flight details if it's not a round trip
        flight.retour_depart_date = null;
        flight.retour_arrive_date = null;
      }
    }

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

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (flight.image_url) {
        const oldImagePath = path.join(__dirname, '../../../', flight.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save the relative path to the new image
      flight.image_url = `/uploads/${req.file.filename}`;
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

    // Delete associated image if exists
    if (flight.image_url) {
      const imagePath = path.join(__dirname, '../../../', flight.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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

// Add these new functions to your flightController.ts

export const getFlightSeats = async (req: Request, res: Response) => {
  try {
    const flightId = req.params.id;

    // Find the flight with its plane, seats, and seat reservations
    const flight = await Flight.findOne({
      where: { id: flightId },
      relations: ['plane', 'plane.seats', 'seatReservations', 'seatReservations.seat']
    });

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Get all seats for this flight
    const allSeats = flight.plane.seats || [];

    // Get reserved seats using FlightSeatReservation
    const reservedSeats = flight.seatReservations?.filter(sr => sr.isReserved) || [];
    const reservedSeatIds = reservedSeats.map(sr => sr.seat.idSeat);

    // Calculate available seats
    const availableSeats = allSeats.filter(seat => !reservedSeatIds.includes(seat.idSeat));

    // Count seats by class
    const economySeats = availableSeats.filter(seat => seat.classType === 'economy').length;
    const businessSeats = availableSeats.filter(seat => seat.classType === 'business').length;
    const firstClassSeats = availableSeats.filter(seat => seat.classType === 'first').length;

    res.json({
      totalSeats: allSeats.length,
      economy: economySeats,
      business: businessSeats,
      first: firstClassSeats,
      economySeats,  // Keep for backward compatibility
      businessSeats, // Keep for backward compatibility
      firstClassSeats, // Keep for backward compatibility
      availableSeats
    });
  } catch (error) {
    console.error('Error getting flight seats:', error);
    res.status(500).json({ message: 'Error getting flight seats' });
  }
};

// Helper function to get reserved seat IDs for a flight
const getReservedSeatIds = async (flightId: string): Promise<number[]> => {
  try {
    // Find the flight with its seat reservations
    const flight = await Flight.findOne({
      where: { id: flightId },
      relations: ['seatReservations', 'seatReservations.seat']
    });

    if (!flight || !flight.seatReservations) {
      return [];
    }

    // Filter reserved seats and map to seat IDs
    return flight.seatReservations
      .filter(reservation => reservation.isReserved)
      .map(reservation => reservation.seat.idSeat);
  } catch (error) {
    console.error('Error getting reserved seats:', error);
    return [];
  }
};

// New endpoint to allocate seats for a reservation
export const allocateSeats = async (req: Request, res: Response) => {
  try {
    const { id: flightId } = req.params;
    const { numberOfSeats, classType, reservationId } = req.body;

    if (!numberOfSeats || !classType || !reservationId) {
      return res.status(400).json({ message: 'Number of seats, class type, and reservation ID are required' });
    }

    // Find the flight with its plane, seats, and seat reservations
    const flight = await Flight.findOne({
      where: { id: flightId },
      relations: ['plane', 'plane.seats', 'seatReservations', 'seatReservations.seat']
    });

    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Find the reservation
    const reservation = await Reservation.findOneBy({ id: reservationId });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Get all seats for this flight
    const allSeats = flight.plane?.seats || [];

    // Get reserved seats using FlightSeatReservation
    const reservedSeats = flight.seatReservations?.filter(sr => sr.isReserved) || [];
    const reservedSeatIds = reservedSeats.map(sr => sr.seat.idSeat);

    // Find available seats of the requested class
    const availableSeats = allSeats.filter(
      seat => !reservedSeatIds.includes(seat.idSeat) && seat.classType === classType
    );

    console.log(`Allocating seats - Class: ${classType}, Requested: ${numberOfSeats}, Available: ${availableSeats.length}`);

    if (availableSeats.length < Number(numberOfSeats)) {
      return res.status(400).json({
        message: `Not enough ${classType} seats available. Only ${availableSeats.length} seats left.`
      });
    }

    // Randomly select the required number of seats
    const shuffledSeats = [...availableSeats].sort(() => 0.5 - Math.random());
    const allocatedSeats = shuffledSeats.slice(0, Number(numberOfSeats));

    // Create flight seat reservations for the allocated seats
    const createdReservations = [];

    for (const seat of allocatedSeats) {
      // Find the existing FlightSeatReservation record for this seat
      const flightSeatReservation = await FlightSeatReservation.findOne({
        where: {
          flight: { id: flightId },
          seat: { idSeat: seat.idSeat }
        }
      });

      if (flightSeatReservation) {
        // Update the existing record
        flightSeatReservation.reservation = reservation;
        flightSeatReservation.isReserved = true;
        await flightSeatReservation.save();
        createdReservations.push(flightSeatReservation);
      } else {
        // Create a new record if one doesn't exist
        const newFlightSeatReservation = new FlightSeatReservation();
        newFlightSeatReservation.flight = flight;
        newFlightSeatReservation.seat = seat;
        newFlightSeatReservation.reservation = reservation;
        newFlightSeatReservation.isReserved = true;

        await newFlightSeatReservation.save();
        createdReservations.push(newFlightSeatReservation);
      }

      console.log(`Reserved seat ${seat.seatNumber} (ID: ${seat.idSeat}) for reservation ${reservationId}`);
    }

    // Return the allocated seat information
    res.status(200).json({
      message: 'Seats allocated successfully',
      allocatedSeats: allocatedSeats.map(seat => ({
        id: seat.idSeat,
        seatNumber: seat.seatNumber,
        classType: seat.classType
      })),
      reservationId: reservationId
    });

  } catch (error) {
    console.error('Error allocating seats:', error);
    res.status(500).json({ message: 'Failed to allocate seats' });
  }
};

export const createSeatReservations = async (req: Request, res: Response) => {
  try {
    const { flightId, reservationId, seatIds } = req.body;

    // Validate input
    if (!flightId || !reservationId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Find the flight
    const flight = await Flight.findOneBy({ id: flightId });
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Find the reservation
    const reservation = await Reservation.findOneBy({ id: reservationId });
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Create flight seat reservations
    const createdReservations = [];

    for (const seatId of seatIds) {
      // Convert seatId to number if it's a string
      const seatIdNum = typeof seatId === 'string' ? parseInt(seatId) : seatId;

      const seat = await Seat.findOneBy({ idSeat: seatIdNum });
      if (!seat) {
        return res.status(404).json({ message: `Seat with ID ${seatId} not found` });
      }

      // Check if seat is already reserved for this flight
      const existingReservation = await FlightSeatReservation.findOne({
        where: {
          flight: { id: flightId },
          seat: { idSeat: seatIdNum },
          isReserved: true
        }
      });

      if (existingReservation) {
        return res.status(400).json({
          message: `Seat ${seatId} is already reserved for this flight`,
          reservedSeats: createdReservations
        });
      }

      // Create new flight seat reservation
      const flightSeatReservation = new FlightSeatReservation();
      flightSeatReservation.flight = flight;
      flightSeatReservation.reservation = reservation;
      flightSeatReservation.seat = seat;
      flightSeatReservation.isReserved = true; // Make sure this is set to true

      await flightSeatReservation.save();
      console.log(`Created reservation for seat ${seatId}, isReserved: ${flightSeatReservation.isReserved}`);
      createdReservations.push(flightSeatReservation);
    }

    res.status(201).json({
      message: 'Seat reservations created successfully',
      seatReservations: createdReservations
    });
  } catch (error) {
    console.error('Error creating seat reservations:', error);
    res.status(500).json({ message: 'Error creating seat reservations' });
  }
};