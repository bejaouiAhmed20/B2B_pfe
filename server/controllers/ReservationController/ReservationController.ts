import { Request, Response } from 'express';
import { Reservation } from '../../models/Reservation';
import { User } from '../../models/User';
import { Flight } from '../../models/Flight';
import { FlightSeatReservation } from '../../models/FlightSeatReservation';
import { Compte } from '../../models/Compte';
import { Seat } from '../../models/Seat';
import nodemailer from 'nodemailer';
import { Contract } from '../../models/Contract';
import { Not, IsNull, EntityManager } from 'typeorm'; // Add this import line

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
        relations: ['user', 'flight', 'flight.plane'],
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
      relations: ['user', 'flight', 'flight.plane', 'flight.plane.seats'],
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // Check if flight data is missing
    if (!reservation.flight) {
      console.log(`Warning: Reservation ${reservation.id} has missing flight data`);
    }

    // Get seat reservations for this reservation
    // Add null checks before accessing properties
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
      discount_amount,
      class_type,
      fare_type,
      fare_multiplier,
      use_contract_price,
      fixed_price,
      allocated_seats
    } = req.body;

    // Verify user exists
    const user = await User.findOneBy({ id: user_id });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Verify flight exists
    const flight = await Flight.findOneBy({ id: flight_id });
    if (!flight) {
      return res.status(404).json({ message: "Vol non trouvé" });
    }

    // Find the user's account
    const compte = await Compte.findOne({
      where: { user: { id: user_id } }
    });

    if (!compte) {
      return res.status(404).json({ message: "Compte utilisateur non trouvé" });
    }

    // Calculate the final price based on contract price if applicable
    let finalPrice = prix_total;
    if (use_contract_price && fixed_price) {
      const actualFareMultiplier = fare_multiplier || 1.0;
      console.log(`Using contract fixed price: ${fixed_price} with fare multiplier: ${actualFareMultiplier}`);
      finalPrice = fixed_price * actualFareMultiplier * nombre_passagers;
      console.log(`Calculated final price: ${fixed_price} * ${actualFareMultiplier} * ${nombre_passagers} = ${finalPrice}`);
    }

    // Check if user has sufficient balance
    if (compte.solde < finalPrice) {
      return res.status(400).json({ message: "Solde insuffisant pour effectuer cette réservation" });
    }

    // Create reservation object
    const reservationData: any = {
      date_reservation,
      statut,
      prix_total: finalPrice, // Use the calculated final price
      nombre_passagers,
      user,
      flight,
      discount_amount: discount_amount || 0,
      class_type: class_type || 'economy',
      fare_type: fare_type || 'light'
    };

    // Deduct the reservation price from the user's account
    compte.solde -= finalPrice;
    await compte.save();

    // Create the reservation
    const reservation = Reservation.create(reservationData);
    await reservation.save();

    // If seats were allocated, mark them as reserved
    const createdSeatReservations = [];
    if (allocated_seats && allocated_seats.length > 0) {
      for (const seatInfo of allocated_seats) {
        const seatId = typeof seatInfo === 'object' ? seatInfo.id : seatInfo;
        const seatIdNum = typeof seatId === 'string' ? parseInt(seatId) : seatId;

        const seat = await Seat.findOneBy({ idSeat: seatIdNum });

        if (seat) {
          // Find the FlightSeatReservation record
          const flightSeatReservation = await FlightSeatReservation.findOne({
            where: {
              flight: { id: flight_id },
              seat: { idSeat: seatIdNum }
            }
          });

          if (flightSeatReservation) {
            // Update the record to mark it as reserved and link to this reservation
            flightSeatReservation.isReserved = true;
            flightSeatReservation.reservation = reservation;
            await flightSeatReservation.save();
            createdSeatReservations.push(flightSeatReservation);
          }
        }
      }

      console.log(`Reserved ${createdSeatReservations.length} seats for reservation ${reservation.id}`);
    }

    // Return the reservation with allocated seats info
    res.status(201).json({
      ...reservation,
      allocatedSeats: createdSeatReservations.length > 0 ?
        createdSeatReservations.map(sr => ({
          id: sr.seat.idSeat,
          seatNumber: sr.seat.seatNumber,
          classType: sr.seat.classType
        })) : []
    });
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

    // Remove this section about coupon
    // let couponEntity = undefined;
    // if (coupon) {
    //   couponEntity = await Coupon.findOne({ where: { code: coupon } });
    // }

    // Met à jour la réservation
    if (date_reservation) reservation.date_reservation = date_reservation;
    if (statut) reservation.statut = statut;
    if (prix_total) reservation.prix_total = prix_total;
    if (nombre_passagers) reservation.nombre_passagers = nombre_passagers;
    if (user) reservation.user = user;
    if (flight) reservation.flight = flight;
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
      relations: ['user', 'flight'] // Removed coupon relation
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
      relations: ['user', 'flight', 'flight.plane'],
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
    console.log(`isRefundEligible type: ${typeof isRefundEligible}, value: ${isRefundEligible}`);

    // Find the reservation with user relation
    const reservation = await Reservation.findOne({
      where: { id: reservationId },
      relations: ['user', 'flight']
    });

    if (!reservation) {
      return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // Vérifier si la réservation est déjà annulée
    if (reservation.statut === 'Annulée') {
      return res.status(400).json({ message: "Cette réservation est déjà annulée" });
    }

    // Process refund if eligible - convert to boolean to handle string values
    const shouldRefund = isRefundEligible === true || isRefundEligible === 'true';
    console.log(`Should refund? ${shouldRefund}`);

    let refundSuccess = false;
    let newBalance = 0;

    if (shouldRefund) {
      console.log(`Processing refund for reservation ${reservationId}`);

      try {
        // Utiliser l'endpoint dédié pour le remboursement
        const refundAmount = parseFloat(reservation.prix_total.toString());
        const userId = reservation.user.id;

        console.log(`Appel de l'endpoint de remboursement: userId=${userId}, amount=${refundAmount}`);

        // Appeler directement la fonction de remboursement au lieu de passer par l'API
        // pour éviter les problèmes de réseau interne
        const compteController = require('../../controllers/CompteController/compteController');

        // Créer une requête et une réponse simulées
        const mockReq = {
          body: {
            userId: userId,
            amount: refundAmount
          },
          headers: {
            authorization: req.headers.authorization
          }
        };

        let refundResult: any = null;
        const mockRes = {
          json: (data: any) => {
            refundResult = data;
            return mockRes;
          },
          status: (code: number) => mockRes
        };

        // Appeler directement la fonction de remboursement
        await compteController.refundReservation(mockReq, mockRes);

        console.log('Réponse du service de remboursement:', refundResult);

        if (refundResult && refundResult.success) {
          // Le remboursement a réussi
          refundSuccess = true;
          newBalance = parseFloat(refundResult.compte.solde.toString());
          console.log(`Remboursement réussi via l'appel direct. Nouveau solde: ${newBalance}`);

          // Mettre à jour le statut de la réservation
          reservation.statut = 'Annulée';
          await reservation.save();

          // Libérer les sièges
          const seatReservations = await FlightSeatReservation.find({
            where: { reservation: { id: reservationId } },
            relations: ['seat']
          });

          for (const seatRes of seatReservations) {
            seatRes.isReserved = false;
            seatRes.reservation = null;
            await seatRes.save();
          }
        } else {
          throw new Error('Le service de remboursement a échoué');
        }
      } catch (refundError) {
        console.error('Erreur lors du remboursement via l\'API:', refundError);

        // Méthode de secours: utiliser une transaction directe
        try {
          console.log('Tentative de remboursement via transaction directe...');

          // Utiliser getRepository pour accéder au manager
          await Reservation.getRepository().manager.transaction(async (transactionalEntityManager: EntityManager) => {
            // Récupérer le compte de l'utilisateur dans la transaction
            const compte = await transactionalEntityManager.findOne(Compte, {
              where: { user: { id: reservation.user.id } }
            });

            if (!compte) {
              throw new Error(`Compte non trouvé pour l'utilisateur ${reservation.user.id}`);
            }

            // Convertir les valeurs en nombres pour éviter les problèmes de type
            const refundAmount = parseFloat(reservation.prix_total.toString());
            const currentBalance = parseFloat(compte.solde.toString());

            console.log(`Montant du remboursement: ${refundAmount}, Solde actuel: ${currentBalance}`);

            // Mettre à jour le solde directement
            newBalance = currentBalance + refundAmount;
            compte.solde = newBalance;

            // Sauvegarder les modifications dans la transaction
            await transactionalEntityManager.save(compte);

            // Mettre à jour le statut de la réservation dans la transaction
            reservation.statut = 'Annulée';
            await transactionalEntityManager.save(reservation);

            // Libérer les sièges dans la transaction
            const seatReservations = await transactionalEntityManager.find(FlightSeatReservation, {
              where: { reservation: { id: reservationId } },
              relations: ['seat']
            });

            for (const seatRes of seatReservations) {
              seatRes.isReserved = false;
              seatRes.reservation = null;
              await transactionalEntityManager.save(seatRes);
            }
          });

          // Vérifier que le remboursement a bien été effectué
          const updatedCompte = await Compte.findOne({
            where: { user: { id: reservation.user.id } }
          });

          if (updatedCompte) {
            console.log(`Vérification du nouveau solde après transaction: ${updatedCompte.solde}`);
            newBalance = parseFloat(updatedCompte.solde.toString());
            refundSuccess = true;
          }
        } catch (transactionError) {
          console.error('Échec de la transaction directe:', transactionError);

          // Dernière tentative: mise à jour directe via SQL
          try {
            console.log('Dernière tentative: mise à jour directe via SQL...');

            const refundAmount = parseFloat(reservation.prix_total.toString());
            await Compte.query(`
              UPDATE compte
              SET solde = solde + ${refundAmount}
              WHERE user_id = '${reservation.user.id}'
            `);

            // Mettre à jour le statut de la réservation
            reservation.statut = 'Annulée';
            await reservation.save();

            // Libérer les sièges
            const seatReservations = await FlightSeatReservation.find({
              where: { reservation: { id: reservationId } },
              relations: ['seat']
            });

            for (const seatRes of seatReservations) {
              seatRes.isReserved = false;
              seatRes.reservation = null;
              await seatRes.save();
            }

            // Vérifier le nouveau solde
            const updatedCompte = await Compte.findOne({
              where: { user: { id: reservation.user.id } }
            });

            if (updatedCompte) {
              console.log(`Vérification du nouveau solde après SQL direct: ${updatedCompte.solde}`);
              newBalance = parseFloat(updatedCompte.solde.toString());
              refundSuccess = true;
            }
          } catch (sqlError) {
            console.error('Échec de toutes les tentatives de remboursement:', sqlError);
            // Continuer avec l'annulation même si le remboursement échoue
            reservation.statut = 'Annulée';
            await reservation.save();
          }
        }
      }
    } else {
      console.log(`No refund processed for reservation ${reservationId} (not eligible)`);

      // Mettre à jour le statut de la réservation
      reservation.statut = 'Annulée';
      await reservation.save();

      // Libérer les sièges
      const seatReservations = await FlightSeatReservation.find({
        where: { reservation: { id: reservationId } },
        relations: ['seat']
      });

      for (const seatRes of seatReservations) {
        seatRes.isReserved = false;
        seatRes.reservation = null;
        await seatRes.save();
      }
    }

    // Préparer la réponse
    const responseMessage = shouldRefund
      ? refundSuccess
        ? `Réservation annulée avec succès. Un remboursement de ${reservation.prix_total} DT a été effectué sur votre compte. Nouveau solde: ${newBalance} DT.`
        : "Réservation annulée avec succès, mais le remboursement n'a pas pu être effectué. Veuillez contacter le service client."
      : "Réservation annulée avec succès. Aucun remboursement n'est applicable selon les conditions tarifaires.";

    res.json({
      ...reservation,
      message: responseMessage,
      refundSuccess: shouldRefund ? refundSuccess : null,
      newBalance: refundSuccess ? newBalance : null
    });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ message: "Une erreur s'est produite lors de l'annulation de la réservation" });
  }
};

// Create a new reservation
export const createReservation = async (req: Request, res: Response) => {
  try {
    console.log("Creating new reservation");
    const {
      nombre_passagers,
      prix_total,
      user_id,
      flight_id,
      discount_amount,
      class_type,
      fare_type,
      use_contract_price,
      allocated_seats // Add this parameter to receive seat IDs
    } = req.body;

    // Find the user
    const user = await User.findOneBy({ id: user_id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the flight
    const flight = await Flight.findOneBy({ id: flight_id });
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // Find the user's account
    const compte = await Compte.findOne({
      where: { user: { id: user_id } }
    });

    if (!compte) {
      return res.status(404).json({ message: "Compte utilisateur non trouvé" });
    }

    // Check if user has an active contract with fixed price
    let finalPrice = prix_total;
    if (use_contract_price) {
      const activeContract = await Contract.findOne({
        where: {
          client: { id: user_id },
          isActive: true,
          fixedTicketPrice: Not(IsNull())
        }
      });

      if (activeContract && activeContract.fixedTicketPrice) {
        // Get the fare multiplier from the request
        const fareMultiplier = req.body.fare_multiplier || 1.0;
        console.log(`Using contract fixed price: ${activeContract.fixedTicketPrice} with fare multiplier: ${fareMultiplier}`);
        console.log(`Request body:`, req.body);

        // Apply the fare multiplier to the fixed price
        finalPrice = activeContract.fixedTicketPrice * fareMultiplier * nombre_passagers;
        console.log(`Calculated final price: ${activeContract.fixedTicketPrice} * ${fareMultiplier} * ${nombre_passagers} = ${finalPrice}`);
      } else {
        console.log("No active contract with fixed price found, using standard price calculation");
      }
    }

    // Check if user has sufficient balance
    if (compte.solde < finalPrice) {
      return res.status(400).json({ message: "Solde insuffisant pour effectuer cette réservation" });
    }

    // Create the reservation
    const reservation = new Reservation();
    reservation.date_reservation = new Date();
    reservation.statut = req.body.statut || "confirmée"; // Utiliser la même casse que le frontend
    reservation.prix_total = finalPrice;
    reservation.nombre_passagers = nombre_passagers;
    reservation.user = user;
    reservation.flight = flight;
    reservation.class_type = class_type || 'economy';
    reservation.fare_type = fare_type || 'light'; // Utiliser 'light' comme valeur par défaut

    // Log the fare multiplier and final price for debugging
    console.log(`Creating reservation with fare_type: ${fare_type}, class_type: ${class_type}, fare_multiplier: ${req.body.fare_multiplier}, final price: ${finalPrice}`);

    // Set discount amount directly if provided
    if (discount_amount) {
      reservation.discount_amount = discount_amount;
    }

    // Deduct the reservation price from the user's account
    compte.solde -= finalPrice;
    await compte.save();

    await reservation.save();

    // If seats were allocated, mark them as reserved
    const createdSeatReservations = [];
    if (allocated_seats && allocated_seats.length > 0) {
      for (const seatId of allocated_seats) {
        // Convert seatId to number if it's a string
        const seatIdNum = typeof seatId === 'object' ? seatId.id :
                         typeof seatId === 'string' ? parseInt(seatId) : seatId;

        const seat = await Seat.findOneBy({ idSeat: seatIdNum });

        if (seat) {
          // Find the FlightSeatReservation record
          const flightSeatReservation = await FlightSeatReservation.findOne({
            where: {
              flight: { id: flight_id },
              seat: { idSeat: seatIdNum }
            }
          });

          if (flightSeatReservation) {
            // Update the record to mark it as reserved and link to this reservation
            flightSeatReservation.isReserved = true;
            flightSeatReservation.reservation = reservation;
            await flightSeatReservation.save();
            createdSeatReservations.push(flightSeatReservation);
          } else {
            // If no FlightSeatReservation record exists, create one
            const newFlightSeatReservation = new FlightSeatReservation();
            newFlightSeatReservation.flight = flight;
            newFlightSeatReservation.seat = seat;
            newFlightSeatReservation.reservation = reservation;
            newFlightSeatReservation.isReserved = true;
            await newFlightSeatReservation.save();
            createdSeatReservations.push(newFlightSeatReservation);
          }
        }
      }

      console.log(`Reserved ${createdSeatReservations.length} seats for reservation ${reservation.id}`);
    }

    // Return the reservation with allocated seats info
    res.status(201).json({
      ...reservation,
      allocatedSeats: createdSeatReservations.length > 0 ?
        createdSeatReservations.map(sr => ({
          id: sr.seat.idSeat,
          seatNumber: sr.seat.seatNumber,
          classType: sr.seat.classType
        })) : []
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ message: 'Error creating reservation' });
  }
};

