import { Request, Response } from 'express';
import { Reservation } from '../../models/Reservation';
import { User } from '../../models/User';
import { Flight } from '../../models/Flight';
import { Coupon } from '../../models/Coupon';
import { FlightSeatReservation } from '../../models/FlightSeatReservation';
import { Seat } from '../../models/Seat';

// Afficher toutes les réservations
export const getReservations = async (req: Request, res: Response) => {
  try {
    console.log("Fetching all reservations");
    const includeRelations = req.query.relations === 'true';
    
    let reservations;
    if (includeRelations) {
      // Load all related entities with more comprehensive relations
      reservations = await Reservation.find({
        relations: ['user', 'flight', 'flight.plane', 'coupon'],
        order: { date_reservation: 'DESC' }
      });
      
      // Log for debugging
      console.log(`Loaded ${reservations.length} reservations with relations`);
      
      // Check for missing flight data
      const missingFlightData = reservations.filter(r => !r.flight || !r.flight.id);
      if (missingFlightData.length > 0) {
        console.log(`Warning: ${missingFlightData.length} reservations have missing flight data`);
        console.log('Reservation IDs with missing flight data:', missingFlightData.map(r => r.id));
      }
    } else {
      reservations = await Reservation.find({
        order: { date_reservation: 'DESC' }
      });
      console.log(`Loaded ${reservations.length} reservations without relations`);
    }
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations' });
  }
};

// Afficher une réservation par son ID
export const getReservationById = async (req: Request, res: Response) => {
  try {
    const reservation = await Reservation.findOne({
      where: { id: req.params.id },
      relations: ['user', 'flight', 'flight.plane', 'flight.plane.seats', 'coupon'],
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // Check if flight data is missing
    if (!reservation.flight) {
      console.log(`Warning: Reservation ${reservation.id} has missing flight data`);
    }

    // Get seat reservations for this reservation
    if (reservation.flight) {
      const seatReservations = await FlightSeatReservation.find({
        where: { 
          reservation: { id: reservation.id },
          flight: { id: reservation.flight.id }
        },
        relations: ['seat']
      });
      
      // Add seat information to the response
      const responseData = {
        ...reservation,
        allocatedSeats: seatReservations.map(sr => ({
          id: sr.seat.idSeat,
          seatNumber: sr.seat.seatNumber,
          classType: sr.seat.classType
        }))
      };
      
      return res.json(responseData);
    }

    res.json(reservation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Ajouter une réservation
export const addReservation = async (req: Request, res: Response) => {
  try {
    const { 
      date_reservation, 
      statut, 
      prix_total, 
      nombre_passagers, 
      user_id, 
      flight_id,
      coupon, // New field for coupon code
      discount_amount, // New field for discount amount
      class_type, // New field for class type
      fare_type // New field for fare type
    } = req.body;

    // Vérifie si l'utilisateur existe
    const user = await User.findOneBy({ id: user_id });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie si le vol existe
    const flight = await Flight.findOneBy({ id: flight_id });
    if (!flight) {
      return res.status(404).json({ message: "Vol non trouvé" });
    }

    // Create reservation object with basic fields
    const reservationData: any = {
      date_reservation,
      statut,
      prix_total,
      nombre_passagers,
      user,
      flight,
      coupon_code: coupon || null,
      discount_amount: discount_amount || 0,
      class_type: class_type || 'economy',
      fare_type: fare_type || 'light'
    };

    // If coupon code is provided, find the coupon and link it
    if (coupon) {
      const couponEntity = await Coupon.findOne({ where: { code: coupon } });
      if (couponEntity) {
        reservationData.coupon = couponEntity;
      }
    }

    // Crée la réservation
    const reservation = Reservation.create(reservationData);

    await reservation.save();
    res.status(201).json(reservation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

// Mettre à jour une réservation
export const updateReservation = async (req: Request, res: Response) => {
  try {
    const { 
      date_reservation, 
      statut, 
      prix_total, 
      nombre_passagers, 
      user_id, 
      flight_id,
      coupon, // New field for coupon code
      discount_amount, // New field for discount amount
      class_type, // New field for class type
      fare_type // New field for fare type
    } = req.body;
    
    // Vérifie si la réservation existe
    const reservation = await Reservation.findOneBy({ id: req.params.id });
    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // Si user_id est fourni, vérifie si l'utilisateur existe
    let user = undefined;
    if (user_id) {
      user = await User.findOneBy({ id: user_id });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
    }

    // Si flight_id est fourni, vérifie si le vol existe
    let flight = undefined;
    if (flight_id) {
      flight = await Flight.findOneBy({ id: flight_id });
      if (!flight) {
        return res.status(404).json({ message: "Vol non trouvé" });
      }
    }

    // Si coupon est fourni, vérifie si le coupon existe
    let couponEntity = undefined;
    if (coupon) {
      couponEntity = await Coupon.findOne({ where: { code: coupon } });
    }

    // Met à jour la réservation
    if (date_reservation) reservation.date_reservation = date_reservation;
    if (statut) reservation.statut = statut;
    if (prix_total) reservation.prix_total = prix_total;
    if (nombre_passagers) reservation.nombre_passagers = nombre_passagers;
    if (user) reservation.user = user;
    if (flight) reservation.flight = flight;
    if (coupon !== undefined) reservation.coupon_code = coupon;
    if (couponEntity) reservation.coupon = couponEntity;
    if (discount_amount !== undefined) reservation.discount_amount = discount_amount;
    if (class_type) reservation.class_type = class_type;
    if (fare_type) reservation.fare_type = fare_type;

    await reservation.save();
    res.json(reservation);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

export const deleteReservation = async (req: Request, res: Response) => {
  try {
    const reservation = await Reservation.findOneBy({ id: req.params.id });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    await reservation.remove();
    res.status(200).json({ message: "Réservation supprimée avec succès" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Une erreur s'est produite" });
  }
};

export const getReservationsByFlightId = async (req: Request, res: Response) => {
  try {
    const flightId = req.params.flightId;
    const reservations = await Reservation.find({
      where: { flight: { id: flightId } },
      relations: ['user', 'flight', 'coupon'] // Added coupon relation
    });
    
    if (reservations.length === 0) {
      return res.status(404).json({ message: "No reservations found for this flight" });
    }
    
    res.json(reservations);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "There is an issue retrieving reservations" });
  }
};

// Update the getReservationsByUserId function to handle potential errors with FlightSeatReservation
export const getReservationsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    console.log(`Fetching reservations for user: ${userId}`);
    
    const reservations = await Reservation.find({
      where: { user: { id: userId } },
      relations: ['user', 'flight', 'flight.plane', 'coupon'],
      order: { date_reservation: 'DESC' }
    });
    
    console.log(`Found ${reservations.length} reservations for user ${userId}`);
    
    if (reservations.length === 0) {
      return res.json([]); // Return empty array instead of 404
    }
    
    // Check for missing flight data
    const missingFlightData = reservations.filter(r => !r.flight || !r.flight.id);
    if (missingFlightData.length > 0) {
      console.log(`Warning: ${missingFlightData.length} reservations for user ${userId} have missing flight data`);
    }
    
    // For each reservation, try to get the seat reservations
    const enhancedReservations = await Promise.all(reservations.map(async (reservation) => {
      try {
        if (reservation.flight) {
          const seatReservations = await FlightSeatReservation.find({
            where: { 
              reservation: { id: reservation.id },
              flight: { id: reservation.flight.id }
            },
            relations: ['seat']
          });
          
          if (seatReservations.length > 0) {
            return {
              ...reservation,
              allocatedSeats: seatReservations.map(sr => ({
                id: sr.seat?.idSeat,
                seatNumber: sr.seat?.seatNumber,
                classType: sr.seat?.classType
              }))
            };
          }
        }
        return reservation;
      } catch (error) {
        console.error(`Error fetching seat reservations for reservation ${reservation.id}:`, error);
        return reservation;
      }
    }));
    
    res.json(enhancedReservations);
  } catch (error) {
    console.error("Error in getReservationsByUserId:", error);
    res.status(500).json({ message: "There is an issue retrieving reservations" });
  }
};

// Remove this entire function and comment
// DELETE THIS ENTIRE FUNCTION BELOW:
// Also update the getReservations function to be more robust
/* export const getReservations = async (req: Request, res: Response) => {
  try {
    console.log("Fetching all reservations");
    const includeRelations = req.query.relations === 'true';
    
    let reservations;
    if (includeRelations) {
      // Load all related entities with more comprehensive relations
      reservations = await Reservation.find({
        relations: ['user', 'flight', 'coupon'],
        order: { date_reservation: 'DESC' }
      });
      
      // Log for debugging
      console.log(`Loaded ${reservations.length} reservations with relations`);
    } else {
      reservations = await Reservation.find({
        order: { date_reservation: 'DESC' }
      });
      console.log(`Loaded ${reservations.length} reservations without relations`);
    }
    
    res.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des réservations' });
  }
}; */

// Updated createReservation function
export const createReservation = async (req: Request, res: Response) => {
  try {
    const { 
      date_reservation, 
      statut, 
      prix_total, 
      nombre_passagers, 
      user_id, 
      flight_id,
      coupon,
      discount_amount,
      class_type, 
      fare_type
    } = req.body;

    // Vérifie si l'utilisateur existe
    const user = await User.findOneBy({ id: user_id });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifie si le vol existe
    const flight = await Flight.findOne({
      where: { id: flight_id },
      relations: ['plane', 'plane.seats']
    });
    
    if (!flight) {
      return res.status(404).json({ message: "Vol non trouvé" });
    }

    // Check if there are enough seats available
    if (!flight.plane || !flight.plane.seats) {
      return res.status(400).json({ message: "Ce vol n'a pas d'avion ou de sièges assignés" });
    }

    // Get already reserved seats for this flight
    const reservedSeats = await FlightSeatReservation.find({
      where: { 
        flight: { id: flight_id },
        isReserved: true 
      },
      relations: ['seat']
    });
    
    const reservedSeatIds = reservedSeats.map(rs => rs.seat.idSeat);
    console.log(`Found ${reservedSeatIds.length} already reserved seats for flight ${flight_id}`);

    // Filter available seats by class
    const availableSeats = flight.plane.seats
      .filter(seat => !reservedSeatIds.includes(seat.idSeat) && seat.classType === (class_type || 'economy'));
    
    console.log(`Found ${availableSeats.length} available ${class_type || 'economy'} seats`);

    if (availableSeats.length < nombre_passagers) {
      return res.status(400).json({ 
        message: `Pas assez de sièges disponibles. Seulement ${availableSeats.length} sièges disponibles.` 
      });
    }

    // Create reservation object with basic fields
    const reservationData: any = {
      date_reservation,
      statut,
      prix_total,
      nombre_passagers,
      user,
      flight,
      coupon_code: coupon || null,
      discount_amount: discount_amount || 0,
      class_type: class_type || 'economy',
      fare_type: fare_type || 'light'
    };

    // If coupon code is provided, find the coupon and link it
    if (coupon) {
      const couponEntity = await Coupon.findOne({ where: { code: coupon } });
      if (couponEntity) {
        reservationData.coupon = couponEntity;
      }
    }

    // Create the reservation
    const reservation = Reservation.create(reservationData);
    await reservation.save();
    console.log(`Created reservation with ID: ${reservation.id}`);

    // Randomly select seats
    const shuffledSeats = availableSeats.sort(() => 0.5 - Math.random());
    const allocatedSeats = shuffledSeats.slice(0, nombre_passagers);
    
    // Create flight seat reservations
    const seatReservations = [];
    for (const seat of allocatedSeats) {
      const flightSeatReservation = new FlightSeatReservation();
      flightSeatReservation.flight = flight;
      flightSeatReservation.reservation = reservation;
      flightSeatReservation.seat = seat;
      flightSeatReservation.isReserved = true;
      
      await flightSeatReservation.save();
      seatReservations.push(flightSeatReservation);
    }
    
    console.log(`Created ${seatReservations.length} seat reservations for reservation ${reservation.id}`);

    // Return the reservation with seat information
    res.status(201).json({
      ...reservation,
      allocatedSeats: allocatedSeats.map(seat => ({
        id: seat.idSeat,
        seatNumber: seat.seatNumber,
        classType: seat.classType
      }))
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors de la création de la réservation" });
  }
};

