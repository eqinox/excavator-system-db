import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';

export enum StorageType {
  LOCAL = 'local',
  CLOUD = 'cloud',
}

export interface StorageConfig {
  type: StorageType;
  localPath?: string;
  cloudProvider?: 'aws' | 'gcp' | 'azure';
  cloudConfig?: {
    bucket?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
  };
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);
  private storageConfig: StorageConfig;

  constructor(private configService: ConfigService) {
    this.initializeStorageConfig();
  }

  private initializeStorageConfig(): void {
    const storageType = this.configService.get<string>('STORAGE_TYPE', 'local');

    this.storageConfig = {
      type: storageType as StorageType,
      localPath: this.configService.get<string>('UPLOAD_PATH', 'public/images'),
      cloudProvider: this.configService.get<string>('CLOUD_PROVIDER') as any,
      cloudConfig: {
        bucket: this.configService.get<string>('CLOUD_BUCKET'),
        region: this.configService.get<string>('CLOUD_REGION'),
        accessKeyId: this.configService.get<string>('CLOUD_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'CLOUD_SECRET_ACCESS_KEY',
        ),
      },
    };
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    subfolder?: string,
  ): Promise<{ original: string; small: string }> {
    try {
      switch (this.storageConfig.type) {
        case StorageType.LOCAL:
          return await this.uploadToLocal(file, folder, subfolder);
        case StorageType.CLOUD:
          return await this.uploadToCloud(file, folder, subfolder);
        default:
          throw new Error(
            `Unsupported storage type: ${this.storageConfig.type}`,
          );
      }
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    folder: string,
    subfolder?: string,
  ): Promise<{ original: string; small: string }> {
    const localPath = this.storageConfig.localPath || 'public/images';
    const uploadsDir = path.join(process.cwd(), localPath);
    const categoryDir = path.join(uploadsDir, folder);

    // Create subfolder path if provided
    const finalDir = subfolder
      ? path.join(categoryDir, subfolder)
      : categoryDir;

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    if (subfolder && !fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    const fileExtension = path.extname(file.originalname);
    const baseFileName = uuidv4();
    const originalFileName = `${baseFileName}${fileExtension}`;
    const smallFileName = `${baseFileName}_small${fileExtension}`;

    const originalFilePath = path.join(finalDir, originalFileName);
    const smallFilePath = path.join(finalDir, smallFileName);

    // Save original file
    fs.writeFileSync(originalFilePath, file.buffer);

    // Create small version (thumbnail)
    try {
      await sharp(file.buffer)
        .resize(300, 300, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality: 80 })
        .toFile(smallFilePath);

      this.logger.log(`Created thumbnail: ${smallFileName}`);
    } catch (error) {
      this.logger.error(`Failed to create thumbnail: ${error.message}`);
      // If thumbnail creation fails, copy original as small
      fs.copyFileSync(originalFilePath, smallFilePath);
    }

    // Create relative paths with subfolder if provided
    const originalRelativePath = subfolder
      ? `${folder}/${subfolder}/${originalFileName}`
      : `${folder}/${originalFileName}`;

    const smallRelativePath = subfolder
      ? `${folder}/${subfolder}/${smallFileName}`
      : `${folder}/${smallFileName}`;

    this.logger.log(
      `Files uploaded successfully to local storage: ${originalRelativePath} (original), ${smallRelativePath} (small)`,
    );

    return {
      original: originalRelativePath,
      small: smallRelativePath,
    };
  }

  private async uploadToCloud(
    file: Express.Multer.File,
    folder: string,
    subfolder?: string,
  ): Promise<{ original: string; small: string }> {
    // This is a placeholder for cloud storage implementation
    // You would implement AWS S3, Google Cloud Storage, or Azure Blob Storage here
    this.logger.warn(
      'Cloud storage not implemented yet. Using local fallback.',
    );
    return await this.uploadToLocal(file, folder, subfolder);
  }

  async deleteImage(imagePath: string): Promise<void> {
    try {
      switch (this.storageConfig.type) {
        case StorageType.LOCAL:
          await this.deleteFromLocal(imagePath);
          break;
        case StorageType.CLOUD:
          await this.deleteFromCloud(imagePath);
          break;
        default:
          throw new Error(
            `Unsupported storage type: ${this.storageConfig.type}`,
          );
      }
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
    }
  }

  async deleteImagePair(imagePath: string): Promise<void> {
    try {
      // Extract base path and extension
      const pathParts = imagePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const basePath = pathParts.slice(0, -1).join('/');

      // Determine if this is original or small version
      const isOriginal = !fileName.includes('_small');
      const isSmall = fileName.includes('_small');

      if (isOriginal) {
        // Delete original and small
        const smallPath = imagePath.replace(
          fileName,
          fileName.replace('.', '_small.'),
        );
        await this.deleteImage(imagePath);
        await this.deleteImage(smallPath);
      } else if (isSmall) {
        // Delete small and original
        const originalPath = imagePath.replace('_small.', '.');
        await this.deleteImage(imagePath);
        await this.deleteImage(originalPath);
      } else {
        // Fallback to single file deletion
        await this.deleteImage(imagePath);
      }
    } catch (error) {
      this.logger.error(`Image pair deletion failed: ${error.message}`);
    }
  }

  private async deleteFromLocal(imagePath: string): Promise<void> {
    const localPath = this.storageConfig.localPath || 'public/images';
    const fullPath = path.join(process.cwd(), localPath, imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      this.logger.log(
        `File deleted successfully from local storage: ${imagePath}`,
      );
    }
  }

  private async deleteFromCloud(imagePath: string): Promise<void> {
    // Placeholder for cloud storage deletion
    this.logger.warn('Cloud storage deletion not implemented yet.');
  }

  getImageUrl(imagePath: string): string {
    switch (this.storageConfig.type) {
      case StorageType.LOCAL:
        return `/images/${imagePath}`;
      case StorageType.CLOUD:
        // Return cloud storage URL
        return `${this.configService.get<string>('CLOUD_BASE_URL')}/${imagePath}`;
      default:
        return `/images/${imagePath}`;
    }
  }
}
