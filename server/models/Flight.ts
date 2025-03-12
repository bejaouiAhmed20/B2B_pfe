import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Reservation } from './Reservation';
import { Airport } from './Airport';

@Entity()
export class Flight extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: false })
  titre!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  prix!: number;

  @Column('datetime', { nullable: false })
  date_depart!: Date;

  @Column('datetime', { nullable: false })
  date_retour!: Date;

  // Remove these string columns as they'll be replaced by relations
  // @Column('varchar', { nullable: false })
  // ville_depart!: string;

  // @Column('varchar', { nullable: false })
  // ville_arrivee!: string;

  @Column('varchar', { nullable: false })
  compagnie_aerienne!: string;

  @Column('varchar', { nullable: false })
  duree!: string;

  // Add relations to Airport for departure and arrival
  @ManyToOne(() => Airport, { eager: true })
  @JoinColumn({ name: 'airport_depart_id' })
  airport_depart!: Airport;

  @ManyToOne(() => Airport, { eager: true })
  @JoinColumn({ name: 'airport_arrivee_id' })
  airport_arrivee!: Airport;

  @OneToMany(() => Reservation, (reservation) => reservation.flight)
  reservations!: Reservation[];
}


