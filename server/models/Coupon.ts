import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn } from "typeorm";

@Entity()
export class Coupon extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  code!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  reduction!: number;

  @Column({ type: "enum", enum: ["percentage", "fixed"] })
  reduction_type!: string;

  @Column({ type: "date" })
  date_fin!: Date;

  @CreateDateColumn()
  date_creation!: Date;
}