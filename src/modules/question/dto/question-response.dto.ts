import { Exclude, Expose, Type } from 'class-transformer';
import { QuestionType, QuestionOrientation } from 'src/enums/question.enum';
import {
  OptionResponseDto,
  OptionUserResponseDto,
} from 'src/modules/option/dto/option-response.dto';

/**
 * Admin Response DTO - includes all fields including internal scoring logic
 */
export class QuestionResponseDto {
  @Expose()
  id: string;

  @Expose()
  questionNo: number;

  @Expose()
  text: string;

  @Expose()
  type: QuestionType;

  @Expose()
  points: number;

  @Expose()
  imageUrl: string;

  @Expose()
  questionOrientation: QuestionOrientation;

  @Expose()
  dimension: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  @Type(() => OptionResponseDto)
  options?: OptionResponseDto[];
}

/**
 * User Response DTO - excludes internal scoring logic (orientation, dimension)
 */
export class QuestionUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  questionNo: number;

  @Expose()
  text: string;

  @Expose()
  type: QuestionType;

  @Exclude()
  points: number;

  @Expose()
  imageUrl: string;

  @Exclude()
  questionOrientation: QuestionOrientation;

  @Exclude()
  dimension: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Expose()
  @Type(() => OptionUserResponseDto)
  options?: OptionUserResponseDto[];
}
