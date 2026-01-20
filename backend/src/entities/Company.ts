import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne } from "typeorm";
import { Person } from "./Person";
import { Opportunity } from "./Opportunity";

@Entity()
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  domainName?: string;

  @Column({ nullable: true })
  employees?: number;

  @Column({ nullable: true })
  linkedinLink?: string;

  @Column({ nullable: true })
  xLink?: string;

  @Column({ default: false })
  idealCustomerProfile: boolean = false;

  @OneToMany(() => Person, (person) => person.company)
  people?: Person[];

  @OneToMany(() => Opportunity, (opportunity) => opportunity.company)
  opportunities?: Opportunity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
