import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Flight } from './Flight';
import { Coupon } from './Coupon'; // Import the Coupon model

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

  @Column('varchar', { nullable: true })
  coupon_code!: string | null;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, default: 0 })
  discount_amount!: number;

  @Column('varchar', { nullable: false, default: 'economy' })
  class_type!: string;

  @Column('varchar', { nullable: false, default: 'light' })
  fare_type!: string;

  // Relation Many-to-One avec l'entité User
  @ManyToOne(() => User, (user) => user.reservations, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  // Relation Many-to-One avec l'entité Flight
  @ManyToOne(() => Flight, (flight) => flight.reservations, { eager: true })
  @JoinColumn({ name: 'flight_id' })
  flight!: Flight;

  // Relation Many-to-One avec l'entité Coupon (optionnelle)
  @ManyToOne(() => Coupon, { eager: true, nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon | null;
}