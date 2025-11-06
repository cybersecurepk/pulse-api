import { IsNotEmpty, IsObject, IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitTestAttemptDto {
  @ApiProperty({
    description: 'User ID who is submitting the test',
    example: 'ba5ce56e-4dea-4ccd-847c-e48280c77351',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Object mapping question IDs to selected option IDs',
    example: {
      'question-id-1': 'option-id-a',
      'question-id-2': 'option-id-b',
    },
  })
  @IsNotEmpty()
  @IsObject()
  answers: Record<string, string>; // questionId -> selectedOptionId

  @ApiProperty({
    description: 'Time spent on test in seconds',
    example: 120,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  timeSpent?: number;
}
