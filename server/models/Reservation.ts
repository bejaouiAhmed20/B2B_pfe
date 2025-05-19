import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Flight } from './Flight';
import { SeatReservation } from './SeatReservation';

@Entity()
export class Reservation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('datetime', { nullable: false })
  date_reservation!: Date;

  @Column('varchar', { nullable: false })
  statut!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  prix_total!: number;

  @Column('int', { nullable: false })
  nombre_passagers!: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, default: 0 })
  discount_amount!: number;

  @Column('varchar', { nullable: false, default: 'economy' })
  class_type!: string;

  @Column('varchar', { nullable: false, default: 'light' })
  fare_type!: string;

  // Relation Many-to-One avec l'entité User
  @ManyToOne(() => User, (user) => user.reservations, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Relation Many-to-One avec l'entité Flight
  @ManyToOne(() => Flight, (flight) => flight.reservations, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flight_id' })
  flight!: Flight;

  // Relation One-to-Many with SeatReservation entity
  @OneToMany(() => SeatReservation, (seatReservation) => seatReservation.reservation, { cascade: true })
  seatReservations!: SeatReservation[];
}