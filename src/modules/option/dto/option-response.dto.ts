import { Exclude, Expose } from 'class-transformer';

/**
 * Admin Response DTO - includes all fields including isCorrect and scoringValue
 */
export class OptionResponseDto {
  @Expose()
  id: string;

  @Expose()
  text: string;

  @Expose()
  isCorrect: boolean;

  @Expose()
  scoringValue: number;

  @Expose()
  imageUrl: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

/**
 * User Response DTO - excludes isCorrect and scoringValue
 */
export class OptionUserResponseDto {
  @Expose()
  id: string;

  @Expose()
  text: string;

  @Exclude()
  isCorrect: boolean;

  @Exclude()
  scoringValue: number;

  @Expose()
  imageUrl: string;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;
}
