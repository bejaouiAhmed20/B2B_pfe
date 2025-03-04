import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Flight extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: false })
  titre!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: false })
  prix!: number;

  @Column('datetime', { nullable: false })
  date_depart!: Date;

  @Column('datetime', { nullable: false })
  date_retour!: Date;

  @Column('varchar', { nullable: false })
  ville_depart!: string;

  @Column('varchar', { nullable: false })
  ville_arrivee!: string;

  @Column('varchar', { nullable: false })
  compagnie_aerienne!: string;

  @Column('varchar', { nullable: false })
  duree!: string;
}