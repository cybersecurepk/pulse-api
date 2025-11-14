import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { Test } from './entities/test.entity';
import { TestScreenshot } from './entities/test-screenshot.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity';
import { BatchTest } from '../batch-test/entities/batch-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Test, TestScreenshot, TestAttempt, Question, Option, BatchTest])],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}