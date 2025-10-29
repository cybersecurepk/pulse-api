import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionService } from './option.service';
import { OptionController } from './option.controller';
import { Option } from './entities/option.entity';
import { Question } from '../question/entities/question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Option, Question])],
  controllers: [OptionController],
  providers: [OptionService],
  exports: [OptionService],
})
export class OptionModule {}
