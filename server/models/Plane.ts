import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Seat } from './Seat';
import { Flight } from './Flight';

@Entity()
export class Plane extends BaseEntity {
  @PrimaryGeneratedColumn()
  idPlane!: number;

  @Column('varchar')
  planeModel!: string;

  @Column('int')
  totalSeats!: number;

  @Column('varchar')
  seatConfiguration!: string;

  // Relation One-to-Many with Seat entity
  @OneToMany(() => Seat, (seat) => seat.plane, { cascade: true })
  seats!: Seat[];

  // Relation One-to-Many with Flight entity
  @OneToMany(() => Flight, (flight) => flight.plane, { cascade: true })
  flights!: Flight[];
}