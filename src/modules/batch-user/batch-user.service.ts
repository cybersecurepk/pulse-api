import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchUser } from './entities/batch-user.entity';
import { Batch } from '../batch/entities/batch.entity';
import { User } from '../user/entities/user.entity';
import { CreateBatchUserDto } from './dto/create-batch-user-dto';
import { UpdateBatchUserDto } from './dto/update-batch-user-dto';

@Injectable()
export class BatchUserService {
  constructor(
    @InjectRepository(BatchUser)
    private batchUserRepository: Repository<BatchUser>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<BatchUser[]> {
    return await this.batchUserRepository.find({
      where: { isDeleted: false },
      relations: ['batch', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByBatch(batchId: string): Promise<BatchUser[]> {
    return await this.batchUserRepository.find({
      where: { batch: { id: batchId }, isDeleted: false },
      relations: ['batch', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<BatchUser[]> {
    return await this.batchUserRepository.find({
      where: { user: { id: userId }, isDeleted: false },
      relations: ['batch', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<BatchUser> {
    const batchUser = await this.batchUserRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['batch', 'user'],
    });

    if (!batchUser) {
      throw new NotFoundException(`Batch-User assignment with ID ${id} not found`);
    }

    return batchUser;
  }

  async create(createBatchUserDto: CreateBatchUserDto): Promise<BatchUser> {
    const batch = await this.batchRepository.findOne({
      where: { id: createBatchUserDto.batchId },
    });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${createBatchUserDto.batchId} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: createBatchUserDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${createBatchUserDto.userId} not found`);
    }

    if (user.applicationStatus !== 'approved') {
      throw new ConflictException('User must be approved before being added to a batch');
    }

    // Check if assignment already exists
    const existing = await this.batchUserRepository.findOne({
      where: {
        batch: { id: createBatchUserDto.batchId },
        user: { id: createBatchUserDto.userId },
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        'This user is already enrolled in this batch',
      );
    }

    const batchUser = this.batchUserRepository.create({
      batch,
      user,
      isActive: createBatchUserDto.isActive ?? true,
      enrolledDate: createBatchUserDto.enrolledDate
        ? new Date(createBatchUserDto.enrolledDate)
        : new Date(),
    });

    return await this.batchUserRepository.save(batchUser);
  }

  async update(
    id: string,
    updateBatchUserDto: UpdateBatchUserDto,
  ): Promise<BatchUser> {
    const batchUser = await this.findOne(id);

    if (updateBatchUserDto.batchId) {
      const batch = await this.batchRepository.findOne({
        where: { id: updateBatchUserDto.batchId },
      });
      if (!batch) {
        throw new NotFoundException(
          `Batch with ID ${updateBatchUserDto.batchId} not found`,
        );
      }
      batchUser.batch = batch;
    }

    if (updateBatchUserDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateBatchUserDto.userId },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${updateBatchUserDto.userId} not found`,
        );
      }
      batchUser.user = user;
    }

    if (updateBatchUserDto.enrolledDate) {
      batchUser.enrolledDate = new Date(updateBatchUserDto.enrolledDate);
    }

    if (updateBatchUserDto.isActive !== undefined) {
      batchUser.isActive = updateBatchUserDto.isActive;
    }

    return await this.batchUserRepository.save(batchUser);
  }

  async remove(id: string): Promise<void> {
    const batchUser = await this.findOne(id);
    batchUser.isDeleted = true;
    await this.batchUserRepository.save(batchUser);
  }
}
