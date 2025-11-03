import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BatchTest } from './entities/batch-test.entity';
import { Batch } from '../batch/entities/batch.entity';
import { Test } from '../test/entities/test.entity';
import { BatchUser } from '../batch-user/entities/batch-user.entity';
import { CreateBatchTestDto } from './dto/create-batch-test-dto';
import { UpdateBatchTestDto } from './dto/update-batch-test-dto';

@Injectable()
export class BatchTestService {
  constructor(
    @InjectRepository(BatchTest)
    private batchTestRepository: Repository<BatchTest>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Test)
    private testRepository: Repository<Test>,
    @InjectRepository(BatchUser)
    private batchUserRepository: Repository<BatchUser>,
  ) {}

  async findAll(): Promise<BatchTest[]> {
    return await this.batchTestRepository.find({
      relations: ['batch', 'test', 'test.questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByBatch(batchId: string): Promise<BatchTest[]> {
    return await this.batchTestRepository.find({
      where: { batch: { id: batchId } },
      relations: ['batch', 'test', 'test.questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTest(testId: string): Promise<BatchTest[]> {
    return await this.batchTestRepository.find({
      where: { test: { id: testId } },
      relations: ['batch', 'test', 'test.questions'],
      order: { createdAt: 'DESC' },
    });
  }

  // New method to get tests by user ID
  async findByUser(userId: string): Promise<BatchTest[]> {
    // First, get all batches for the user
    const batchUsers = await this.batchUserRepository.find({
      where: { user: { id: userId }, isActive: true },
      relations: ['batch'],
    });

    // Get batch IDs
    const batchIds = batchUsers.map(bu => bu.batch.id);

    // If no batches found, return empty array
    if (batchIds.length === 0) {
      return [];
    }

    // Then, get all tests for those batches
    return await this.batchTestRepository.find({
      where: {
        batch: {
          id: In(batchIds),
        },
        isActive: true,  // Only active batch-test assignments
      },
      relations: ['batch', 'test', 'test.questions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BatchTest> {
    const batchTest = await this.batchTestRepository.findOne({
      where: { id },
      relations: ['batch', 'test', 'test.questions'],
    });

    if (!batchTest) {
      throw new NotFoundException(`Batch-Test assignment with ID ${id} not found`);
    }

    return batchTest;
  }

  async create(createBatchTestDto: CreateBatchTestDto): Promise<BatchTest> {
    const batch = await this.batchRepository.findOne({
      where: { id: createBatchTestDto.batchId },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${createBatchTestDto.batchId} not found`);
    }

    const test = await this.testRepository.findOne({
      where: { id: createBatchTestDto.testId },
    });
    if (!test) {
      throw new NotFoundException(`Test with ID ${createBatchTestDto.testId} not found`);
    }

    // Check if assignment already exists
    const existing = await this.batchTestRepository.findOne({
      where: {
        batch: { id: createBatchTestDto.batchId },
        test: { id: createBatchTestDto.testId },
      },
    });

    if (existing) {
      throw new ConflictException(
        'This test is already assigned to this batch',
      );
    }

    const batchTest = this.batchTestRepository.create({
      batch,
      test,
      isActive: createBatchTestDto.isActive ?? true,
      assignedDate: createBatchTestDto.assignedDate
        ? new Date(createBatchTestDto.assignedDate)
        : new Date(),
    });

    return await this.batchTestRepository.save(batchTest);
  }

  async update(
    id: string,
    updateBatchTestDto: UpdateBatchTestDto,
  ): Promise<BatchTest> {
    const batchTest = await this.findOne(id);

    if (updateBatchTestDto.batchId) {
      const batch = await this.batchRepository.findOne({
        where: { id: updateBatchTestDto.batchId },
      });
      if (!batch) {
        throw new NotFoundException(
          `Batch with ID ${updateBatchTestDto.batchId} not found`,
        );
      }
      batchTest.batch = batch;
    }

    if (updateBatchTestDto.testId) {
      const test = await this.testRepository.findOne({
        where: { id: updateBatchTestDto.testId },
      });
      if (!test) {
        throw new NotFoundException(
          `Test with ID ${updateBatchTestDto.testId} not found`,
        );
      }
      batchTest.test = test;
    }

    if (updateBatchTestDto.assignedDate) {
      batchTest.assignedDate = new Date(updateBatchTestDto.assignedDate);
    }

    if (updateBatchTestDto.isActive !== undefined) {
      batchTest.isActive = updateBatchTestDto.isActive;
    }

    return await this.batchTestRepository.save(batchTest);
  }

  async remove(id: string): Promise<void> {
    const result = await this.batchTestRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Batch-Test assignment with ID ${id} not found`);
    }
  }
}