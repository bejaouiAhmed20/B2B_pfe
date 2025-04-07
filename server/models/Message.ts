import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, BaseEntity } from 'typeorm';
import { Reclamation } from './Reclamation';

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  content!: string;

  @Column()
  sender_id!: string;

  @Column()
  sender_type!: string;

  @CreateDateColumn()
  created_at!: Date;

  @ManyToOne(() => Reclamation, reclamation => reclamation.messages)
  reclamation!: Reclamation;
}