import { Entity, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Flight } from './Flight';
import { Seat } from './Seat';
import { Reservation } from './Reservation';

@Entity()
export class FlightSeatReservation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Flight, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flight_id' })
  flight!: Flight;

  @ManyToOne(() => Seat, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'seat_id' })
  seat!: Seat;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'reservation_id' })
  reservation!: Reservation | null;

  @Column({ default: false })
  isReserved!: boolean;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;
}