import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Batch } from '../../batch/entities/batch.entity';
import { Test } from '../../test/entities/test.entity';

@Entity('batch_tests')
export class BatchTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'datetime', nullable: true })
  assignedDate?: Date;

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

  @ManyToOne(() => Batch, (batch) => batch.batchTests, { onDelete: 'CASCADE' })
  batch: Batch;

  @ManyToOne(() => Test, (test) => test.batchTests, { onDelete: 'CASCADE' })
  test: Test;
}
