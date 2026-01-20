import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from "typeorm";
import { Note } from "./Note";
import { Task } from "./Task";
import { Opportunity } from "./Opportunity";
import { GmailThread } from "./GmailThread";

@Entity()
export class Lead {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column("simple-array", { nullable: true })
    emails?: string[];

    @Column("simple-array", { nullable: true })
    phones?: string[];

    @Column({ nullable: true })
    company?: string;

    @Column({ nullable: true })
    jobTitle?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({
        type: "varchar",
        default: "Medium"
    })
    priority!: "Low" | "Medium" | "High";

    @Column({
        type: "varchar",
        default: "New & Unread"
    })
    status!: "New & Unread" | "Waiting for Response" | "Working" | "Successful";

    @Column({ nullable: true })
    linkedin?: string;

    @Column({ nullable: true })
    twitter?: string;

    @Column({ nullable: true })
    createdBy?: string;

    @Column({ nullable: true })
    updatedBy?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;

    // Relations according to JSON
    @OneToMany(() => Note, (note) => (note as any).lead)
    notes?: Note[];

    @OneToMany(() => Task, (task) => (task as any).lead)
    tasks?: Task[];

    @OneToMany(() => Opportunity, (opportunity) => (opportunity as any).lead)
    opportunities?: Opportunity[];

    @OneToMany(() => GmailThread, (thread) => thread.lead)
    gmailThreads?: GmailThread[];
}
