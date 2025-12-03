import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Batch } from '../../batch/entities/batch.entity';
import { Instructor } from '../../instructor/entities/instructor.entity';

@Entity('batch_instructors')
export class BatchInstructor {
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

  @ManyToOne(() => Batch, (batch) => batch.batchInstructors, {
    onDelete: 'CASCADE',
  })
  batch: Batch;

  @ManyToOne(() => Instructor, (instructor) => instructor.batchInstructors, {
    onDelete: 'CASCADE',
  })
  instructor: Instructor;
}
