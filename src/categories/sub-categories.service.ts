import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { FileUploadService } from '../common/services/file-upload.service';
import { Category } from './category.entity';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategory } from './sub-category.entity';

@Injectable()
export class SubCategoriesService {
  private logger = new Logger('SubCategoriesService', { timestamp: true });
  constructor(
    @InjectRepository(SubCategory)
    private subCategoriesRepository: Repository<SubCategory>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    createSubCategoryDto: CreateSubCategoryDto,
    currentUser: User,
  ): Promise<SubCategory> {
    // Check if category exists
    const category = await this.categoriesRepository.findOne({
      where: { id: createSubCategoryDto.categoryId },
    });

    if (!category) {
      this.logger.error(
        `Category with ID ${createSubCategoryDto.categoryId} not found`,
      );
      throw new NotFoundException(
        `Category with ID ${createSubCategoryDto.categoryId} not found`,
      );
    }

    // Handle base64 image (required)
    const imageObj = await this.handleBase64Image(createSubCategoryDto.image);

    // Set the creatorId field to the current user's ID
    const subCategoryData = {
      categoryId: createSubCategoryDto.categoryId,
      type: createSubCategoryDto.type,
      minRange: createSubCategoryDto.minRange,
      maxRange: createSubCategoryDto.maxRange,
      creatorId: currentUser.id,
    };

    const subCategory = this.subCategoriesRepository.create(subCategoryData);

    // Set the processed image paths
    subCategory.image = imageObj;

    const savedSubCategory =
      await this.subCategoriesRepository.save(subCategory);
    this.logger.log(
      `SubCategory ${savedSubCategory.type} created by user: ${currentUser.email}`,
    );
    return savedSubCategory;
  }

  async findAll(categoryId?: string): Promise<SubCategory[]> {
    if (categoryId) {
      return await this.subCategoriesRepository.find({
        where: { categoryId },
        relations: ['category', 'creator'],
      });
    }
    return await this.subCategoriesRepository.find({
      relations: ['category', 'creator'],
    });
  }

  async findOne(id: string): Promise<SubCategory> {
    const subCategory = await this.subCategoriesRepository.findOne({
      where: { id },
      relations: ['category', 'creator'],
    });

    if (!subCategory) {
      this.logger.error(`SubCategory ${id} not found`);
      throw new NotFoundException('SubCategory not found');
    }

    return subCategory;
  }

  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
    currentUser: User,
  ): Promise<SubCategory> {
    const subCategory = await this.findOne(id);

    // If categoryId is being updated, check if new category exists
    if (
      updateSubCategoryDto.categoryId &&
      updateSubCategoryDto.categoryId !== subCategory.categoryId
    ) {
      const category = await this.categoriesRepository.findOne({
        where: { id: updateSubCategoryDto.categoryId },
      });

      if (!category) {
        this.logger.error(
          `Category with ID ${updateSubCategoryDto.categoryId} not found`,
        );
        throw new NotFoundException(
          `Category with ID ${updateSubCategoryDto.categoryId} not found`,
        );
      }
    }

    // Handle base64 image if provided (PATCH behavior: only update if new image is provided)
    let imageObj: { original: string; small: string } | undefined;
    if (
      updateSubCategoryDto.image &&
      typeof updateSubCategoryDto.image === 'string'
    ) {
      // Delete old image if exists
      if (subCategory.image) {
        await this.fileUploadService.deleteImagePair(
          subCategory.image.original,
        );
      }
      // Upload new image
      imageObj = await this.handleBase64Image(updateSubCategoryDto.image);
    }

    // Remove the base64 image data from the data to be saved
    delete updateSubCategoryDto.image;

    Object.assign(subCategory, updateSubCategoryDto);

    // PATCH behavior: only update image if a new one was provided
    if (imageObj) {
      subCategory.image = imageObj;
    }

    const updatedSubCategory =
      await this.subCategoriesRepository.save(subCategory);
    this.logger.log(
      `SubCategory ${updatedSubCategory.type} updated by user: ${currentUser.email}`,
    );
    return updatedSubCategory;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const subCategory = await this.findOne(id);

    // Delete associated image if exists
    if (subCategory.image) {
      await this.fileUploadService.deleteImagePair(subCategory.image.original);
    }

    await this.subCategoriesRepository.remove(subCategory);
    this.logger.log(
      `SubCategory ${subCategory.type} deleted by user: ${currentUser.email}`,
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
      return await this.fileUploadService.uploadImage(file, 'sub-categories');
    } catch (error) {
      this.logger.error(`Failed to handle base64 image: ${error.message}`);
      throw new BadRequestException('Invalid base64 image data');
    }
  }
}
