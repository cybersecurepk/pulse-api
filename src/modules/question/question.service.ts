import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { Test } from '../test/entities/test.entity';
import { CreateQuestionDto } from './dto/create-question-dto';
import { UpdateQuestionDto } from './dto/update-question.dto';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
  ) {}

  async create(
    testId: string,
    createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    const test = await this.testRepository.findOne({ 
      where: { id: testId, isDeleted: false } 
    });
    if (!test) {
      throw new NotFoundException(`Test with ID ${testId} not found`);
    }

    const question = this.questionRepository.create({
      ...createQuestionDto,
      test,
    });

    return await this.questionRepository.save(question);
  }

  async findAllByTest(testId: string): Promise<Question[]> {
    return await this.questionRepository.find({
      where: { test: { id: testId, isDeleted: false }, isDeleted: false },
      relations: ['options'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['options', 'test'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async update(
    id: string,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    const question = await this.findOne(id);
    Object.assign(question, updateQuestionDto);
    return await this.questionRepository.save(question);
  }

  async remove(id: string): Promise<void> {
    const question = await this.findOne(id);
    question.isDeleted = true;
    await this.questionRepository.save(question);
  }
}
