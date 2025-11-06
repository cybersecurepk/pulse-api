import { ApiProperty } from '@nestjs/swagger';

export class TestAttemptResultDto {
  @ApiProperty({
    description: 'Total number of questions in the test',
  })
  totalQuestions: number;

  @ApiProperty({
    description: 'Number of correct answers',
  })
  correctAnswers: number;

  @ApiProperty({
    description: 'Number of wrong answers',
  })
  wrongAnswers: number;

  @ApiProperty({
    description: 'Score percentage (0-100)',
  })
  score: number;

  @ApiProperty({
    description: 'Whether the user passed based on passing criteria',
  })
  passed: boolean;

  @ApiProperty({
    description: 'Passing criteria percentage',
  })
  passingCriteria: number;
}
