# Production Deployment Guide - File Storage

## Overview

This guide explains how to handle file storage in production environments. The system supports multiple storage backends to ensure your uploaded files are properly managed in production.

## Storage Options

### 1. Local File System (Development/Testing)

**Use Case**: Development, testing, or small-scale deployments
**Pros**: Simple setup, no external dependencies
**Cons**: Files lost on server restart, not scalable across multiple instances

**Configuration**:

```env
STORAGE_TYPE=local
UPLOAD_PATH=public/images
```

### 2. Cloud Storage (Production Recommended)

**Use Case**: Production environments, scalable applications
**Pros**: Persistent, scalable, backed up, accessible from multiple instances
**Cons**: Requires cloud provider setup, additional costs

#### AWS S3 Configuration

```env
STORAGE_TYPE=cloud
CLOUD_PROVIDER=aws
CLOUD_BUCKET=your-app-uploads-bucket
CLOUD_REGION=us-east-1
CLOUD_ACCESS_KEY_ID=your-access-key
CLOUD_SECRET_ACCESS_KEY=your-secret-key
CLOUD_BASE_URL=https://your-bucket.s3.amazonaws.com
```

#### Google Cloud Storage Configuration

```env
STORAGE_TYPE=cloud
CLOUD_PROVIDER=gcp
CLOUD_BUCKET=your-app-uploads-bucket
CLOUD_REGION=us-central1
CLOUD_ACCESS_KEY_ID=your-service-account-key
CLOUD_SECRET_ACCESS_KEY=your-service-account-secret
CLOUD_BASE_URL=https://storage.googleapis.com/your-bucket
```

## Production Deployment Steps

### 1. Environment Configuration

Create a `.env` file for production:

```env
# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=your-db-name

# JWT
JWT_SECRET=your-super-secure-jwt-secret

# Storage (Choose one option)
# Option A: Local storage
STORAGE_TYPE=local
UPLOAD_PATH=public/images

# Option B: AWS S3
STORAGE_TYPE=cloud
CLOUD_PROVIDER=aws
CLOUD_BUCKET=your-app-uploads
CLOUD_REGION=us-east-1
CLOUD_ACCESS_KEY_ID=your-access-key
CLOUD_SECRET_ACCESS_KEY=your-secret-key
CLOUD_BASE_URL=https://your-bucket.s3.amazonaws.com

# Upload limits
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png,gif
```

### 2. Cloud Storage Setup

#### AWS S3 Setup:

1. Create an S3 bucket
2. Configure CORS for your domain:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

3. Create an IAM user with S3 permissions
4. Get access keys and configure environment variables

#### Google Cloud Storage Setup:

1. Create a GCS bucket
2. Create a service account with Storage Object Admin role
3. Download the service account key JSON
4. Configure environment variables

### 3. Install Cloud Storage Dependencies

For AWS S3:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

For Google Cloud Storage:

```bash
npm install @google-cloud/storage
```

### 4. Server Configuration

#### For Local Storage:

- Ensure the upload directory is writable
- Consider using a volume mount in Docker
- Set up regular backups of the upload directory

#### For Cloud Storage:

- No special server configuration needed
- Files are automatically distributed and backed up

### 5. Docker Deployment Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY public ./public

# Create upload directory
RUN mkdir -p public/images

EXPOSE 3000

CMD ["node", "dist/main"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - STORAGE_TYPE=cloud
      - CLOUD_PROVIDER=aws
      # ... other env vars
    volumes:
      # Only needed for local storage
      - ./uploads:/app/public/images
```

## Security Considerations

### 1. File Validation

- Always validate file types and sizes
- Scan uploaded files for malware
- Use secure file naming (UUID-based)

### 2. Access Control

- Implement proper authentication for uploads
- Use signed URLs for private files
- Set appropriate CORS policies

### 3. Environment Variables

- Never commit secrets to version control
- Use environment-specific configuration
- Rotate access keys regularly

## Monitoring and Maintenance

### 1. File Cleanup

- Implement automatic cleanup of orphaned files
- Monitor storage usage and costs
- Set up alerts for storage limits

### 2. Backup Strategy

- Cloud storage providers handle backups automatically
- For local storage, implement regular backups
- Test restore procedures

### 3. Performance Optimization

- Use CDN for static file delivery
- Implement image resizing for thumbnails
- Consider using signed URLs for private access

## Migration from Local to Cloud Storage

If you're migrating from local storage to cloud storage:

1. **Backup existing files**: Download all files from local storage
2. **Upload to cloud**: Use a migration script to upload files to cloud storage
3. **Update database**: Update file paths in your database
4. **Test thoroughly**: Ensure all file URLs work correctly
5. **Switch configuration**: Change `STORAGE_TYPE` to `cloud`
6. **Monitor**: Watch for any issues during the transition

## Troubleshooting

### Common Issues:

1. **File upload fails**: Check file permissions and storage configuration
2. **Files not accessible**: Verify CORS settings and URL generation
3. **Storage costs high**: Implement file lifecycle policies
4. **Performance issues**: Consider CDN and image optimization

### Debug Commands:

```bash
# Check storage configuration
echo $STORAGE_TYPE
echo $CLOUD_BUCKET

# Test file upload
curl -X POST -F "file=@test.jpg" http://localhost:3000/api/upload

# Check storage usage (local)
du -sh public/images/
```
