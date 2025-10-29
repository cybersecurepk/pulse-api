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
  HttpException,
} from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { CreateInstructorDto } from './dto/create-instructor-dto';
import { Instructor } from './entities/instructor.entity';
import { UpdateInstructorDto } from './dto/update-instructor-dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Instructors')
@Controller('instructors')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all instructors' })
  findAll(): Promise<Instructor[]> {
    return this.instructorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an instructor by ID' })
  findOne(@Param('id') id: string): Promise<Instructor> {
    return this.instructorService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Create a new instructor' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createInstructorDto: CreateInstructorDto): Promise<Instructor> {
    const existingInstructor = await this.instructorService.findByEmail(createInstructorDto.email);
    if (existingInstructor) {
      throw new HttpException(
        'Email already exists',
        HttpStatus.CONFLICT,
      );
    }
    return this.instructorService.create(createInstructorDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update an instructor by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateInstructorDto: UpdateInstructorDto,
  ): Promise<Instructor> {
    // If email is being updated, check for duplicates
    if (updateInstructorDto.email) {
      const existingInstructor = await this.instructorService.findByEmail(updateInstructorDto.email);
      if (existingInstructor && existingInstructor.id !== id) {
        throw new HttpException(
          'Email already exists',
          HttpStatus.CONFLICT,
        );
      }
    }
    return this.instructorService.update(id, updateInstructorDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete an instructor by ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.instructorService.remove(id);
  }
}

