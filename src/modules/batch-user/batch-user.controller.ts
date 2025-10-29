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
import { BatchUserService } from './batch-user.service';
import { CreateBatchUserDto } from './dto/create-batch-user-dto';
import { BatchUser } from './entities/batch-user.entity';
import { UpdateBatchUserDto } from './dto/update-batch-user-dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Batch-User Assignments')
@Controller('batch-users')
export class BatchUserController {
  constructor(private readonly batchUserService: BatchUserService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all batch-user assignments' })
  @ApiQuery({ name: 'batchId', required: false, description: 'Filter by batch ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  async findAll(
    @Query('batchId') batchId?: string,
    @Query('userId') userId?: string,
  ): Promise<BatchUser[]> {
    if (batchId) {
      return this.batchUserService.findByBatch(batchId);
    }
    if (userId) {
      return this.batchUserService.findByUser(userId);
    }
    return this.batchUserService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a batch-user assignment by ID' })
  findOne(@Param('id') id: string): Promise<BatchUser> {
    return this.batchUserService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Assign a user to a batch' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBatchUserDto: CreateBatchUserDto): Promise<BatchUser> {
    return this.batchUserService.create(createBatchUserDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update a batch-user assignment by ID' })
  update(
    @Param('id') id: string,
    @Body() updateBatchUserDto: UpdateBatchUserDto,
  ): Promise<BatchUser> {
    return this.batchUserService.update(id, updateBatchUserDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a batch-user assignment by ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.batchUserService.remove(id);
  }
}

