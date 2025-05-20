import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";

@Entity()
export class Popup extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column("text")
  content!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ nullable: true })
  image_url!: string;

  @Column({ default: "info" })
  type!: string; // info, warning, success, error

  @Column({ nullable: true })
  button_text!: string;

  @Column({ nullable: true })
  button_link!: string;

  @Column({ default: 0 })
  display_order!: number;

  @Column({ default: 7 })
  duration_days!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: "varchar", nullable: true })
  start_date!: string;
  
  @Column({ type: "varchar", nullable: true })
  end_date!: string;
}