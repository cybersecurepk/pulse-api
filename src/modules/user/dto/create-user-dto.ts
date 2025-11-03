import {
  IsString,
  IsEnum,
  IsEmail,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/user.entity';
import { UserRole } from '../../../enums/user-role.enum';
import { Type } from 'class-transformer';

class ExperienceDto {
  @ApiPropertyOptional({ example: 'CyberTech Solutions' })
  @IsString()
  @IsOptional()
  organization?: string;

  @ApiPropertyOptional({ example: 'Security Analyst' })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({ example: '2022-01-01' })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ example: '2023-03-31' })
  @IsString()
  @IsOptional()
  to?: string;
}

export class CreateUserDto {
  // Personal Information
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['male', 'female', 'other'], example: 'male' })
  @IsEnum(['male', 'female', 'other'])
  gender: string;

  @ApiProperty({ example: '+1234567890' })
  @IsString()
  primaryPhone: string;

  @ApiPropertyOptional({ example: '+0987654321' })
  @IsString()
  @IsOptional()
  secondaryPhone?: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  currentCity: string;

  @ApiProperty({ example: 'Los Angeles' })
  @IsString()
  permanentCity: string;

  // Education
  @ApiProperty({ enum: ['12', '14', '16', '18'], example: '16' })
  @IsEnum(['12', '14', '16', '18'])
  yearsOfEducation: string;

  @ApiProperty({
    enum: ['HSSC', 'A-Levels', 'BS', 'BSc', 'MS', 'MSc'],
    example: 'BS',
  })
  @IsEnum(['HSSC', 'A-Levels', 'BS', 'BSc', 'MS', 'MSc'])
  highestDegree: string;

  @ApiProperty({ example: 'Computer Science' })
  @IsString()
  majors: string;

  @ApiProperty({ example: 'Stanford University' })
  @IsString()
  university: string;

  @ApiProperty({ example: '2022' })
  @IsString()
  yearOfCompletion: string;

  // Experience
  @ApiProperty({ example: '2' })
  @IsString()
  totalExperience: string;

  @ApiProperty({ enum: ['months', 'years'], example: 'years' })
  @IsEnum(['months', 'years'])
  experienceUnit: string;

  @ApiPropertyOptional({
    type: [ExperienceDto],
    example: [
      {
        organization: 'CyberTech Solutions',
        designation: 'Security Analyst',
        from: '2022-01-01',
        to: '2023-03-31',
      },
      {
        organization: 'DataDefend Inc.',
        designation: 'Network Specialist',
        from: '2020-06-01',
        to: '2021-12-15',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  @IsOptional()
  experiences?: ExperienceDto[];

  // Availability & Interests
  @ApiProperty({ enum: ['yes', 'no'], example: 'yes' })
  @IsEnum(['yes', 'no'])
  workingDays: string;

  @ApiProperty({ enum: ['yes', 'no'], example: 'no' })
  @IsEnum(['yes', 'no'])
  weekends: string;

  @ApiProperty({ enum: ['yes', 'no'], example: 'yes' })
  @IsEnum(['yes', 'no'])
  onsiteSessions: string;

  @ApiProperty({ enum: ['yes', 'no'], example: 'yes' })
  @IsEnum(['yes', 'no'])
  remoteSessions: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  blueTeam: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  redTeam: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  grc: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  consent: boolean;

  // Application
  @ApiPropertyOptional({
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
    example: ApplicationStatus.PENDING,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  applicationStatus?: ApplicationStatus;

  // Role
  @ApiPropertyOptional({
    enum: UserRole,
    default: UserRole.APPLICANT,
    example: UserRole.APPLICANT,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}