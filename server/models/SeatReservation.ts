import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Seat } from './Seat';
import { Reservation } from './Reservation';
import { Flight } from './Flight';

@Entity()
@Unique(['seat', 'flight']) // Ensure a seat can only be reserved once per flight
export class SeatReservation extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  // Relation Many-to-One with Seat entity
  @ManyToOne(() => Seat, (seat) => seat.seatReservations)
  @JoinColumn({ name: 'seat_id' })
  seat!: Seat;

  // Relation Many-to-One with Reservation entity
  @ManyToOne(() => Reservation, (reservation) => reservation.seatReservations)
  @JoinColumn({ name: 'reservation_id' })
  reservation!: Reservation;

  // Relation Many-to-One with Flight entity
  @ManyToOne(() => Flight)
  @JoinColumn({ name: 'flight_id' })
  flight!: Flight;
}