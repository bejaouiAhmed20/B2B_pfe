import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, OneToOne } from 'typeorm';
import { Reservation } from './Reservation';
import { Reclamation } from './Reclamation';
import { Contract } from './Contract';
import { RequestSolde } from './RequestSolde';
import { Compte } from './Compte';

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

  @OneToMany(() => Reservation, (reservation) => reservation.user, { cascade: true })
  reservations!: Reservation[];

  @OneToMany(() => Reclamation, (reclamation) => reclamation.user, { cascade: true })
  reclamations!: Reclamation[];

  @OneToMany(() => Contract, (contract) => contract.client, { cascade: true })
  contracts!: Contract[];

  @OneToMany(() => RequestSolde, (requestSolde) => requestSolde.client, { cascade: true })
  requestSoldes!: RequestSolde[];

  @OneToOne(() => Compte, (compte) => compte.user, { cascade: true })
  compte!: Compte;
}