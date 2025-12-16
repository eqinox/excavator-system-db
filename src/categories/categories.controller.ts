import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/admin.guard';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CategoriesService } from './categories.service';
import { CategoryResponseDto } from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { SubCategoryResponseDto } from './dto/sub-category-response.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoriesService } from './sub-categories.service';

@ApiTags('categories')
@Controller('categories')
@UseGuards(AuthGuard())
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly subCategoriesService: SubCategoriesService,
  ) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Creates a new category with the provided name and optional base64 image. Only admins can create categories.',
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category creation data with optional base64 image',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @GetUser() currentUser: User,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.create(createCategoryDto, currentUser);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieves a list of all categories',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async findAll(): Promise<CategoryResponseDto[]> {
    return await this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a category by ID',
    description: 'Retrieves a specific category by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return await this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a category',
    description:
      'Updates an existing category with the provided data and optional base64 image. Only admins can update categories.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the category to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Category update data with optional base64 image',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Category with this name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @GetUser() currentUser: User,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.update(
      id,
      updateCategoryDto,
      currentUser,
    );
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a category',
    description:
      'Removes a category from the system. Only admins can delete categories.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the category to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Категорията е изтрита успешно',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async remove(
    @Param('id') id: string,
    @GetUser() currentUser: User,
  ): Promise<{ message: string }> {
    await this.categoriesService.remove(id, currentUser);
    return { message: 'Категорията е изтрита успешно' };
  }

  @Post(':categoryId/sub-categories')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new subCategory',
    description:
      'Creates a new subCategory for a specific category with the provided data and optional base64 image. Only admins can create subCategories.',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'The unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CreateSubCategoryDto,
    description: 'SubCategory creation data with optional base64 image',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'SubCategory created successfully',
    type: SubCategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async createSubCategory(
    @Param('categoryId') categoryId: string,
    @Body() createSubCategoryDto: CreateSubCategoryDto,
    @GetUser() currentUser: User,
  ): Promise<SubCategoryResponseDto> {
    // Ensure categoryId in DTO matches the path parameter
    createSubCategoryDto.categoryId = categoryId;
    return await this.subCategoriesService.create(
      createSubCategoryDto,
      currentUser,
    );
  }

  @Get(':categoryId/sub-categories')
  @ApiOperation({
    summary: 'Get all subCategories for a category',
    description:
      'Retrieves a list of all subCategories belonging to a specific category',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'The unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of subCategories retrieved successfully',
    type: [SubCategoryResponseDto],
  })
  async findAllSubCategories(
    @Param('categoryId') categoryId: string,
  ): Promise<SubCategoryResponseDto[]> {
    return await this.subCategoriesService.findAll(categoryId);
  }
}

@ApiTags('sub-categories')
@Controller('sub-categories')
@UseGuards(AuthGuard())
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new subCategory',
    description:
      'Creates a new subCategory with the provided data and optional base64 image. Only admins can create subCategories.',
  })
  @ApiBody({
    type: CreateSubCategoryDto,
    description: 'SubCategory creation data with optional base64 image',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'SubCategory created successfully',
    type: SubCategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async create(
    @Body() createSubCategoryDto: CreateSubCategoryDto,
    @GetUser() currentUser: User,
  ): Promise<SubCategoryResponseDto> {
    return await this.subCategoriesService.create(
      createSubCategoryDto,
      currentUser,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all subCategories',
    description: 'Retrieves a list of all subCategories',
  })
  @ApiResponse({
    status: 200,
    description: 'List of subCategories retrieved successfully',
    type: [SubCategoryResponseDto],
  })
  async findAll(): Promise<SubCategoryResponseDto[]> {
    return await this.subCategoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a subCategory by ID',
    description: 'Retrieves a specific subCategory by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the subCategory',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'SubCategory retrieved successfully',
    type: SubCategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'SubCategory not found',
  })
  async findOne(@Param('id') id: string): Promise<SubCategoryResponseDto> {
    return await this.subCategoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update a subCategory',
    description:
      'Updates an existing subCategory with the provided data and optional base64 image. Only admins can update subCategories.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the subCategory to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateSubCategoryDto,
    description: 'SubCategory update data with optional base64 image',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'SubCategory updated successfully',
    type: SubCategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'SubCategory not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
    @GetUser() currentUser: User,
  ): Promise<SubCategoryResponseDto> {
    return await this.subCategoriesService.update(
      id,
      updateSubCategoryDto,
      currentUser,
    );
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a subCategory',
    description:
      'Removes a subCategory from the system. Only admins can delete subCategories.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the subCategory to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'SubCategory deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Подкатегорията е изтрита успешно',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'SubCategory not found',
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Cannot delete subCategory that has associated equipment',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example:
            'Cannot delete subCategory that has associated equipment. Please delete or reassign all equipment first.',
        },
        statusCode: { type: 'number', example: 400 },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async remove(
    @Param('id') id: string,
    @GetUser() currentUser: User,
  ): Promise<{ message: string }> {
    await this.subCategoriesService.remove(id, currentUser);
    return { message: 'Подкатегорията е изтрита успешно' };
  }
}
