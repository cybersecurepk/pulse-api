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
import { TestAttempt } from '../test/entities/test-attempt.entity';
import { CreateTestDto } from '../test/dto/create-test-dto';
import { UpdateTestDto } from '../test/dto/update-test-dto';
import { CreateScreenshotDto } from './dto/create-screenshot-dto';
import { ScreenshotService } from './screenshot.service';
import { TestAttemptResultDto } from './dto/test-attempt-result-dto';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
    @InjectRepository(TestScreenshot)
    private screenshotRepository: Repository<TestScreenshot>,
    @InjectRepository(TestAttempt)
    private testAttemptRepository: Repository<TestAttempt>,
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
    return await this.screenshotRepository.find({ where: { test: { id: testId } },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Get test for user attempt (without correct answer flags)
  async getTestForAttempt(testId: string) {
    const test = await this.testRepository.findOne({
      where: { id: testId },
      relations: ['questions', 'questions.options'],
      order: {
        questions: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${testId} not found`);
    }

    // Remove isCorrect flag from options to hide correct answers from frontend
    const sanitizedTest = {
      ...test,
      questions: test.questions.map((question) => ({
        ...question,
        options: question.options.map((option) => {
          const { isCorrect, ...optionWithoutAnswer } = option;
          return optionWithoutAnswer;
        }),
      })),
    };

    return sanitizedTest;
  }

  // Submit test attempt and calculate score
  async submitTestAttempt(
    testId: string,
    userId: string,
    answers: Record<string, string>,
    timeSpent?: number,
  ): Promise<TestAttemptResultDto> {
    // Fetch test with questions and options using existing relationships
    const test = await this.testRepository.findOne({
      where: { id: testId },
      relations: ['questions', 'questions.options'],
    });

    if (!test) {
      throw new NotFoundException(`Test with ID ${testId} not found`);
    }

    // console.log('\n=== BACKEND: VALIDATING TEST ANSWERS ===');
    // console.log('Test ID:', testId);
    // console.log('User ID:', userId);
    // console.log('Received Answers:', answers);
    // console.log('Total Questions:', test.questions.length);

    let correctAnswers = 0;
    let wrongAnswers = 0;
    const totalQuestions = test.questions.length;

    // Validate answers against correct options
    test.questions.forEach((question, index) => {
      const selectedOptionId = answers[question.id];
      const correctOption = question.options.find((opt) => opt.isCorrect);

      console.log(`\nQuestion ${index + 1} (ID: ${question.id}):`);
      console.log('  Text:', question.text);
      console.log('  Selected Option ID:', selectedOptionId);
      console.log('  Correct Option ID:', correctOption?.id);
      console.log('  Correct Option Text:', correctOption?.text);
      console.log('  All Options:', question.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect
      })));
      console.log('  ID Match:', selectedOptionId === correctOption?.id);
      console.log('  ID Types:', typeof selectedOptionId, 'vs', typeof correctOption?.id);

      if (selectedOptionId === correctOption?.id) {
        correctAnswers++;
        console.log('  ✓ CORRECT!');
      } else {
        wrongAnswers++;
        console.log('  ✗ WRONG');
      }
    });

    const score =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const passed = score >= test.passingCriteria;

    // console.log('\n=== FINAL CALCULATION ===');
    // console.log('Correct Answers:', correctAnswers);
    // console.log('Wrong Answers:', wrongAnswers);
    // console.log('Total Questions:', totalQuestions);
    // console.log('Score:', score);
    // console.log('Passed:', passed);
    // console.log('========================\n');

    // Save attempt to database
    const attempt = this.testAttemptRepository.create({
      testId,
      userId,
      answers,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score: Math.round(score * 10) / 10,
      passed,
      passingCriteria: test.passingCriteria,
      timeSpent: timeSpent || 0,
    });

    await this.testAttemptRepository.save(attempt);

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score: Math.round(score * 10) / 10,
      passed,
      passingCriteria: test.passingCriteria,
    };
  }
}