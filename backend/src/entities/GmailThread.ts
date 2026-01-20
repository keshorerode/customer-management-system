import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Lead } from "./Lead";

@Entity()
export class GmailThread {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    threadId!: string; // Gmail Thread ID

    @Column({ nullable: true })
    subject?: string;

    @Column("text", { nullable: true })
    snippet?: string;

    @Column({ nullable: true })
    lastMessageDate?: Date;

    @Column({ nullable: true })
    leadId?: string;

    @ManyToOne(() => Lead, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: "leadId" })
    lead?: Lead;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
