import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User'; // Assure-toi d'importer correctement le modèle User
import { Flight } from './Flight'; // Assure-toi d'importer correctement le modèle Flight
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

  // Relation Many-to-One avec l'entité User (chargée automatiquement)
  @ManyToOne(() => User, (user) => user.reservations, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Relation Many-to-One avec l'entité Flight (chargée automatiquement)
  @ManyToOne(() => Flight, (flight) => flight.reservations, { eager: true })
  @JoinColumn({ name: 'flight_id' })
  flight!: Flight;
}