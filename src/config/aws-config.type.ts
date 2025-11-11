export type AwsConfig = {
  region: string;
  s3: {
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    forcePathStyle: boolean;
  };
};

