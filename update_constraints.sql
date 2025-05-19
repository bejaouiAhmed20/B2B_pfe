-- Désactiver temporairement les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS=0;

-- Supprimer la contrainte existante entre Reservation et Flight
ALTER TABLE `reservation` 
DROP FOREIGN KEY `FK_11a1461c53ca38689b1ccd2357a`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `reservation` 
ADD CONSTRAINT `FK_11a1461c53ca38689b1ccd2357a` 
FOREIGN KEY (`flight_id`) 
REFERENCES `flight` (`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre SeatReservation et Flight
ALTER TABLE `seat_reservation` 
DROP FOREIGN KEY `FK_seat_reservation_flight`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `seat_reservation` 
ADD CONSTRAINT `FK_seat_reservation_flight` 
FOREIGN KEY (`flight_id`) 
REFERENCES `flight` (`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre SeatReservation et Reservation
ALTER TABLE `seat_reservation` 
DROP FOREIGN KEY `FK_seat_reservation_reservation`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `seat_reservation` 
ADD CONSTRAINT `FK_seat_reservation_reservation` 
FOREIGN KEY (`reservation_id`) 
REFERENCES `reservation` (`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre SeatReservation et Seat
ALTER TABLE `seat_reservation` 
DROP FOREIGN KEY `FK_seat_reservation_seat`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `seat_reservation` 
ADD CONSTRAINT `FK_seat_reservation_seat` 
FOREIGN KEY (`seat_id`) 
REFERENCES `seat` (`idSeat`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre FlightSeatReservation et Flight
ALTER TABLE `flight_seat_reservation` 
DROP FOREIGN KEY `FK_flight_seat_reservation_flight`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `flight_seat_reservation` 
ADD CONSTRAINT `FK_flight_seat_reservation_flight` 
FOREIGN KEY (`flight_id`) 
REFERENCES `flight` (`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre FlightSeatReservation et Reservation
ALTER TABLE `flight_seat_reservation` 
DROP FOREIGN KEY `FK_flight_seat_reservation_reservation`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `flight_seat_reservation` 
ADD CONSTRAINT `FK_flight_seat_reservation_reservation` 
FOREIGN KEY (`reservation_id`) 
REFERENCES `reservation` (`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre FlightSeatReservation et Seat
ALTER TABLE `flight_seat_reservation` 
DROP FOREIGN KEY `FK_flight_seat_reservation_seat`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `flight_seat_reservation` 
ADD CONSTRAINT `FK_flight_seat_reservation_seat` 
FOREIGN KEY (`seat_id`) 
REFERENCES `seat` (`idSeat`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre Reclamation et User
ALTER TABLE `reclamation` 
DROP FOREIGN KEY `FK_reclamation_user`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `reclamation` 
ADD CONSTRAINT `FK_reclamation_user` 
FOREIGN KEY (`user_id`) 
REFERENCES `user` (`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre Contract et User
ALTER TABLE `contract` 
DROP FOREIGN KEY `FK_contract_user`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `contract` 
ADD CONSTRAINT `FK_contract_user` 
FOREIGN KEY (`client_id`) 
REFERENCES `user` (`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre RequestSolde et User
ALTER TABLE `request_solde` 
DROP FOREIGN KEY `FK_request_solde_user`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `request_solde` 
ADD CONSTRAINT `FK_request_solde_user` 
FOREIGN KEY (`client_id`) 
REFERENCES `user` (`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Supprimer la contrainte existante entre Compte et User
ALTER TABLE `compte` 
DROP FOREIGN KEY `FK_compte_user`;

-- Recréer la contrainte avec ON DELETE CASCADE
ALTER TABLE `compte` 
ADD CONSTRAINT `FK_compte_user` 
FOREIGN KEY (`user_id`) 
REFERENCES `user` (`id`) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS=1;
