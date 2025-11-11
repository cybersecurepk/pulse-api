import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateUserDto } from '../user/dto/create-user-dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ScheduledJobsService } from './scheduled-jobs.service';


@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly scheduledJobsService: ScheduledJobsService,
  ) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit a new application (Public endpoint)' })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        s3Key: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or duplicate email',
  })
  async submitApplication(@Body() createUserDto: CreateUserDto) {
    try {
      const result = await this.applicationService.submitApplication(createUserDto);
      
      if (!result.success) {
        throw new HttpException(result.message, HttpStatus.BAD_REQUEST);
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to submit application',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('process-daily')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger daily processing (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Processing completed',
    schema: {
      type: 'object',
      properties: {
        processed: { type: 'number' },
        failed: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async triggerDailyProcessing() {
    try {
      return await this.scheduledJobsService.triggerDailyProcessing();
    } catch (error) {
      throw new HttpException(
        'Failed to process applications',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('config-status')
  @ApiOperation({ summary: 'Check AWS S3 configuration status' })
  @ApiResponse({
    status: 200,
    description: 'Configuration status',
  })
  getConfigStatus() {
    const envVars = {
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME ? 'SET' : 'MISSING',
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING',
      AWS_S3_BUCKET_ACCESS_KEY_ID: process.env.AWS_S3_BUCKET_ACCESS_KEY_ID ? 'SET (alternative)' : 'MISSING',
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
      AWS_S3_BUCKET_SECRET_ACCESS_KEY: process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY ? 'SET (alternative)' : 'MISSING',
      AWS_REGION: process.env.AWS_REGION || 'us-east-1 (default)',
    };

    return {
      status: 'check_server_logs',
      message: 'Check the server startup logs for detailed AWS config status',
      environmentVariables: envVars,
      note: 'Both standard and alternative naming conventions are supported',
    };
  }
}
