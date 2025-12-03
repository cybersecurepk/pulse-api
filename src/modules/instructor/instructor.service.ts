import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from './entities/instructor.entity';
import { CreateInstructorDto } from './dto/create-instructor-dto';
import { UpdateInstructorDto } from './dto/update-instructor-dto';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(Instructor)
    private instructorRepository: Repository<Instructor>,
  ) {}

  async findAll(): Promise<Instructor[]> {
    return await this.instructorRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Instructor> {
    const instructor = await this.instructorRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${id} not found`);
    }

    return instructor;
  }

  async findByEmail(email: string): Promise<Instructor | null> {
    return await this.instructorRepository.findOne({
      where: { email, isDeleted: false },
    });
  }

  async create(createInstructorDto: CreateInstructorDto): Promise<Instructor> {
    const instructor = this.instructorRepository.create(createInstructorDto);
    return await this.instructorRepository.save(instructor);
  }

  async update(
    id: string,
    updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    const instructor = await this.findOne(id);
    Object.assign(instructor, updateInstructorDto);
    return await this.instructorRepository.save(instructor);
  }

  async remove(id: string): Promise<void> {
    const instructor = await this.findOne(id);
    instructor.isDeleted = true;
    await this.instructorRepository.save(instructor);
  }
}
