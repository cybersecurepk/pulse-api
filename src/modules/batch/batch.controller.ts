import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BatchService } from './batch.service';
import { CreateBatchDto } from './dto/create-batch-dto';
import { Batch } from './entities/batch.entity';
import { UpdateBatchDto } from './dto/update-batch-dto';
import { UpdateBatchStatusDto } from './dto/update-batch-status-dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Batches')
@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all batches' })
  findAll(): Promise<Batch[]> {
    return this.batchService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a batch by ID' })
  findOne(@Param('id') id: string): Promise<Batch> {
    return this.batchService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Create a new batch' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBatchDto: CreateBatchDto): Promise<Batch> {
    return this.batchService.create(createBatchDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update a batch by ID' })
  update(
    @Param('id') id: string,
    @Body() updateBatchDto: UpdateBatchDto,
  ): Promise<Batch> {
    return this.batchService.update(id, updateBatchDto);
  }

  @Put('status/:id')
  @ApiOperation({ summary: 'Update a batch status by ID' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateBatchStatusDto: UpdateBatchStatusDto,
  ): Promise<Batch> {
    return this.batchService.updateStatus(id, updateBatchStatusDto.status);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a batch by ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.batchService.remove(id);
  }
}
