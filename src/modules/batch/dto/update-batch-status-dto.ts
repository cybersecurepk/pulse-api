import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BatchStatus } from '../entities/batch.entity';

export class UpdateBatchStatusDto {
  @ApiProperty({ enum: BatchStatus, example: BatchStatus.PENDING })
  @IsEnum(BatchStatus)
  status: BatchStatus;
}
