import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Airport } from './Airport';
import { Plane } from './Plane';
import { Reservation } from './Reservation';
import { FlightSeatReservation } from './FlightSeatReservation';

@Entity()
export class Flight extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: false })
  titre!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  prix!: number;

  @Column('datetime')
  date_depart!: Date;

  @Column('datetime')
  date_retour!: Date;

  @Column('varchar', { nullable: true })
  duree!: string;

  @Column('boolean', { default: false })
  aller_retour!: boolean;
  
  // Optional: Add these fields if you want to track separate return flight details
  @Column('datetime', { nullable: true })
  retour_depart_date!: Date | null;
  
  @Column('datetime', { nullable: true })
  retour_arrive_date!: Date | null;

  @ManyToOne(() => Airport)
  @JoinColumn({ name: 'airport_depart_id' })
  airport_depart!: Airport;

  @ManyToOne(() => Airport)
  @JoinColumn({ name: 'airport_arrivee_id' })
  arrival_airport!: Airport;

  @ManyToOne(() => Plane)
  @JoinColumn({ name: 'plane_id' })
  plane!: Plane;

  // Add the missing relationship to Reservation
  @OneToMany(() => Reservation, reservation => reservation.flight)
  reservations!: Reservation[];

  @Column('varchar', { default: 'active' })
  status!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  image_url!: string;
  
  // Add relationship to FlightSeatReservation
  @OneToMany(() => FlightSeatReservation, flightSeatReservation => flightSeatReservation.flight)
  seatReservations!: FlightSeatReservation[];
}

