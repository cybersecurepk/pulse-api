import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchUserService } from './batch-user.service';
import { BatchUserController } from './batch-user.controller';
import { BatchUser } from './entities/batch-user.entity';
import { Batch } from '../batch/entities/batch.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BatchUser, Batch, User])],
  controllers: [BatchUserController],
  providers: [BatchUserService],
  exports: [BatchUserService],
})
export class BatchUserModule {}

