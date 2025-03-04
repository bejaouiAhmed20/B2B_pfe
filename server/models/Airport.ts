import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Airport extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: false })
  nom!: string;

  @Column('varchar', { nullable: false })
  code!: string;

  @Column('varchar', { nullable: false })
  ville!: string;

  @Column('varchar', { nullable: false })
  pays!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('boolean', { default: true })
  est_actif!: boolean;
}