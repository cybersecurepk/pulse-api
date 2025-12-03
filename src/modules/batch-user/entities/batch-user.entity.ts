import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Batch } from '../../batch/entities/batch.entity';
import { User } from '../../user/entities/user.entity';

@Entity('batch_users')
export class BatchUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  enrolledDate?: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @ManyToOne(() => Batch, (batch) => batch.batchUsers, { onDelete: 'CASCADE' })
  batch: Batch;

  @ManyToOne(() => User, (user) => user.batchUsers, { onDelete: 'CASCADE' })
  user: User;
}
