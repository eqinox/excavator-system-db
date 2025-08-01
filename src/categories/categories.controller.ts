import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from 'src/auth/admin.guard';
import { FileValidationPipe } from '../common/pipes/file-validation.pipe';

@ApiTags('categories')
@Controller('categories')
@UseGuards(AuthGuard())
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new category',
    description:
      'Creates a new category with the provided name, optional equipment array, and optional image. Only admins can create categories.',
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'Category creation data',
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
    @UploadedFile(FileValidationPipe)
    imageFile?: Express.Multer.File,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.create(
      createCategoryDto,
      currentUser,
      imageFile,
    );
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
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update a category',
    description:
      'Updates an existing category with the provided data and optional image. Only admins can update categories.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the category to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'Category update data',
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
    @UploadedFile(FileValidationPipe)
    imageFile?: Express.Multer.File,
  ): Promise<CategoryResponseDto> {
    return await this.categoriesService.update(
      id,
      updateCategoryDto,
      currentUser,
      imageFile,
    );
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
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
    status: 204,
    description: 'Category deleted successfully',
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
  ): Promise<void> {
    return await this.categoriesService.remove(id, currentUser);
  }
}
