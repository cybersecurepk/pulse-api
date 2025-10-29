import {
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBatchTestDto {
  @ApiProperty({ example: 'batch-id-uuid' })
  @IsUUID()
  batchId: string;

  @ApiProperty({ example: 'test-id-uuid' })
  @IsUUID()
  testId: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  assignedDate?: string;
}

