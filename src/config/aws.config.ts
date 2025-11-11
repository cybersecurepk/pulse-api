import { registerAs } from '@nestjs/config';
import { IsString, IsOptional, IsBoolean } from 'class-validator';
import validateConfig from '../utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  AWS_REGION: string;

  @IsString()
  @IsOptional()
  AWS_S3_BUCKET_NAME: string;

  @IsString()
  @IsOptional()
  AWS_ACCESS_KEY_ID: string;

  @IsString()
  @IsOptional()
  AWS_SECRET_ACCESS_KEY: string;

  @IsString()
  @IsOptional()
  AWS_S3_ENDPOINT?: string;

  @IsBoolean()
  @IsOptional()
  AWS_S3_FORCE_PATH_STYLE?: boolean;
}

export default registerAs('aws', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    region: process.env.AWS_REGION || 'us-east-1',
    s3: {
      bucketName: process.env.AWS_S3_BUCKET_NAME || '',
      // Support both naming conventions
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_S3_BUCKET_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY || '',
      endpoint: process.env.AWS_S3_ENDPOINT || '',
      forcePathStyle:
        process.env.AWS_S3_FORCE_PATH_STYLE === 'true' ||
        process.env.S3_FORCE_PATH_STYLE === 'true',
    },
  };
});
