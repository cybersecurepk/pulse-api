import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { Test } from './entities/test.entity';
import { TestScreenshot } from './entities/test-screenshot.entity';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Test, TestScreenshot, Question, Option])],
  controllers: [TestController],
  providers: [TestService],
  exports: [TestService],
})
export class TestModule {}