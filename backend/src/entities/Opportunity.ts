import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Company } from "./Company";
import { Person } from "./Person";

@Entity()
export class Opportunity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "float", nullable: true })
  amount?: number;

  @Column({ nullable: true })
  currencyCode?: string;

  @Column({ nullable: true, type: "datetime" })
  closeDate?: Date;

  @Column({ default: "New" })
  stage: string = "New";

  @Column({ nullable: true })
  companyId?: string;

  @ManyToOne(() => Company, (company) => company.opportunities)
  @JoinColumn({ name: "companyId" })
  company?: Company;

  @Column({ nullable: true })
  pointOfContactId?: string;

  @ManyToOne(() => Person)
  @JoinColumn({ name: "pointOfContactId" })
  pointOfContact?: Person;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
