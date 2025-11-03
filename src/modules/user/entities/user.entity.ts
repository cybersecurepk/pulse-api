import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BatchUser } from '../../batch-user/entities/batch-user.entity';
import { UserRole } from '../../../enums/user-role.enum';

export enum ApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- Application fields ---
  @Column({ length: 200 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ type: 'enum', enum: ['male', 'female', 'other'] })
  gender: string;

  @Column({ length: 50 })
  primaryPhone: string;

  @Column({ length: 50, nullable: true })
  secondaryPhone?: string;

  @Column({ length: 100 })
  currentCity: string;

  @Column({ length: 100 })
  permanentCity: string;

  @Column({ type: 'enum', enum: ['12', '14', '16', '18'] })
  yearsOfEducation: string;

  @Column({
    type: 'enum',
    enum: ['HSSC', 'A-Levels', 'BS', 'BSc', 'MS', 'MSc'],
  })
  highestDegree: string;

  @Column({ length: 150 })
  majors: string;

  @Column({ length: 200 })
  university: string;

  @Column({ length: 10 })
  yearOfCompletion: string;

  @Column({ length: 10 })
  totalExperience: string;

  @Column({ type: 'enum', enum: ['months', 'years'] })
  experienceUnit: string;

  @Column({ type: 'json', nullable: true })
  experiences?: {
    organization?: string;
    designation?: string;
    from?: string;
    to?: string;
  }[];

  @Column({ type: 'enum', enum: ['yes', 'no'] })
  workingDays: string;

  @Column({ type: 'enum', enum: ['yes', 'no'] })
  weekends: string;

  @Column({ type: 'enum', enum: ['yes', 'no'] })
  onsiteSessions: string;

  @Column({ type: 'enum', enum: ['yes', 'no'] })
  remoteSessions: string;

  @Column({ type: 'boolean', default: false })
  blueTeam: boolean;

  @Column({ type: 'boolean', default: false })
  redTeam: boolean;

  @Column({ type: 'boolean', default: false })
  grc: boolean;

  @Column({ type: 'boolean', default: false })
  consent: boolean;
  // --- End application fields ---

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  applicationStatus: ApplicationStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.APPLICANT,
  })
  role: UserRole;

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

  @OneToMany(() => BatchUser, (batchUser) => batchUser.user)
  batchUsers?: BatchUser[];
}