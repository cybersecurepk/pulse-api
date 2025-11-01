import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Test } from '../test/entities/test.entity';
import { TestScreenshot } from '../test/entities/test-screenshot.entity';
import { CreateTestDto } from '../test/dto/create-test-dto';
import { UpdateTestDto } from '../test/dto/update-test-dto';
import { CreateScreenshotDto } from './dto/create-screenshot-dto';
import { ScreenshotService } from './screenshot.service';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
    @InjectRepository(TestScreenshot)
    private screenshotRepository: Repository<TestScreenshot>,
  ) {}

  async findAll(): Promise<Test[]> {
    return await this.testRepository.find({
      relations: ['questions', 'questions.options'],
      order: {
        questions: {
          sortOrder: 'ASC',
        },
      },
    });
  }

  async findOne(id: string): Promise<Test> {
    const test = await this.testRepository.findOne({
      where: { id },
      relations: ['questions', 'questions.options', 'screenshots'],
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }

    return test;
  }

  async create(createTestDto: CreateTestDto): Promise<Test> {
    const { questions } = createTestDto;
    console.log('Creating test with questions:', { questions });
    const testCode = createTestDto.testCode.toUpperCase();
    const alreadyExist = await this.testRepository.findOne({
      where: { testCode },
    });
    if (alreadyExist) {
      throw new BadRequestException('Test with this code already exists');
    }
    const test = this.testRepository.create({
      ...createTestDto,
      testCode,
    });
    return await this.testRepository.save(test);
  }

  async update(id: string, updateTestDto: UpdateTestDto): Promise<Test> {
    const test = await this.findOne(id);
    Object.assign(test, updateTestDto);
    const updatedTest = await this.testRepository.save(test);

    return updatedTest;
  }

  async remove(id: string): Promise<void> {
    const result = await this.testRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Test with ID ${id} not found`);
    }
  }

  async getActiveTestWithQuestions(testId: string) {
    const test = await this.testRepository.findOne({
      where: { id: testId },
      relations: ['questions', 'questions.options'],
    });
    if (!test) throw new NotFoundException('Test not found');
    const now = new Date();
    if (!test.isActive) throw new ForbiddenException('Test is inactive');
    if (test.startDate && now < new Date(test.startDate)) {
      throw new ForbiddenException('Test not started yet');
    }
    if (test.endDate && now > new Date(test.endDate)) {
      throw new ForbiddenException('Test window has ended');
    }
    return test;
  }

  async addScreenshot(
    testId: string,
    createScreenshotDto: CreateScreenshotDto,
  ): Promise<TestScreenshot> {
    const test = await this.testRepository.findOne({ where: { id: testId } });

    if (!test) {
      throw new NotFoundException(`Test with ID ${testId} not found`);
    }

    const screenshot = this.screenshotRepository.create({
      ...createScreenshotDto,
      test,
    });

    return await this.screenshotRepository.save(screenshot);
  }

  async getScreenshotsByTestId(testId: string): Promise<TestScreenshot[]> {
    return await this.screenshotRepository.find({
      where: { test: { id: testId } },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
