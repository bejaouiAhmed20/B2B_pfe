import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Location extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { nullable: false })
  nom!: string;

  @Column('varchar', { nullable: false })
  pays!: string;

  @Column('varchar', { nullable: false })
  ville!: string;

  @Column('text', { nullable: true })
  description!: string;

  @Column('varchar', { nullable: true })
  url_image!: string;
}