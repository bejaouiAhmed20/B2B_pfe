import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Reservation } from './Reservation';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;  

  @Column('varchar', { nullable: false })
  nom!: string;

  @Column('varchar', { unique: true, nullable: false })
  email!: string;

  @Column('varchar', { nullable: true })
  numero_telephone!: string;

  @Column('varchar', { nullable: true })
  pays!: string;

  @Column('varchar', { nullable: true })
  adresse!: string;

  @Column('boolean', { default: false })
  est_admin!: boolean;  

  @Column('varchar', { nullable: false })
  mot_de_passe!: string;

  @OneToMany(() => Reservation, (reservation) => reservation.user)
  reservations!: Reservation[];

}