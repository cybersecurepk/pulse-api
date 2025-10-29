import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  Length,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BatchStatus } from '../entities/batch.entity';

export class CreateBatchDto {
  @ApiProperty({ example: 'Winter 2024 Bootcamp' })
  @IsString()
  @Length(1, 255)
  name: string;

  @ApiProperty({ example: 'BATCH-2024-01' })
  @IsString()
  @Length(1, 255)
  batchCode: string;

  @ApiPropertyOptional({
    example: 'Comprehensive training program for web development',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: '2024-01-15T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-03-15T00:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 30 })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;

  @ApiPropertyOptional({ example: 'New York' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: BatchStatus.PENDING })
  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;
}

