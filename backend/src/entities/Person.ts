import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Company } from "./Company";

@Entity()
export class Person {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  jobTitle?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ nullable: true })
  linkedinLink?: string;

  @Column({ nullable: true })
  xLink?: string;

  @Column({ nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, (company) => company.people)
  @JoinColumn({ name: "companyId" })
  company?: Company;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
