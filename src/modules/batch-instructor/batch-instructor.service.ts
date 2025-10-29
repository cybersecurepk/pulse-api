import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchInstructor } from './entities/batch-instructor.entity';
import { Batch } from '../batch/entities/batch.entity';
import { Instructor } from '../instructor/entities/instructor.entity';
import { CreateBatchInstructorDto } from './dto/create-batch-instructor-dto';
import { UpdateBatchInstructorDto } from './dto/update-batch-instructor-dto';

@Injectable()
export class BatchInstructorService {
  constructor(
    @InjectRepository(BatchInstructor)
    private batchInstructorRepository: Repository<BatchInstructor>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(Instructor)
    private instructorRepository: Repository<Instructor>,
  ) {}

  async findAll(): Promise<BatchInstructor[]> {
    return await this.batchInstructorRepository.find({
      relations: ['batch', 'instructor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByBatch(batchId: string): Promise<BatchInstructor[]> {
    return await this.batchInstructorRepository.find({
      where: { batch: { id: batchId } },
      relations: ['batch', 'instructor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByInstructor(instructorId: string): Promise<BatchInstructor[]> {
    return await this.batchInstructorRepository.find({
      where: { instructor: { id: instructorId } },
      relations: ['batch', 'instructor'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BatchInstructor> {
    const batchInstructor = await this.batchInstructorRepository.findOne({
      where: { id },
      relations: ['batch', 'instructor'],
    });

    if (!batchInstructor) {
      throw new NotFoundException(`Batch-Instructor assignment with ID ${id} not found`);
    }

    return batchInstructor;
  }

  async create(createBatchInstructorDto: CreateBatchInstructorDto): Promise<BatchInstructor> {
    // Check if batch exists
    const batch = await this.batchRepository.findOne({
      where: { id: createBatchInstructorDto.batchId },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${createBatchInstructorDto.batchId} not found`);
    }

    // Check if instructor exists
    const instructor = await this.instructorRepository.findOne({
      where: { id: createBatchInstructorDto.instructorId },
    });
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${createBatchInstructorDto.instructorId} not found`);
    }

    // Check if instructor is active
    if (!instructor.isActive) {
      throw new ConflictException('Cannot assign inactive instructor to a batch');
    }

    // Check if assignment already exists
    const existing = await this.batchInstructorRepository.findOne({
      where: {
        batch: { id: createBatchInstructorDto.batchId },
        instructor: { id: createBatchInstructorDto.instructorId },
      },
    });

    if (existing) {
      throw new ConflictException(
        'This instructor is already assigned to this batch',
      );
    }

    const batchInstructor = this.batchInstructorRepository.create({
      batch,
      instructor,
      isActive: createBatchInstructorDto.isActive ?? true,
      assignedDate: createBatchInstructorDto.assignedDate
        ? new Date(createBatchInstructorDto.assignedDate)
        : new Date(),
    });

    return await this.batchInstructorRepository.save(batchInstructor);
  }

  async update(
    id: string,
    updateBatchInstructorDto: UpdateBatchInstructorDto,
  ): Promise<BatchInstructor> {
    const batchInstructor = await this.findOne(id);

    if (updateBatchInstructorDto.batchId) {
      const batch = await this.batchRepository.findOne({
        where: { id: updateBatchInstructorDto.batchId },
      });
      if (!batch) {
        throw new NotFoundException(
          `Batch with ID ${updateBatchInstructorDto.batchId} not found`,
        );
      }
      batchInstructor.batch = batch;
    }

    if (updateBatchInstructorDto.instructorId) {
      const instructor = await this.instructorRepository.findOne({
        where: { id: updateBatchInstructorDto.instructorId },
      });
      if (!instructor) {
        throw new NotFoundException(
          `Instructor with ID ${updateBatchInstructorDto.instructorId} not found`,
        );
      }
      batchInstructor.instructor = instructor;
    }

    if (updateBatchInstructorDto.assignedDate) {
      batchInstructor.assignedDate = new Date(updateBatchInstructorDto.assignedDate);
    }

    if (updateBatchInstructorDto.isActive !== undefined) {
      batchInstructor.isActive = updateBatchInstructorDto.isActive;
    }

    return await this.batchInstructorRepository.save(batchInstructor);
  }

  async remove(id: string): Promise<void> {
    const result = await this.batchInstructorRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Batch-Instructor assignment with ID ${id} not found`);
    }
  }
}

