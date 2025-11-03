import { ApiProperty } from "@nestjs/swagger";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

// Composite index on FK column + isRevoked for fast user-token lookups
@Index("IDX_refresh_user_revoked", ["userId", "isRevoked"])
@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 500 })
  token: string;

  @ApiProperty()
  @Column({ default: false })
  isRevoked: boolean;

  @ApiProperty()
  @Column({ type: "timestamp", nullable: true })
  tokenExpiry: Date;

  @ApiProperty()
  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @Column("uuid")
  userId: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "userId" })
  user: User;
}
