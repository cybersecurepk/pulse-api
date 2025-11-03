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
import { BatchTestService } from './batch-test.service';
import { CreateBatchTestDto } from './dto/create-batch-test-dto';
import { BatchTest } from './entities/batch-test.entity';
import { UpdateBatchTestDto } from './dto/update-batch-test-dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Batch-Test Assignments')
@Controller('batch-tests')
export class BatchTestController {
  constructor(private readonly batchTestService: BatchTestService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all batch-test assignments' })
  @ApiQuery({ name: 'batchId', required: false, description: 'Filter by batch ID' })
  @ApiQuery({ name: 'testId', required: false, description: 'Filter by test ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  async findAll(
    @Query('batchId') batchId?: string,
    @Query('testId') testId?: string,
    @Query('userId') userId?: string,
  ): Promise<BatchTest[]> {
    if (userId) {
      return this.batchTestService.findByUser(userId);
    }
    if (batchId) {
      return this.batchTestService.findByBatch(batchId);
    }
    if (testId) {
      return this.batchTestService.findByTest(testId);
    }
    return this.batchTestService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a batch-test assignment by ID' })
  findOne(@Param('id') id: string): Promise<BatchTest> {
    return this.batchTestService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Assign a test to a batch' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBatchTestDto: CreateBatchTestDto): Promise<BatchTest> {
    return this.batchTestService.create(createBatchTestDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update a batch-test assignment by ID' })
  update(
    @Param('id') id: string,
    @Body() updateBatchTestDto: UpdateBatchTestDto,
  ): Promise<BatchTest> {
    return this.batchTestService.update(id, updateBatchTestDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a batch-test assignment by ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.batchTestService.remove(id);
  }
}