import { Entity, PrimaryColumn, Column, UpdateDateColumn } from "typeorm";

@Entity()
export class GmailAuth {
    @PrimaryColumn()
    userId!: string; // Current user identifier or 'default'

    @Column({ nullable: true })
    accessToken?: string;

    @Column({ nullable: true })
    refreshToken?: string;

    @Column({ type: "bigint", nullable: true })
    expiryDate?: number;

    @UpdateDateColumn()
    updatedAt!: Date;
}
