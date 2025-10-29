import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuestionType } from 'src/enums/question.enum';
import { CreateOptionDto } from 'src/modules/option/dto/create-option-dto';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @ApiProperty()
  @IsInt()
  sortOrder: number;

  @ApiProperty({ example: 'What is `const`?' })
  @IsString()
  text: string;

  @ApiPropertyOptional({
    enum: QuestionType,
    default: QuestionType.SINGLE,
  })
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @ApiPropertyOptional({
    description: 'Points awarded for correct answer',
    example: 5,
    minimum: 1,
    default: 1,
  })
  @IsInt()
  @IsOptional()
  points?: number;

  @ApiPropertyOptional({ type: [CreateOptionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  options?: CreateOptionDto[];
}
