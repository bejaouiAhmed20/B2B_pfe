import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from "typeorm";

@Entity()
export class News extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  titre!: string;

  @Column("text")
  contenu!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  image_url!: string;

  @CreateDateColumn()
  date_creation!: Date;
}