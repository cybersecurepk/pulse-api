import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchTestService } from './batch-test.service';
import { BatchTestController } from './batch-test.controller';
import { BatchTest } from './entities/batch-test.entity';
import { Batch } from '../batch/entities/batch.entity';
import { Test } from '../test/entities/test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BatchTest, Batch, Test])],
  controllers: [BatchTestController],
  providers: [BatchTestService],
  exports: [BatchTestService],
})
export class BatchTestModule {}

