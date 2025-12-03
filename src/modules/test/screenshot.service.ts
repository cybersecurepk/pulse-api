import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestScreenshot } from './entities/test-screenshot.entity';
import { CreateScreenshotDto } from './dto/create-screenshot-dto';

@Injectable()
export class ScreenshotService {
  constructor(
    @InjectRepository(TestScreenshot)
    private screenshotRepository: Repository<TestScreenshot>,
  ) {}

  async create(createScreenshotDto: CreateScreenshotDto): Promise<TestScreenshot> {
    const screenshot = this.screenshotRepository.create(createScreenshotDto);
    return await this.screenshotRepository.save(screenshot);
  }

  async findByTestId(testId: string): Promise<TestScreenshot[]> {
    return await this.screenshotRepository.find({
      where: { test: { id: testId }, isDeleted: false },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async remove(id: string): Promise<void> {
    const screenshot = await this.screenshotRepository.findOne({
      where: { id, isDeleted: false },
    });
    
    if (!screenshot) {
      throw new NotFoundException(`Screenshot with ID ${id} not found`);
    }
    
    screenshot.isDeleted = true;
    await this.screenshotRepository.save(screenshot);
  }
}
