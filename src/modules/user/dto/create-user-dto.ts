import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  applicationStatus?: ApplicationStatus;

  @ApiPropertyOptional({ example: 'Additional notes about the application' })
  @IsString()
  @IsOptional()
  applicationNotes?: string;
}

