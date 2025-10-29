import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question-dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;
}
