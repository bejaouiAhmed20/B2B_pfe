import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Coupon } from './Coupon';

@Entity()
export class Contract extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 100 })
  clientType!: string; // Type de client

  @ManyToOne(() => User, (user) => user.contracts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: User; // Liste (Client name)

  @Column('varchar', { length: 255 })
  label!: string; // Libellé (Contract label/name)

  @Column('date')
  contractStartDate!: Date; // Date Contrat Début

  @Column('date')
  contractEndDate!: Date; // Date Contrat Fin

  @Column('decimal', { precision: 10, scale: 2 })
  guaranteedMinimum!: number; // Minimum Garanti

  @Column('date')
  travelStartDate!: Date; // Date de Voyage Début

  @Column('date')
  travelEndDate!: Date; // Date de Voyage Fin

  @Column('boolean', { default: false })
  isActive!: boolean; // Actif

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  modifiedFeeAmount!: number | null; // Modifier le Montant des Frais (Optionnel)



  @Column('integer', { nullable: true })
  minTimeBeforeBalanceFlight!: number | null; // Temps Minimum Avant Vol Balance (in hours)

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  invoiceStamp!: number | null; // Timbre de Facture

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  finalClientAdditionalFees!: number | null; // Frais Supplémentaires Client Final

  // New field for fixed ticket price
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  fixedTicketPrice!: number | null; // Prix fixe pour tous les billets

  // Changed from ManyToMany to ManyToOne relation with Coupon
  @ManyToOne(() => Coupon, { nullable: true })
  @JoinColumn({ name: 'coupon_id' })
  coupon!: Coupon | null;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}