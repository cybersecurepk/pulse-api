import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuestionDto } from 'src/modules/question/dto/create-question-dto';
import { Type } from 'class-transformer';

export class CreateTestDto {
  @ApiProperty({ example: 'TEST123' })
  @IsString()
  testCode: string;

  @ApiProperty({ example: 'Mathematics Final Exam' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'MCQ test covering fundamentals' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 60, default: 60 })
  @IsInt()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ example: 70, default: 70 })
  @IsInt()
  @IsOptional()
  passingCriteria?: number;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ example: '2024-12-31T23:59:59.000Z' })
  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @ApiPropertyOptional({ type: [CreateQuestionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}
