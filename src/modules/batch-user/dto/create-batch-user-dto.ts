import {
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBatchUserDto {
  @ApiProperty({ example: 'batch-id-uuid' })
  @IsUUID()
  batchId: string;

  @ApiProperty({ example: 'user-id-uuid' })
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: '2024-01-15T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  enrolledDate?: string;
}

