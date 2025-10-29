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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user-dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user-dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ApplicationStatus } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('list')
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ApplicationStatus,
    description: 'Filter by application status',
  })
  async findAll(@Query('status') status?: string): Promise<User[]> {
    if (status && Object.values(ApplicationStatus).includes(status as ApplicationStatus)) {
      return this.userService.findByApplicationStatus(status);
    }
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post('save')
  @ApiOperation({ summary: 'Create a new user' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new HttpException(
        'Email already exists',
        HttpStatus.CONFLICT,
      );
    }
    return this.userService.create(createUserDto);
  }

  @Put('update/:id')
  @ApiOperation({ summary: 'Update a user by ID' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // If email is being updated, check for duplicates
    if (updateUserDto.email) {
      const existingUser = await this.userService.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new HttpException(
          'Email already exists',
          HttpStatus.CONFLICT,
        );
      }
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}

