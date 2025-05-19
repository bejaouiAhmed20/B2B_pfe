import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Plane } from './Plane';
import { SeatReservation } from './SeatReservation';

@Entity()
export class Seat extends BaseEntity {
  @PrimaryGeneratedColumn()
  idSeat!: number;

  @Column('varchar')
  seatNumber!: string;

  @Column('enum', { enum: ['economy', 'business', 'first'] })
  classType!: string;

  @Column('boolean', { default: true })
  availability!: boolean;

  // Relation Many-to-One with Plane entity
  @ManyToOne(() => Plane, (plane) => plane.seats)
  @JoinColumn({ name: 'idPlane' })
  plane!: Plane;

  // Relation One-to-Many with SeatReservation entity
  @OneToMany(() => SeatReservation, (seatReservation) => seatReservation.seat, { cascade: true })
  seatReservations!: SeatReservation[];
}