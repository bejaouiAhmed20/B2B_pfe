import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Airport } from './Airport';
import { Plane } from './Plane';
import { Reservation } from './Reservation';

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
}

