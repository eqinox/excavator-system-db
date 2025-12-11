import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { FileUploadService } from '../common/services/file-upload.service';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SubCategory } from './sub-category.entity';

@Injectable()
export class CategoriesService {
  private logger = new Logger('CategoriesService', { timestamp: true });
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(SubCategory)
    private subCategoriesRepository: Repository<SubCategory>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    currentUser: User,
  ): Promise<Category> {
    // Check if category with the same name already exists
    const existingCategory = await this.categoriesRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingCategory) {
      this.logger.error(
        `Category with name ${createCategoryDto.name} already exists`,
      );
      throw new ConflictException('Category with this name already exists');
    }

    // Handle base64 image if provided
    let imageObj: { original: string; small: string } | undefined;
    if (createCategoryDto.image) {
      imageObj = await this.handleBase64Image(createCategoryDto.image);
    }

    // Set the creatorId field to the current user's ID
    const categoryData = {
      name: createCategoryDto.name,
      creatorId: currentUser.id,
    };

    const category = this.categoriesRepository.create(categoryData);

    // Set the processed image paths if image was uploaded
    if (imageObj) {
      category.image = imageObj;
    }

    const savedCategory = await this.categoriesRepository.save(category);
    this.logger.log(
      `Category ${savedCategory.name} created by user: ${currentUser.email}`,
    );
    return savedCategory;
  }

  async findAll(): Promise<Category[]> {
    return await this.categoriesRepository.find({
      relations: ['subCategories', 'creator'],
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['subCategories', 'creator'],
    });

    if (!category) {
      this.logger.error(`Category ${id} not found`);
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    currentUser: User,
  ): Promise<Category> {
    const category = await this.findOne(id);

    // If name is being updated, check for conflicts
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoriesRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        this.logger.error(
          `Category with name ${updateCategoryDto.name} already exists`,
        );
        throw new ConflictException('Category with this name already exists');
      }
    }

    // Handle base64 image if provided (PATCH behavior: only update if new image is provided)
    let imageObj: { original: string; small: string } | undefined;
    if (
      updateCategoryDto.image &&
      typeof updateCategoryDto.image === 'string'
    ) {
      // Delete old image if exists
      if (category.image) {
        await this.fileUploadService.deleteImagePair(category.image.original);
      }
      // Upload new image
      imageObj = await this.handleBase64Image(updateCategoryDto.image);
    }

    // Remove the base64 image data from the data to be saved
    delete updateCategoryDto.image;

    Object.assign(category, updateCategoryDto);

    // PATCH behavior: only update image if a new one was provided
    // If no new image is provided, keep the existing image
    if (imageObj) {
      category.image = imageObj;
    }
    // If no new image is provided, category.image remains unchanged (existing image preserved)

    const updatedCategory = await this.categoriesRepository.save(category);
    this.logger.log(
      `Category ${updatedCategory.name} updated by user: ${currentUser.email}`,
    );
    return updatedCategory;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const category = await this.findOne(id);

    // Check if category has associated sub categories
    if (category.subCategories && category.subCategories.length > 0) {
      this.logger.error(
        `Cannot delete category ${category.name} because it has ${category.subCategories.length} associated sub category(ies)`,
      );
      throw new BadRequestException(
        'Cannot delete category that has associated sub categories. Please delete all sub categories first.',
      );
    }

    // Delete associated image if exists
    if (category.image) {
      await this.fileUploadService.deleteImagePair(category.image.original);
    }

    await this.categoriesRepository.remove(category);
    this.logger.log(
      `Category ${category.name} deleted by user: ${currentUser.email}`,
    );
  }

  private async handleBase64Image(
    base64Data: string,
  ): Promise<{ original: string; small: string }> {
    try {
      // Remove data URL prefix if present
      const base64String = base64Data.replace(
        /^data:image\/[a-z]+;base64,/,
        '',
      );

      // Convert base64 to buffer
      const buffer = Buffer.from(base64String, 'base64');

      // Create a mock file object for the upload service
      const file: Express.Multer.File = {
        buffer,
        originalname: 'image.jpg',
        mimetype: 'image/jpeg',
        size: buffer.length,
        fieldname: 'image',
        encoding: '7bit',
        destination: '',
        filename: '',
        path: '',
        stream: undefined as any,
      };

      // Validate file size (using the same logic as FileValidationPipe)
      const maxSize = 10 * 1024 * 1024; // 10 MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          `File size exceeds maximum allowed size of ${maxSize} bytes`,
        );
      }

      // Upload using the existing file upload service
      return await this.fileUploadService.uploadImage(file, 'categories');
    } catch (error) {
      this.logger.error(`Failed to handle base64 image: ${error.message}`);
      throw new BadRequestException('Invalid base64 image data');
    }
  }
}
