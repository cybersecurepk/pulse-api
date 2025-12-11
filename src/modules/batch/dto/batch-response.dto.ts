import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BatchStatus, SessionType } from '../entities/batch.entity';

export class BatchResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  batchCode?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  maxCapacity?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional({ example: BatchStatus.PENDING })
  status?: BatchStatus;

  @ApiPropertyOptional({ example: SessionType.REMOTE })
  sessionType?: SessionType;
}
