import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { AllConfigType } from '../config/config.type';
import { Readable } from 'stream';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly s3Client: S3Client | null;
  private readonly bucketName: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService<AllConfigType>) {
    const awsConfig = this.configService.get('aws', { infer: true });
    
    this.bucketName = awsConfig?.s3?.bucketName || '';
    const accessKeyId = awsConfig?.s3?.accessKeyId || '';
    const secretAccessKey = awsConfig?.s3?.secretAccessKey || '';
    
    // Debug logging
    this.logger.log(`AWS Config loaded:`);
    this.logger.log(`  Bucket Name: ${this.bucketName ? 'SET' : 'MISSING'}`);
    this.logger.log(`  Access Key ID: ${accessKeyId ? 'SET' : 'MISSING'}`);
    this.logger.log(`  Secret Access Key: ${secretAccessKey ? 'SET' : 'MISSING'}`);
    this.logger.log(`  Region: ${awsConfig?.region || 'us-east-1'}`);
    
    // Also check environment variables directly
    this.logger.log(`Environment variables check:`);
    this.logger.log(`  AWS_S3_BUCKET_NAME: ${process.env.AWS_S3_BUCKET_NAME ? 'SET' : 'MISSING'}`);
    this.logger.log(`  AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING'}`);
    this.logger.log(`  AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'MISSING'}`);
    
    // Check if AWS S3 is properly configured
    this.isConfigured = !!(this.bucketName && accessKeyId && secretAccessKey);
    
    if (!this.isConfigured) {
      this.logger.warn('AWS S3 is not configured. Application submissions will fail.');
      this.logger.warn('Please ensure these environment variables are set in your .env file:');
      this.logger.warn('  - AWS_S3_BUCKET_NAME');
      this.logger.warn('  - AWS_ACCESS_KEY_ID');
      this.logger.warn('  - AWS_SECRET_ACCESS_KEY');
      this.logger.warn('  - AWS_REGION (optional, defaults to us-east-1)');
      this.s3Client = null;
      return;
    }
    
    const s3Config: any = {
      region: awsConfig?.region || 'us-east-1',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    };

    if (awsConfig?.s3?.endpoint) {
      s3Config.endpoint = awsConfig.s3.endpoint;
    }

    if (awsConfig?.s3?.forcePathStyle) {
      s3Config.forcePathStyle = true;
    }

    this.s3Client = new S3Client(s3Config);
  }

  /**
   * Check if AWS S3 is properly configured
   */
  private checkConfiguration(): void {
    if (!this.isConfigured || !this.s3Client) {
      throw new Error(
        'AWS S3 is not configured. Please set AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY environment variables.'
      );
    }
  }

  /**
   * Save applicant data to S3
   * @param applicantData The applicant data to save
   * @returns The S3 key (path) where the file was saved
   */
  async saveApplicantData(applicantData: any): Promise<string> {
    this.checkConfiguration();

    const timestamp = new Date().toISOString();
    const datePrefix = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `applicant-${Date.now()}-${Math.random().toString(36).substring(7)}.json`;
    const key = `applications/${datePrefix}/${fileName}`;

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify({
          ...applicantData,
          submittedAt: timestamp,
          processed: false,
        }),
        ContentType: 'application/json',
      });

      await this.s3Client!.send(command);
      this.logger.log(`Applicant data saved to S3: ${key}`);
      return key;
    } catch (error: any) {
      this.logger.error(`Failed to save applicant data to S3: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all unprocessed applicant files for a specific date
   * @param date Date string in YYYY-MM-DD format
   * @returns Array of S3 keys
   */
  async getUnprocessedApplicants(date: string): Promise<string[]> {
    this.checkConfiguration();

    const prefix = `applications/${date}/`;

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      });

      const response = await this.s3Client!.send(command);
      
      if (!response.Contents) {
        return [];
      }

      // Filter for JSON files only
      return response.Contents
        .filter((object) => object.Key?.endsWith('.json'))
        .map((object) => object.Key!)
        .filter((key) => key);
    } catch (error: any) {
      this.logger.error(`Failed to list applicants from S3: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get applicant data from S3
   * @param key S3 key (path) of the file
   * @returns Parsed applicant data
   */
  async getApplicantData(key: string): Promise<any> {
    this.checkConfiguration();

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await this.s3Client!.send(command);
      
      if (!response.Body) {
        throw new Error(`No data found at key: ${key}`);
      }

      // Convert stream to string
      const stream = response.Body as Readable;
      const chunks: Buffer[] = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      const content = Buffer.concat(chunks).toString('utf-8');
      return JSON.parse(content);
    } catch (error: any) {
      this.logger.error(`Failed to get applicant data from S3: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark applicant as processed (or delete from S3)
   * @param key S3 key (path) of the file
   * @param deleteAfterProcessing Whether to delete the file after processing (default: true)
   */
  async markAsProcessed(key: string, deleteAfterProcessing: boolean = true): Promise<void> {
    this.checkConfiguration();

    try {
      if (deleteAfterProcessing) {
        // Delete the file after successful processing
        const command = new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        });

        await this.s3Client!.send(command);
        this.logger.log(`Applicant data deleted from S3: ${key}`);
      } else {
        // Update the file to mark as processed
        const data = await this.getApplicantData(key);
        data.processed = true;
        data.processedAt = new Date().toISOString();

        const updateCommand = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: JSON.stringify(data),
          ContentType: 'application/json',
        });

        await this.s3Client!.send(updateCommand);
        this.logger.log(`Applicant data marked as processed: ${key}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to mark applicant as processed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all unprocessed applicants for yesterday (for daily processing)
   * @returns Array of S3 keys
   */
  async getYesterdayUnprocessedApplicants(): Promise<string[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateString = yesterday.toISOString().split('T')[0];
    
    return this.getUnprocessedApplicants(dateString);
  }

  /**
   * Get all unprocessed applicants for today
   * @returns Array of S3 keys
   */
  async getTodayUnprocessedApplicants(): Promise<string[]> {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    return this.getUnprocessedApplicants(dateString);
  }
}


