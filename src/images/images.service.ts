import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  async serveCategoryImage(filename: string): Promise<string> {
    const imagePath = join(
      process.cwd(),
      'public',
      'images',
      'categories',
      filename,
    );

    if (!existsSync(imagePath)) {
      this.logger.error(`Category image not found: ${filename}`);
      throw new NotFoundException('Image not found');
    }

    this.logger.log(`Serving category image: ${filename}`);
    return imagePath;
  }

  async serveEquipmentImage(filename: string): Promise<string> {
    const imagePath = join(
      process.cwd(),
      'public',
      'images',
      'equipment',
      filename,
    );

    if (!existsSync(imagePath)) {
      this.logger.error(`Equipment image not found: ${filename}`);
      throw new NotFoundException('Image not found');
    }

    this.logger.log(`Serving equipment image: ${filename}`);
    return imagePath;
  }
}
