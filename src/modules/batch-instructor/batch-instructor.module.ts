import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchInstructorService } from './batch-instructor.service';
import { BatchInstructorController } from './batch-instructor.controller';
import { BatchInstructor } from './entities/batch-instructor.entity';
import { Batch } from '../batch/entities/batch.entity';
import { Instructor } from '../instructor/entities/instructor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BatchInstructor, Batch, Instructor])],
  controllers: [BatchInstructorController],
  providers: [BatchInstructorService],
  exports: [BatchInstructorService],
})
export class BatchInstructorModule {}

