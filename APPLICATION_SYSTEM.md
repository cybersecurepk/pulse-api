# Application Submission System - Implementation Guide

## Overview

This system implements a workflow where public-facing application submissions are stored in AWS S3 instead of directly in the database. A scheduled job processes these submissions daily at the end of each day and migrates them to the database.

## Architecture

### Flow Diagram

```
Public Form Submission
    ↓
POST /applications/submit
    ↓
AWS S3 (applications/YYYY-MM-DD/applicant-*.json)
    ↓
Daily Cron Job (11:59 PM UTC)
    ↓
Process each submission
    ↓
Database (users table)
```

## Backend Implementation

### Components Created

1. **AWS S3 Service** (`src/utils/aws-s3.service.ts`)
   - Handles all S3 operations
   - Saves applicant data as JSON files
   - Retrieves unprocessed applicants
   - Marks files as processed (or deletes them)

2. **Application Service** (`src/modules/application/application.service.ts`)
   - `submitApplication()` - Saves to S3
   - `processApplicant()` - Processes single applicant from S3 to DB
   - `processDailyApplications()` - Processes all applicants from yesterday

3. **Application Controller** (`src/modules/application/application.controller.ts`)
   - `POST /applications/submit` - Public endpoint for form submissions
   - `POST /applications/process-daily` - Manual trigger for testing

4. **Scheduled Jobs Service** (`src/modules/application/scheduled-jobs.service.ts`)
   - Daily cron job that runs at 11:59 PM UTC
   - Processes all submissions from the previous day

### Configuration

Add these environment variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Optional: For local/S3-compatible storage (e.g., LocalStack)
AWS_S3_ENDPOINT=http://localhost:4566
AWS_S3_FORCE_PATH_STYLE=true
```

### S3 Bucket Structure

Applications are stored in the following structure:
```
applications/
  └── YYYY-MM-DD/
      ├── applicant-1234567890-abc123.json
      ├── applicant-1234567891-def456.json
      └── ...
```

Each JSON file contains:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "gender": "male",
  "primaryPhone": "+1234567890",
  // ... all other user fields
  "submittedAt": "2024-01-15T10:30:00.000Z",
  "processed": false
}
```

## Testing

### Manual Testing

1. **Submit Application**:
   ```bash
   curl -X POST http://localhost:3000/applications/submit \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "gender": "male",
       "primaryPhone": "+1234567890",
       ...
     }'
   ```

2. **Manually Trigger Processing**:
   ```bash
   curl -X POST http://localhost:3000/applications/process-daily
   ```

### Scheduled Job

The cron job runs automatically at 11:59 PM UTC every day. To test:

1. Submit some applications
2. Wait for the scheduled time, OR
3. Manually trigger using the endpoint above

## Monitoring

- Check application logs for processing status
- Monitor S3 bucket for unprocessed files
- Review database for successfully processed users

## Error Handling

- Duplicate emails are detected and skipped
- Failed submissions are logged with error details
- Applications remain in S3 if processing fails (for retry)

