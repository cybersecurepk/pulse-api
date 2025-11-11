import { Module } from '@nestjs/common';
import { ScheduledJobsService } from './scheduled-jobs.service';
import { ApplicationModule } from './application.module';

@Module({
  imports: [ApplicationModule],
  providers: [ScheduledJobsService],
  exports: [ScheduledJobsService],
})
export class ApplicationSchedulerModule {}



