import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';
import { CreateBatchDto } from './dto/create-batch-dto';
import { UpdateBatchDto } from './dto/update-batch-dto';

@Injectable()
export class BatchService {
  constructor(
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
  ) {}

  async findAll(): Promise<Batch[]> {
    return await this.batchRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Batch> {
    const batch = await this.batchRepository.findOne({
      where: { id },
    });

    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }

    return batch;
  }

  async create(createBatchDto: CreateBatchDto): Promise<Batch> {
    const batch = this.batchRepository.create(createBatchDto);
    return await this.batchRepository.save(batch);
  }

  async update(id: string, updateBatchDto: UpdateBatchDto): Promise<Batch> {
    const batch = await this.findOne(id);
    Object.assign(batch, updateBatchDto);
    return await this.batchRepository.save(batch);
  }

  async remove(id: string): Promise<void> {
    const result = await this.batchRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
  }
}

