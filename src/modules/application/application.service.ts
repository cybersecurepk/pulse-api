import { Injectable, Logger } from '@nestjs/common';
import { AwsS3Service } from '../../utils/aws-s3.service';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user-dto';
import { User } from '../user/entities/user.entity';
import { ApplicationStatus } from '../user/entities/user.entity';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    private readonly awsS3Service: AwsS3Service,
    private readonly userService: UserService,
  ) {}

  /**
   * Submit application - saves to S3 instead of database
   */
  async submitApplication(applicationData: CreateUserDto): Promise<{ success: boolean; message: string; s3Key?: string }> {
    try {
      // Check if email already exists in database
      const existingUser = await this.userService.findByEmail(applicationData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'An application with this email already exists',
        };
      }

      // Save to S3
      const s3Key = await this.awsS3Service.saveApplicantData(applicationData);

      this.logger.log(`Application submitted and saved to S3: ${s3Key}`);
      
      return {
        success: true,
        message: 'Application submitted successfully. It will be reviewed and processed.',
        s3Key,
      };
    } catch (error) {
      this.logger.error(`Failed to submit application: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Process a single applicant from S3 and save to database
   */
  async processApplicant(s3Key: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Get applicant data from S3
      const applicantData = await this.awsS3Service.getApplicantData(s3Key);

      // Check if already processed
      if (applicantData.processed) {
        this.logger.warn(`Applicant ${s3Key} already processed, skipping`);
        return { success: false, error: 'Already processed' };
      }

      // Check if email already exists in database
      const existingUser = await this.userService.findByEmail(applicantData.email);
      if (existingUser) {
        this.logger.warn(`Email ${applicantData.email} already exists, marking as processed`);
        await this.awsS3Service.markAsProcessed(s3Key, true);
        return { success: false, error: 'Email already exists' };
      }

      // Create user in database
      const userData: CreateUserDto = {
        ...applicantData,
        applicationStatus: ApplicationStatus.PENDING,
      };

      const user = await this.userService.create(userData);

      // Mark as processed in S3
      await this.awsS3Service.markAsProcessed(s3Key, true);

      this.logger.log(`Successfully processed applicant ${s3Key} -> User ID: ${user.id}`);
      
      return { success: true, user };
    } catch (error) {
      this.logger.error(`Failed to process applicant ${s3Key}: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process all unprocessed applicants from today (runs every minute)
   */
  async processDailyApplications(): Promise<{ processed: number; failed: number; errors: string[] }> {
    this.logger.log('Starting application processing (every minute)...');

    try {
      // Get all unprocessed applicants from today
      const s3Keys = await this.awsS3Service.getTodayUnprocessedApplicants();

      if (s3Keys.length === 0) {
        this.logger.log('No applications to process');
        return { processed: 0, failed: 0, errors: [] };
      }

      this.logger.log(`Found ${s3Keys.length} applications to process`);

      let processed = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process each applicant one by one
      for (const s3Key of s3Keys) {
        try {
          const result = await this.processApplicant(s3Key);
          
          if (result.success) {
            processed++;
            this.logger.log(`✓ Processed: ${s3Key}`);
          } else {
            failed++;
            errors.push(`${s3Key}: ${result.error || 'Unknown error'}`);
            this.logger.warn(`✗ Failed: ${s3Key} - ${result.error}`);
          }

          // Add small delay between processing to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          failed++;
          const errorMsg = `${s3Key}: ${error.message}`;
          errors.push(errorMsg);
          this.logger.error(`Error processing ${s3Key}: ${error.message}`, error.stack);
        }
      }

      this.logger.log(`Processing completed: ${processed} processed, ${failed} failed`);

      return { processed, failed, errors };
    } catch (error) {
      this.logger.error(`Failed to process applications: ${error.message}`, error.stack);
      throw error;
    }
  }
}

