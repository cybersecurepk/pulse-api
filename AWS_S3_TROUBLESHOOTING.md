# AWS S3 Configuration Troubleshooting Guide

## Steps to Fix AWS S3 Configuration Issues

### 1. Verify Your .env File Location
Make sure your `.env` file is in the **root directory** of your project (same level as `package.json`).

### 2. Check Environment Variable Names
Ensure your `.env` file has these **exact** variable names (case-sensitive):

```env
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### 3. Check for Common Issues

**❌ Wrong:**
```env
AWS_S3_BUCKET_NAME = "my-bucket"  # Spaces around =
AWS_S3_BUCKET_NAME="my-bucket"    # Quotes not needed
AWS_S3_BUCKET_NAME= my-bucket     # Space after =
```

**✅ Correct:**
```env
AWS_S3_BUCKET_NAME=my-bucket
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### 4. Restart Your Server
After adding or modifying `.env` variables, **restart your NestJS server**:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run start:dev
```

### 5. Verify Values Are Loaded
When you start the server, you should see logs showing:
```
[AwsS3Service] AWS Config loaded:
  Bucket Name: SET
  Access Key ID: SET
  Secret Access Key: SET
```

If you see "MISSING" for any of these, the environment variables are not being loaded.

### 6. Test Environment Variables Directly
You can verify the variables are loaded by checking:
```bash
# In your terminal, run:
node -e "require('dotenv').config(); console.log(process.env.AWS_S3_BUCKET_NAME)"
```

### 7. Common Mistakes

1. **Typo in variable name**: Check for typos like `AWS_S3_BUCKET` instead of `AWS_S3_BUCKET_NAME`
2. **.env file not loaded**: Ensure `.env` is in the project root
3. **Server not restarted**: Always restart after changing `.env`
4. **Empty values**: Make sure values are not empty strings
5. **Hidden characters**: Copy-paste might add hidden characters

### 8. Alternative: Use AWS Credentials File
If `.env` file doesn't work, you can also use AWS credentials file:
```
~/.aws/credentials
```

With format:
```
[default]
aws_access_key_id = YOUR_ACCESS_KEY
aws_secret_access_key = YOUR_SECRET_KEY
```

Then set only:
```env
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

### 9. Verify AWS Credentials
Make sure your AWS credentials have S3 permissions:
- `s3:PutObject`
- `s3:GetObject`
- `s3:ListBucket`
- `s3:DeleteObject`

### 10. Check Server Logs
When you restart the server, check the logs for:
- Any errors about missing environment variables
- The AWS Config loaded messages showing SET/MISSING status

If you're still having issues, share the server startup logs showing the AWS Config loaded messages.

