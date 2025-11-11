import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApplicationService } from './application.service';

@Injectable()
export class ScheduledJobsService {
  private readonly logger = new Logger(ScheduledJobsService.name);

  constructor(private readonly applicationService: ApplicationService) {}

  /**
   * Process applications every minute
   * This runs every minute to process all submissions from today
   */
  @Cron('* * * * *', {
    name: 'processApplicationsEveryMinute',
    timeZone: 'UTC',
  })
  async processDailyApplications() {
    this.logger.log('=== Starting scheduled application processing (every minute) ===');
    
    try {
      const result = await this.applicationService.processDailyApplications();
      
      this.logger.log(`=== Processing completed ===`);
      this.logger.log(`Processed: ${result.processed}`);
      this.logger.log(`Failed: ${result.failed}`);
      
      if (result.errors.length > 0) {
        this.logger.error('Errors encountered:');
        result.errors.forEach((error) => {
          this.logger.error(`  - ${error}`);
        });
      }
    } catch (error) {
      this.logger.error(`Scheduled job failed: ${error.message}`, error.stack);
    }
  }

  /**
   * Manual trigger for testing purposes (can be called via API)
   */
  async triggerDailyProcessing() {
    this.logger.log('Manual trigger for application processing');
    return await this.processDailyApplications();
  }
}

