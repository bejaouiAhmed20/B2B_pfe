import { Request, Response } from 'express';
import { Reservation } from '../../models/Reservation';
import { User } from '../../models/User';
import { Flight } from '../../models/Flight';
import { Coupon } from '../../models/Coupon';
import { FlightSeatReservation } from '../../models/FlightSeatReservation';
import { Seat } from '../../models/Seat';
import nodemailer from 'nodemailer';

// Helper functions for email formatting
const formatDateFr = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatEuro = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Create email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-password'
  }
});

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

// Add this new function for cancelling a reservation
export const cancelReservation = async (req: Request, res: Response) => {
  try {
    const reservationId = req.params.id;
    const { isRefundEligible } = req.body;
    
    console.log(`Cancelling reservation ${reservationId}, refund eligible: ${isRefundEligible}`);
    
    // Find the reservation
    const reservation = await Reservation.findOne({
      where: { id: reservationId },
      relations: ['user', 'flight']
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // Update the reservation status to cancelled
    reservation.statut = 'Annulée';
    
    // Process refund if eligible
    if (isRefundEligible) {
      console.log(`Processing refund for reservation ${reservationId}`);
      // Here you would typically integrate with a payment gateway
      // For now, we'll just log it
    }

    await reservation.save();
    
    // Release the reserved seats
    await FlightSeatReservation.update(
      { reservation: { id: reservationId } },
      { isReserved: false }
    );
    
    res.json({
      ...reservation,
      message: isRefundEligible 
        ? "Réservation annulée avec succès. Un remboursement sera effectué." 
        : "Réservation annulée avec succès. Aucun remboursement n'est applicable."
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors de l'annulation de la réservation" });
  }
};

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

    // Send confirmation email to the client
    try {
      if (user.email) {
        console.log(`Sending reservation confirmation email to ${user.email}`);
        
        // Format dates for email
        const dateReservation = formatDateFr(new Date(date_reservation));
        const dateDepart = flight.date_depart ? formatDateFr(new Date(flight.date_depart)) : 'Non spécifiée';
        const dateArrivee = flight.date_retour ? formatDateFr(new Date(flight.date_retour)) : 'Non spécifiée';
        
        // Format price
        const prixFormatted = formatEuro(parseFloat(prix_total.toString()));
        
        // Create HTML email content
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #CC0A2B; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .details { background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-radius: 5px; }
              .success { color: #4CAF50; font-weight: bold; }
              .footer { font-size: 12px; text-align: center; margin-top: 30px; color: #666; }
              .seats { margin-top: 10px; }
              .seat { display: inline-block; margin-right: 10px; background-color: #e0e0e0; padding: 5px 10px; border-radius: 3px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Tunisair B2B</h1>
              </div>
              <div class="content">
                <h2>Confirmation de Réservation</h2>
                <p>Bonjour ${user.nom || 'Client'},</p>
                <p>Nous vous confirmons que votre réservation a été <span class="success">effectuée avec succès</span>.</p>
                
                <div class="details">
                  <h3>Détails de la réservation:</h3>
                  <p><strong>Numéro de réservation:</strong> ${reservation.id}</p>
                  <p><strong>Date de réservation:</strong> ${dateReservation}</p>
                  <p><strong>Statut:</strong> <span class="success">${statut}</span></p>
                  <p><strong>Prix total:</strong> ${prixFormatted}</p>
                  <p><strong>Nombre de passagers:</strong> ${nombre_passagers}</p>
                  <p><strong>Classe:</strong> ${class_type || 'Économique'}</p>
                  <p><strong>Type de tarif:</strong> ${fare_type || 'Light'}</p>
                </div>
                
                <div class="details">
                  <h3>Détails du vol:</h3>
                  <p><strong>Vol:</strong> ${flight.titre || 'N/A'}</p>
                  <p><strong>Date de départ:</strong> ${dateDepart}</p>
                  <p><strong>Date d'arrivée:</strong> ${dateArrivee}</p>
                </div>
                
                <div class="details">
                  <h3>Sièges attribués:</h3>
                  <div class="seats">
                    ${allocatedSeats.map(seat => `<span class="seat">${seat.seatNumber}</span>`).join(' ')}
                  </div>
                </div>
                
                <p>Nous vous remercions pour votre confiance et vous souhaitons un excellent voyage.</p>
                <p>Cordialement,<br>L'équipe Tunisair B2B</p>
              </div>
              <div class="footer">
                <p>Ceci est un email automatique, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        // Send the email
        const mailResult = await emailTransporter.sendMail({
          from: process.env.EMAIL_USER || 'noreply@tunisairb2b.com',
          to: user.email,
          subject: 'Tunisair B2B - Confirmation de votre réservation',
          html: htmlContent
        });
        
        console.log('Reservation confirmation email sent successfully:', mailResult.messageId);
      } else {
        console.log('User email not found, skipping confirmation email');
      }
    } catch (emailError) {
      console.error('Failed to send reservation confirmation email:', emailError);
      // Continue with the process even if email fails
    }

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

