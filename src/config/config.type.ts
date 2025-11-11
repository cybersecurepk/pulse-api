import { DatabaseConfig } from 'src/database/config/database-config.type';
import { AppConfig } from './app-config.type';
import { AwsConfig } from './aws-config.type';
import { GoogleOauthConfig } from './google-oauth-config.type';

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  aws: AwsConfig;
  googleOauth: GoogleOauthConfig;
};

