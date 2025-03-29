import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Location } from './Location';
import { Flight } from './Flight';

@Entity()
export class Airport extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: false })
  nom!: string;

  @Column('varchar', { nullable: false })
  code!: string;

  @Column('varchar', { nullable: false })
  pays!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('boolean', { default: true })
  est_actif!: boolean;

  // Add relation to Location
  @ManyToOne(() => Location, { eager: true })
  @JoinColumn({ name: 'location_id' })
  location!: Location;

  // Fix the reverse relations for flights
  @OneToMany(() => Flight, flight => flight.airport_depart)
  departing_flights!: Flight[];

  @OneToMany(() => Flight, flight => flight.arrival_airport)
  arriving_flights!: Flight[];
}