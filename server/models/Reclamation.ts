import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Reclamation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255, nullable: false })
  sujet!: string;

  @Column('text', { nullable: false })
  description!: string;

  @Column('varchar', { length: 50, nullable: false, default: 'En attente' })
  statut!: string;

  @CreateDateColumn()
  date_creation!: Date;

  @Column('text', { nullable: true })
  reponse?: string;

  @Column('datetime', { nullable: true })
  date_reponse?: Date;

  @ManyToOne(() => User, (user) => user.reclamations, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}