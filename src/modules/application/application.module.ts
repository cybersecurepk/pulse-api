import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { AwsS3Service } from '../../utils/aws-s3.service';
import { UserModule } from '../user/user.module';
import { ScheduledJobsService } from './scheduled-jobs.service';

@Module({
  imports: [UserModule],
  controllers: [ApplicationController],
  providers: [ApplicationService, AwsS3Service, ScheduledJobsService],
  exports: [ApplicationService],
})
export class ApplicationModule {}


