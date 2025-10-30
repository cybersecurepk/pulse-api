import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '../entities/user.entity';
import { Type } from 'class-transformer';

class ExperienceResponseDto {
  @ApiPropertyOptional()
  organization?: string;

  @ApiPropertyOptional()
  designation?: string;

  @ApiPropertyOptional()
  from?: string;

  @ApiPropertyOptional()
  to?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['male', 'female', 'other'] })
  gender: string;

  @ApiProperty()
  primaryPhone: string;

  @ApiPropertyOptional()
  secondaryPhone?: string;

  @ApiProperty()
  currentCity: string;

  @ApiProperty()
  permanentCity: string;

  @ApiProperty({ enum: ['12', '14', '16', '18'] })
  yearsOfEducation: string;

  @ApiProperty({ enum: ['HSSC', 'A-Levels', 'BS', 'BSc', 'MS', 'MSc'] })
  highestDegree: string;

  @ApiProperty()
  majors: string;

  @ApiProperty()
  university: string;

  @ApiProperty()
  yearOfCompletion: string;

  @ApiProperty()
  totalExperience: string;

  @ApiProperty({ enum: ['months', 'years'] })
  experienceUnit: string;

  @ApiPropertyOptional({ type: [ExperienceResponseDto] })
  @Type(() => ExperienceResponseDto)
  experiences?: ExperienceResponseDto[];

  @ApiProperty({ enum: ['yes', 'no'] })
  workingDays: string;

  @ApiProperty({ enum: ['yes', 'no'] })
  weekends: string;

  @ApiProperty({ enum: ['yes', 'no'] })
  onsiteSessions: string;

  @ApiProperty({ enum: ['yes', 'no'] })
  remoteSessions: string;

  @ApiProperty()
  blueTeam: boolean;

  @ApiProperty()
  redTeam: boolean;

  @ApiProperty()
  grc: boolean;

  @ApiProperty()
  consent: boolean;

  @ApiPropertyOptional({
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  applicationStatus?: ApplicationStatus;

  @ApiPropertyOptional()
  applicationNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
