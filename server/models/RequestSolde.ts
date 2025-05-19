import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

@Entity()
export class RequestSolde extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.requestSoldes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'client_id' })
  client!: User;

  @Column('decimal', { precision: 10, scale: 2 })
  montant!: number;

  @Column('text', { nullable: true })
  description!: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING
  })
  status!: RequestStatus;

  @Column('varchar', { nullable: true })
  imageUrl!: string;
}