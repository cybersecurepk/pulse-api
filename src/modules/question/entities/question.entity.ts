import { QuestionType, QuestionOrientation } from 'src/enums/question.enum';
import { Option } from 'src/modules/option/entities/option.entity';
import { Test } from 'src/modules/test/entities/test.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  sortOrder: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'enum', enum: QuestionType, default: QuestionType.SINGLE })
  type: QuestionType;

  @Column({ type: 'int', default: 1 })
  points: number;

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

  @ManyToOne(() => Test, (test) => test.questions, { onDelete: 'CASCADE' })
  test: Test;

  @OneToMany(() => Option, (option) => option.question, { cascade: true })
  options: Option[];
}
