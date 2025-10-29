import { Exclude, Expose, Type } from 'class-transformer';
import { ScoringStandard } from 'src/enums/question.enum';
import {
  QuestionResponseDto,
  QuestionUserResponseDto,
} from 'src/modules/question/dto/question-response.dto';

/**
 * Admin Response DTO - includes all fields including internal scoring logic
 */
export class TestAdminResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  duration: number;

  @Expose()
  passingCriteria: number;

  @Expose()
  testCode: string;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => QuestionResponseDto)
  questions?: QuestionResponseDto[];
}

/**
 * User Response DTO - excludes internal scoring logic and admin-only fields
 */
export class TestUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  duration: number;

  @Expose()
  testCategory: 'STANDARD' | 'PSYCHOMETRIC';

  @Exclude()
  scoringStandard: ScoringStandard;

  @Expose()
  startDate: Date;

  @Expose()
  endDate: Date;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => QuestionUserResponseDto)
  questions?: QuestionUserResponseDto[];
}

/**
 * Simple Test List Response (for listings without questions)
 */
export class TestListResponseDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  testCode: string;

  @Expose()
  description: string;

  @Expose()
  duration: number;

  @Expose()
  passingCriteria: number;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
