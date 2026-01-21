import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm";
import { Company } from "./Company";

@Entity()
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: "text", nullable: true })
  body?: string;

  @Column({ default: "TODO" })
  status: string = "TODO";

  @Column({ nullable: true, type: "datetime" })
  dueAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToOne(() => Company, (company) => company.tasks)
  company?: Company;
}
