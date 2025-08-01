import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  transform(
    file: Express.Multer.File | Express.Multer.File[],
    metadata: ArgumentMetadata,
  ) {
    // Handle single file
    if (file && !Array.isArray(file)) {
      return this.validateSingleFile(file);
    }

    // Handle array of files
    if (Array.isArray(file)) {
      return file.map((f) => this.validateSingleFile(f));
    }

    return file; // File is optional
  }

  private validateSingleFile(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      return file; // File is optional
    }

    // Get max file size from config
    const maxSize = this.configService.get<number>(
      'UPLOAD_MAX_SIZE',
      10 * 1024 * 1024,
    );

    // Validate file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${maxSize} bytes`,
      );
    }

    // Validate file type
    // Get the allowed types as a comma-separated string from config, defaulting to 'image/jpg,image/jpeg,image/png'
    const allowedTypesString = this.configService.get<string[] | string>(
      'UPLOAD_ALLOWED_TYPES',
      ['image/jpg', 'image/jpeg', 'image/png'],
    );
    // Convert to array and trim whitespace
    const allowedMimeTypes = (allowedTypesString as string)
      .split(',')
      .map((type) => type.trim().toLowerCase())
      .filter((type) => type.length > 0);

    if (!allowedMimeTypes.includes(file.mimetype)) {
      // Extract extensions for error message
      const extensions = allowedMimeTypes.map((type) => {
        const match = type.match(/^image\/(png|jpe?g)$/i);
        return match ? match[1].toUpperCase() : type;
      });
      throw new BadRequestException(
        `Only ${extensions.join(', ')} files are allowed`,
      );
    }

    return file;
  }
}

// Factory function to create the pipe
export function createFileValidationPipe(
  configService: ConfigService,
): FileValidationPipe {
  return new FileValidationPipe(configService);
}
