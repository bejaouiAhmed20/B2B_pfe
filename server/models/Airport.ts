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

  // Remove this as it will be provided by the Location relation
  // @Column('varchar', { nullable: false })
  // ville!: string;

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

  // Add reverse relations for flights
  @OneToMany(() => Flight, flight => flight.airport_depart)
  departing_flights!: Flight[];

  @OneToMany(() => Flight, flight => flight.airport_arrivee)
  arriving_flights!: Flight[];
}