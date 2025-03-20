import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Contract extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 100 })
  clientType!: string; // Type de client

  @ManyToOne(() => User)
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

  @Column('boolean', { default: false })
  enableInternetFees!: boolean; // Activer les Frais Internet

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  modifiedFeeAmount!: number | null; // Modifier le Montant des Frais (Optionnel)

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  toxlFee!: number | null; // TOXL

  @Column('integer', { nullable: true })
  twoHourConstraint!: number | null; // 2H

  @Column('boolean', { default: false })
  payLater!: boolean; // Payer Plus Tard

  @Column('integer', { nullable: true })
  payLaterTimeLimit!: number | null; // Limite de Temps pour Payer Plus Tard (in hours)

  @Column('integer', { nullable: true })
  minTimeBeforeCCFlight!: number | null; // Temps Minimum Avant Vol CC (in hours)

  @Column('integer', { nullable: true })
  minTimeBeforeBalanceFlight!: number | null; // Temps Minimum Avant Vol Balance (in hours)

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  invoiceStamp!: number | null; // Timbre de Facture

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  finalClientAdditionalFees!: number | null; // Frais Supplémentaires Client Final

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  discount!: number | null; // Discount

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}