export type AppConfig = {
  nodeEnv: string;
  name: string;
  workingDirectory: string;
  frontendDomain?: string;
  backendDomain: string;
  port: number;
  apiPrefix: string;
  jwtSecret?: string;
  jwtExpiry?: string;
  jwtRefreshExpiry?: string;
};
