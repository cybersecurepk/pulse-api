import { Test } from './test.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('test_screenshots')
export class TestScreenshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'longtext' })
  imageUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @ManyToOne(() => Test, (test) => test.screenshots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'testId' })
  test: Test;
}