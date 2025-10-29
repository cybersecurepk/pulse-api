import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstructorDto {
  @ApiProperty({ example: 'Jane' })
  @IsString()
  @Length(1, 100)
  firstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @Length(1, 100)
  lastName: string;

  @ApiProperty({ example: 'jane.smith@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Frontend Development' })
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiPropertyOptional({ example: 'React, Node.js, TypeScript' })
  @IsString()
  @IsOptional()
  expertise?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

