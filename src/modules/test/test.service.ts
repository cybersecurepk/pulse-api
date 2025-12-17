import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Test } from './entities/test.entity';
import { TestScreenshot } from './entities/test-screenshot.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { CreateTestDto } from './dto/create-test-dto';
import { UpdateTestDto } from './dto/update-test-dto';
import { CreateScreenshotDto } from './dto/create-screenshot-dto';
import { ScreenshotService } from './screenshot.service';
import { TestAttemptResultDto } from './dto/test-attempt-result-dto';
import { BatchTest } from '../batch-test/entities/batch-test.entity';
import { BatchStatus } from '../batch/entities/batch.entity';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
    @InjectRepository(TestScreenshot)
    private screenshotRepository: Repository<TestScreenshot>,
    @InjectRepository(TestAttempt)
    private testAttemptRepository: Repository<TestAttempt>,
    @InjectRepository(BatchTest)
    private batchTestRepository: Repository<BatchTest>,
  ) {}

  async findAll(): Promise<Test[]> {
    return await this.testRepository.find({
      where: { isDeleted: false },
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
      where: { id, isDeleted: false },
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
      where: { testCode, isDeleted: false },
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
    const test = await this.findOne(id);
    test.isDeleted = true;
    await this.testRepository.save(test);
  }

  async getActiveTestWithQuestions(testId: string) {
    const test = await this.testRepository.findOne({
      where: { id: testId, isDeleted: false },
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
    const test = await this.testRepository.findOne({ 
      where: { id: testId, isDeleted: false } 
    });

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
      where: { test: { id: testId, isDeleted: false } },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // Get test for user attempt (without correct answer flags)
  async getTestForAttempt(testId: string) {
    const test = await this.testRepository.findOne({
      where: { id: testId, isDeleted: false },
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
    proctoringImages?: Record<string, string>,
  ): Promise<TestAttemptResultDto> {
    // Fetch test with questions and options using existing relationships
    const test = await this.testRepository.findOne({
      where: { id: testId, isDeleted: false },
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

    // Save proctoring images to database if provided
    if (proctoringImages && Object.keys(proctoringImages).length > 0) {
      const screenshotPromises = Object.entries(proctoringImages).map(([questionId, imageUrl]) => {
        // Extract filename from URL or path
        const filename = imageUrl.split('/').pop() || `test-${testId}-${questionId}.jpg`;
        
        // Validate that the questionId exists in the test
        // Validate that the questionId exists in the test
        const questionExists = test.questions.some(q => q.id === questionId);
        if (!questionExists) {
          console.warn(`Invalid questionId ${questionId} for test ${testId}, skipping screenshot`);
          return Promise.resolve(null);
        }
        
        const screenshot = this.screenshotRepository.create({
          imageUrl,
          description: filename,
          questionId,
          test,
        });
        
        return this.screenshotRepository.save(screenshot);
      });
      
      await Promise.all(screenshotPromises);
    }

    return {
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      score: Math.round(score * 10) / 10,
      passed,
      passingCriteria: test.passingCriteria,
    };
  }

  // Get unattempted tests for a user from completed batches only (for active tests view)
  async getUnattemptedTestsForUser(userId: string): Promise<Test[]> {
    const batchTests = await this.batchTestRepository.find({
      where: {
        batch: {
          batchUsers: {
            user: { id: userId },
            isActive: true,
          },
          status: BatchStatus.COMPLETED, // Only include tests from completed batches
        },
        isActive: true,
      },
      relations: ['test', 'test.questions', 'test.questions.options', 'batch'],
    });

    // Get the test IDs from batch assignments
    const testIds = batchTests.map(bt => bt.test.id);

    if (testIds.length === 0) {
      return [];
    }

    // Get the actual tests with their details
    const tests = await this.testRepository.find({
      where: {
        id: In(testIds),
        isActive: true,
        isDeleted: false,
      },
      relations: ['questions', 'questions.options'],
      order: {
        questions: {
          sortOrder: 'ASC',
        },
      },
    });

    // Get test attempts for this user
    const attempts = await this.testAttemptRepository.find({
      where: {
        userId,
        testId: In(testIds),
      },
    });

    // Get test IDs that have been attempted
    const attemptedTestIds = attempts.map(attempt => attempt.testId);

    // Filter out tests that have been attempted
    const unattemptedTests = tests.filter(test => !attemptedTestIds.includes(test.id));

    // Remove isCorrect flag from options to hide correct answers from frontend
    return unattemptedTests.map(test => ({
      ...test,
      questions: test.questions.map(question => ({
        ...question,
        options: question.options.map(option => {
          const { isCorrect, ...optionWithoutAnswer } = option;
          return optionWithoutAnswer;
        }),
      })),
    })) as Test[];
  }

  // Get unattempted tests for a user from closed batches only
  async getUnattemptedTestsFromClosedBatchesForUser(userId: string): Promise<Test[]> {
    // First, get all tests assigned to the user through batch assignments
    // Only include tests from closed batches
    const batchTests = await this.batchTestRepository.find({
      where: {
        batch: {
          batchUsers: {
            user: { id: userId },
            isActive: true,
          },
          status: BatchStatus.CLOSED, // Only include tests from closed batches
        },
        isActive: true,
      },
      relations: ['test', 'test.questions', 'test.questions.options', 'batch'],
    });

    // Get the test IDs from batch assignments
    const testIds = batchTests.map(bt => bt.test.id);

    if (testIds.length === 0) {
      return [];
    }

    // Get the actual tests with their details
    const tests = await this.testRepository.find({
      where: {
        id: In(testIds),
        isActive: true,
        isDeleted: false,
      },
      relations: ['questions', 'questions.options'],
      order: {
        questions: {
          sortOrder: 'ASC',
        },
      },
    });

    // Get test attempts for this user
    const attempts = await this.testAttemptRepository.find({
      where: {
        userId,
        testId: In(testIds),
      },
    });

    // Get test IDs that have been attempted
    const attemptedTestIds = attempts.map(attempt => attempt.testId);

    // Filter out tests that have been attempted
    const unattemptedTests = tests.filter(test => !attemptedTestIds.includes(test.id));

    // Remove isCorrect flag from options to hide correct answers from frontend
    return unattemptedTests.map(test => ({
      ...test,
      questions: test.questions.map(question => ({
        ...question,
        options: question.options.map(option => {
          const { isCorrect, ...optionWithoutAnswer } = option;
          return optionWithoutAnswer;
        }),
      })),
    })) as Test[];
  }

  // Get test attempts for a user with test details
  async getUserTestAttempts(userId: string) {
    try {
      const attempts = await this.testAttemptRepository.find({
        where: { userId, isDeleted: false },
        relations: ['test', 'test.questions', 'test.questions.options'],
        order: { createdAt: 'DESC' },
      });

      // Remove isCorrect flag from options to hide correct answers from frontend
      return attempts.map(attempt => {
        if (attempt.test) {
          return {
            ...attempt,
            test: {
              ...attempt.test,
              questions: attempt.test.questions.map(question => ({
                ...question,
                options: question.options.map(option => {
                  const { isCorrect, ...optionWithoutAnswer } = option;
                  return optionWithoutAnswer;
                }),
              })),
            },
          };
        }
        return attempt;
      });
    } catch (error) {
      console.error('Error fetching user test attempts:', error);
      throw error;
    }
  }

  // Get all test attempts for admin panel with user and test details
  async getAllTestAttempts() {
    const attempts = await this.testAttemptRepository.find({
      where: { isDeleted: false },
      relations: ['test', 'user'],
      order: { createdAt: 'DESC' },
    });

    return attempts.map(attempt => ({
      ...attempt,
      user: {
        id: attempt.user.id,
        name: attempt.user.name || attempt.user.email,
        email: attempt.user.email,
      },
    }));
  }

  // Get a single test attempt by ID with full details
  async getTestAttemptById(attemptId: string) {
    const attempt = await this.testAttemptRepository.findOne({
      where: { id: attemptId, isDeleted: false },
      relations: ['test', 'test.questions', 'test.questions.options', 'user'],
    });

    if (!attempt) {
      throw new NotFoundException(`Test attempt with ID ${attemptId} not found`);
    }

    // Remove isCorrect flag from options to hide correct answers from frontend
    if (attempt.test) {
      return {
        ...attempt,
        test: {
          ...attempt.test,
          questions: attempt.test.questions.map(question => ({
            ...question,
            options: question.options.map(option => {
              const { isCorrect, ...optionWithoutAnswer } = option;
              return optionWithoutAnswer;
            }),
          })),
        },
        user: {
          id: attempt.user.id,
          name: attempt.user.name || attempt.user.email,
          email: attempt.user.email,
        },
      };
    }

    return attempt;
  }
}














