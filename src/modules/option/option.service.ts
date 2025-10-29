import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Option } from './entities/option.entity';
import { Question } from '../question/entities/question.entity';
import { CreateOptionDto } from './dto/create-option-dto';
import { UpdateOptionDto } from './dto/update-option-dto';

@Injectable()
export class OptionService {
  constructor(
    @InjectRepository(Option)
    private optionRepository: Repository<Option>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
  ) {}

  async create(
    questionId: string,
    createOptionDto: CreateOptionDto,
  ): Promise<Option> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    const option = this.optionRepository.create({
      ...createOptionDto,
      question,
    });

    return await this.optionRepository.save(option);
  }

  async findAllByQuestion(questionId: string): Promise<Option[]> {
    return await this.optionRepository.find({
      where: { question: { id: questionId } },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Option> {
    const option = await this.optionRepository.findOne({
      where: { id },
      relations: ['question'],
    });

    if (!option) {
      throw new NotFoundException(`Option with ID ${id} not found`);
    }

    return option;
  }

  async update(id: string, updateOptionDto: UpdateOptionDto): Promise<Option> {
    const option = await this.findOne(id);
    Object.assign(option, updateOptionDto);
    return await this.optionRepository.save(option);
  }

  async remove(id: string): Promise<void> {
    const result = await this.optionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Option with ID ${id} not found`);
    }
  }
}
