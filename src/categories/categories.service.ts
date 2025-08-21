import {
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

@Injectable()
export class CategoriesService {
  private logger = new Logger('CategoriesService', { timestamp: true });
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    currentUser: User,
    imageFile?: Express.Multer.File,
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

    // Upload image if provided
    let imageObj: { original: string; small: string } | undefined;
    if (imageFile) {
      imageObj = await this.fileUploadService.uploadImage(
        imageFile,
        'categories',
      );
    }

    // Set the created_by field to the current user's ID
    const categoryData = {
      ...createCategoryDto,
      created_by: currentUser.id,
      image: imageObj,
    };

    const category = this.categoriesRepository.create(categoryData);
    const savedCategory = await this.categoriesRepository.save(category);
    this.logger.log(
      `Category ${savedCategory.name} created by user: ${currentUser.email}`,
    );
    return savedCategory;
  }

  async findAll(): Promise<Category[]> {
    return await this.categoriesRepository.find();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({
      where: { id },
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
    imageFile?: Express.Multer.File,
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

    // Handle image upload if provided
    if (imageFile) {
      // Delete old image if exists
      if (category.image) {
        await this.fileUploadService.deleteImagePair(category.image.original);
      }
      // Upload new image
      const imageObj = await this.fileUploadService.uploadImage(
        imageFile,
        'categories',
      );
      updateCategoryDto.image = imageObj;
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoriesRepository.save(category);
    this.logger.log(
      `Category ${updatedCategory.name} updated by user: ${currentUser.email}`,
    );
    return updatedCategory;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const category = await this.findOne(id);

    // Delete associated image if exists
    if (category.image) {
      await this.fileUploadService.deleteImagePair(category.image.original);
    }

    await this.categoriesRepository.remove(category);
    this.logger.log(
      `Category ${category.name} deleted by user: ${currentUser.email}`,
    );
  }
}
