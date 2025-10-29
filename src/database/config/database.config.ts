import { registerAs } from '@nestjs/config';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import { DatabaseConfig } from './database-config.type';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @ValidateIf(
    (env: Partial<EnvironmentVariablesValidator>) => !!env.DATABASE_URL,
  )
  @IsString()
  DATABASE_URL: string;

  @ValidateIf(
    (env: Partial<EnvironmentVariablesValidator>) => !env.DATABASE_URL,
  )
  @IsString()
  DATABASE_TYPE: string;

  @ValidateIf(
    (env: Partial<EnvironmentVariablesValidator>) => !env.DATABASE_URL,
  )
  @IsString()
  DATABASE_HOST: string;

  @ValidateIf(
    (env: Partial<EnvironmentVariablesValidator>) => !env.DATABASE_URL,
  )
  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  DATABASE_PORT: number;

  @ValidateIf(
    (env: Partial<EnvironmentVariablesValidator>) => !env.DATABASE_URL,
  )
  @IsString()
  @IsOptional()
  DATABASE_PASSWORD: string;

  @ValidateIf(
    (env: Partial<EnvironmentVariablesValidator>) => !env.DATABASE_URL,
  )
  @IsString()
  DATABASE_NAME: string;

  @ValidateIf(
    (env: Partial<EnvironmentVariablesValidator>) => !env.DATABASE_URL,
  )
  @IsString()
  DATABASE_USERNAME: string;

  @IsBoolean()
  @IsOptional()
  DATABASE_SYNCHRONIZE: boolean;

  @IsInt()
  @IsOptional()
  DATABASE_MAX_CONNECTIONS: number;

  @IsBoolean()
  @IsOptional()
  DATABASE_SSL_ENABLED: boolean;

  @IsBoolean()
  @IsOptional()
  DATABASE_REJECT_UNAUTHORIZED: boolean;

  @IsString()
  @IsOptional()
  DATABASE_CA: string;

  @IsString()
  @IsOptional()
  DATABASE_KEY: string;

  @IsString()
  @IsOptional()
  DATABASE_CERT: string;
}

export default registerAs<DatabaseConfig>('database', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    url: process.env.DATABASE_URL,
    type: process.env.DATABASE_TYPE ?? 'mysql',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: process.env.DATABASE_PORT
      ? parseInt(process.env.DATABASE_PORT, 10)
      : 3306,
    name: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    maxConnections: process.env.DATABASE_MAX_CONNECTIONS
      ? parseInt(process.env.DATABASE_MAX_CONNECTIONS, 10)
      : 100,
    sslEnabled: process.env.DATABASE_SSL_ENABLED === 'true',
    rejectUnauthorized: process.env.DATABASE_REJECT_UNAUTHORIZED === 'true',
    ca: process.env.DATABASE_CA,
    key: process.env.DATABASE_KEY,
    cert: process.env.DATABASE_CERT,
  };
});
