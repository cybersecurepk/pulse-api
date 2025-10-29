import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BatchInstructorService } from './batch-instructor.service';
import { CreateBatchInstructorDto } from './dto/create-batch-instructor-dto';
import { BatchInstructor } from './entities/batch-instructor.entity';
import { UpdateBatchInstructorDto } from './dto/update-batch-instructor-dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Batch-Instructor Assignments')
@Controller('batch-instructors')
export class BatchInstructorController {
  constructor(private readonly batchInstructorService: BatchInstructorService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all batch-instructor assignments' })
  @ApiQuery({ name: 'batchId', required: false, description: 'Filter by batch ID' })
  @ApiQuery({ name: 'instructorId', required: false, description: 'Filter by instructor ID' })
  async findAll(
    @Query('batchId') batchId?: string,
    @Query('instructorId') instructorId?: string,
  ): Promise<BatchInstructor[]> {
    if (batchId) {
      return this.batchInstructorService.findByBatch(batchId);
    }
    if (instructorId) {
      return this.batchInstructorService.findByInstructor(instructorId);
    }
    return this.batchInstructorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a batch-instructor assignment by ID' })
  findOne(@Param('id') id: string): Promise<BatchInstructor> {
    return this.batchInstructorService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Assign an instructor to a batch' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBatchInstructorDto: CreateBatchInstructorDto): Promise<BatchInstructor> {
    return this.batchInstructorService.create(createBatchInstructorDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update a batch-instructor assignment by ID' })
  update(
    @Param('id') id: string,
    @Body() updateBatchInstructorDto: UpdateBatchInstructorDto,
  ): Promise<BatchInstructor> {
    return this.batchInstructorService.update(id, updateBatchInstructorDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a batch-instructor assignment by ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.batchInstructorService.remove(id);
  }
}

