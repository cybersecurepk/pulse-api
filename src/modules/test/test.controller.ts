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
import { TestService } from './test.service';
import { CreateTestDto } from './dto/create-test-dto';
import { Test } from './entities/test.entity';
import { UpdateTestDto } from './dto/update-test-dto';
import { UserRole } from 'src/enums/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('tests')
@ApiBearerAuth('JWT-auth')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all tests' })
  findAll(): Promise<Test[]> {
    return this.testService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a test by ID' })
  findOne(@Param('id') id: string): Promise<Test> {
    return this.testService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Create a new test' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTestDto: CreateTestDto): Promise<Test> {
    return this.testService.create(createTestDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update a test by ID' })
  update(
    @Param('id') id: string,
    @Body() updateTestDto: UpdateTestDto,
  ): Promise<Test> {
    return this.testService.update(id, updateTestDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a test by ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.testService.remove(id);
  }
}
