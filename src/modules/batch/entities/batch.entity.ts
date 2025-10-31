import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BatchTest } from '../../batch-test/entities/batch-test.entity';
import { BatchUser } from '../../batch-user/entities/batch-user.entity';
import { BatchInstructor } from '../../batch-instructor/entities/batch-instructor.entity';

export enum BatchStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  ON_GOING = 'on_going',
  COMPLETED = 'completed',
}

export enum SessionType {
  REMOTE = 'remote',
  ONSITE = 'onsite',
}

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, nullable: true })
  batchCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  location: string;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', nullable: true })
  maxCapacity: number;  

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.PENDING })
  status: BatchStatus;

  @Column({ type: 'enum', enum: SessionType, default: SessionType.REMOTE })
  sessionType: SessionType;

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

  @OneToMany(() => BatchTest, (batchTest) => batchTest.batch)
  batchTests: BatchTest[];

  @OneToMany(() => BatchUser, (batchUser) => batchUser.batch)
  batchUsers: BatchUser[];

  @OneToMany(() => BatchInstructor, (batchInstructor) => batchInstructor.batch)
  batchInstructors: BatchInstructor[];
}