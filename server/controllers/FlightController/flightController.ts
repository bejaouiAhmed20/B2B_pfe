import { Request, Response } from 'express';
import { Flight } from '../../models/Flight';
import { Airport } from '../../models/Airport';
import { Plane } from '../../models/Plane';
import { Reservation } from '../../models/Reservation';
import { Seat } from '../../models/Seat';
import { SeatReservation } from '../../models/SeatReservation';
import { FlightSeatReservation } from '../../models/FlightSeatReservation';

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
      relations: ['airport_depart', 'arrival_airport', 'plane', 'plane.seats']
    });
    
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    
    // Add seat availability information
    const reservedSeatIds = await getReservedSeatIds(req.params.id);
    const availableSeats = flight.plane?.seats?.filter(seat => !reservedSeatIds.includes(seat.idSeat)) || [];
    
    const economySeats = availableSeats.filter(seat => seat.classType === 'economy').length;
    const businessSeats = availableSeats.filter(seat => seat.classType === 'business').length;
    
    // Add seat availability to the response
    const flightWithSeats = {
      ...flight,
      availableSeats: {
        economy: economySeats,
        business: businessSeats,
        total: availableSeats.length
      }
    };
    
    res.json(flightWithSeats);
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

// Add these new functions to your flightController.ts

export const getFlightSeats = async (req: Request, res: Response) => {
  try {
    const flightId = req.params.id;
    
    // Find the flight with its plane and seats
    const flight = await Flight.findOne({
      where: { id: flightId },
      relations: ['plane', 'plane.seats']
    });
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    // Count available seats by class
    const allSeats = flight.plane.seats || [];
    console.log('All seats:', allSeats.length, allSeats); // Debug log
    
    const reservedSeatIds = await getReservedSeatIds(flightId);
    console.log('Reserved seat IDs:', reservedSeatIds); // Debug log
    
    const availableSeats = allSeats.filter(seat => !reservedSeatIds.includes(seat.idSeat));
    console.log('Available seats:', availableSeats.length); // Debug log
    
    const economySeats = availableSeats.filter(seat => seat.classType === 'economy').length;
    const businessSeats = availableSeats.filter(seat => seat.classType === 'business').length;
    const firstClassSeats = availableSeats.filter(seat => seat.classType === 'first').length;
    
    console.log(`Economy: ${economySeats}, Business: ${businessSeats}, First: ${firstClassSeats}`); // Debug log
    
    res.json({
      totalSeats: allSeats.length,
      economySeats,
      businessSeats,
      firstClassSeats,
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
    console.log(`Getting reserved seat IDs for flight ${flightId}`);
    
    // Find all flight seat reservations for this flight
    const flightSeatReservations = await FlightSeatReservation.find({
      where: { 
        flight: { id: flightId },
        isReserved: true 
      },
      relations: ['seat']
    });
    
    console.log(`Found ${flightSeatReservations.length} seat reservations for flight ${flightId}`);
    
    if (flightSeatReservations.length === 0) {
      console.log('No seat reservations found');
      return [];
    }
    
    // Extract seat IDs from the flight seat reservations
    const seatIds = flightSeatReservations
      .filter(fsr => fsr.seat && fsr.seat.idSeat) // Make sure seat exists
      .map(fsr => fsr.seat.idSeat);
      
    console.log('Reserved seat IDs:', seatIds);
    return seatIds;
  } catch (error) {
    console.error('Error getting reserved seat IDs:', error);
    return [];
  }
};

// Update the allocateSeats function
// Let's modify the allocateSeats function to add more debugging and ensure proper saving

export const allocateSeats = async (req: Request, res: Response) => {
  try {
    const flightId = req.params.id;
    const { numberOfSeats, classType, reservationId } = req.body;
    
    console.log(`Allocating ${numberOfSeats} ${classType} seats for flight ${flightId}, reservation ${reservationId}`);
    
    // Find the flight with its plane and seats
    const flight = await Flight.findOne({
      where: { id: flightId },
      relations: ['plane', 'plane.seats']
    });
    
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    // Get reserved seat IDs for this flight
    const reservedSeatIds = await getReservedSeatIds(flightId);
    console.log('Currently reserved seat IDs:', reservedSeatIds);
    
    // Filter available seats by class
    const availableSeats = flight.plane.seats
      .filter(seat => !reservedSeatIds.includes(seat.idSeat) && seat.classType === classType);
    
    console.log(`Found ${availableSeats.length} available ${classType} seats`);
    
    if (availableSeats.length < numberOfSeats) {
      return res.status(400).json({ 
        message: `Not enough ${classType} seats available. Only ${availableSeats.length} seats left.` 
      });
    }
    
    // Randomly select seats
    const shuffledSeats = availableSeats.sort(() => 0.5 - Math.random());
    const allocatedSeats = shuffledSeats.slice(0, numberOfSeats);
    
    console.log(`Allocated ${allocatedSeats.length} seats:`, allocatedSeats.map(s => s.idSeat));
    
    // If reservationId is provided, create flight seat reservations
    if (reservationId) {
      const reservation = await Reservation.findOneBy({ id: reservationId });
      if (!reservation) {
        return res.status(404).json({ message: 'Reservation not found' });
      }
      
      console.log(`Creating seat reservations for reservation ${reservationId}`);
      
      // Create flight seat reservations
      const createdReservations = [];
      for (const seat of allocatedSeats) {
        try {
          const flightSeatReservation = new FlightSeatReservation();
          flightSeatReservation.flight = flight;
          flightSeatReservation.reservation = reservation;
          flightSeatReservation.seat = seat;
          flightSeatReservation.isReserved = true;
          
          const savedReservation = await flightSeatReservation.save();
          console.log(`Created seat reservation: ${savedReservation.id} for seat ${seat.idSeat}`);
          createdReservations.push(savedReservation);
        } catch (error) {
          console.error(`Error saving seat reservation for seat ${seat.idSeat}:`, error);
        }
      }
      
      console.log(`Successfully created ${createdReservations.length} seat reservations`);
      
      // Return the created reservations along with the allocated seats
      return res.json({
        message: 'Seats allocated and reserved successfully',
        allocatedSeats,
        seatReservations: createdReservations,
        remainingSeats: availableSeats.length - numberOfSeats
      });
    }
    
    res.json({
      allocatedSeats,
      remainingSeats: availableSeats.length - numberOfSeats
    });
  } catch (error) {
    console.error('Error allocating seats:', error);
    res.status(500).json({ message: 'Error allocating seats' });
  }
};

// Update the createSeatReservations function
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
      const seat = await Seat.findOneBy({ idSeat: seatId });
      if (!seat) {
        return res.status(404).json({ message: `Seat with ID ${seatId} not found` });
      }
      
      // Check if seat is already reserved for this flight
      const existingReservation = await FlightSeatReservation.findOne({
        where: {
          flight: { id: flightId },
          seat: { idSeat: seatId },
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
      flightSeatReservation.isReserved = true;
      
      await flightSeatReservation.save();
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