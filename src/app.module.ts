import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './database/config/database.config';
import googleOauthConfig from './config/google-oauth.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { DataSource } from 'typeorm';
import { HomeModule } from './modules/home/home.module';
import { TestModule } from './modules/test/test.module';
import { QuestionModule } from './modules/question/question.module';
import { OptionModule } from './modules/option/option.module';
import { UserModule } from './modules/user/user.module';
import { BatchModule } from './modules/batch/batch.module';
import { InstructorModule } from './modules/instructor/instructor.module';
import { BatchTestModule } from './modules/batch-test/batch-test.module';
import { BatchUserModule } from './modules/batch-user/batch-user.module';
import { BatchInstructorModule } from './modules/batch-instructor/batch-instructor.module';
import { AuthModule } from './modules/auth/auth.module';
import { TokenModule } from './modules/token/token.module';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, googleOauthConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('DataSource options are undefined');
        }
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    HomeModule,
    TestModule,
    QuestionModule,
    OptionModule,
    UserModule,
    BatchModule,
    InstructorModule,
    BatchTestModule,
    BatchUserModule,
    BatchInstructorModule,
    AuthModule,
    TokenModule,
    UploadModule,
  ],
})
export class AppModule {}
