import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { User } from '../auth/user.entity';
import { Role } from '../auth/roles.enum';

@Injectable()
export class CategoriesService {
  private logger = new Logger('CategoriesService', { timestamp: true });
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

    // Set the created_by field to the current user's ID
    const categoryData = {
      ...createCategoryDto,
      created_by: currentUser.id,
    };

    const category = this.categoriesRepository.create(categoryData);
    const savedCategory = await this.categoriesRepository.save(category);
    this.logger.log(
      `Category ${savedCategory.id} created by user: ${currentUser.email} with id: ${currentUser.id}`,
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

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoriesRepository.save(category);
    this.logger.log(
      `Category ${updatedCategory.id} updated by user: ${currentUser.email} with id: ${currentUser.id}`,
    );
    return updatedCategory;
  }

  async remove(id: string, currentUser: User): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    this.logger.log(
      `Category ${id} deleted by user: ${currentUser.email} with id: ${currentUser.id}`,
    );
  }
}
