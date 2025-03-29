import { Entity, PrimaryGeneratedColumn, BaseEntity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { Flight } from './Flight';
import { Seat } from './Seat';
import { Reservation } from './Reservation';

@Entity()
export class FlightSeatReservation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Flight, { onDelete: 'CASCADE' })
  @JoinColumn()
  flight!: Flight;

  @ManyToOne(() => Seat, { onDelete: 'CASCADE' })
  @JoinColumn()
  seat!: Seat;

  @ManyToOne(() => Reservation, { onDelete: 'CASCADE' })
  @JoinColumn()
  reservation!: Reservation;

  @Column({ type: 'boolean', default: true })
  isReserved!: boolean;
}