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
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { EquipmentResponseDto } from './dto/equipment-response.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentService } from './equipment.service';

@ApiTags('equipment')
@Controller('equipment')
@UseGuards(AuthGuard())
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new equipment',
    description:
      'Creates a new equipment with the provided data and required base64 images. Equipment will be automatically added to the specified category.',
  })
  @ApiBody({
    type: CreateEquipmentDto,
    description: 'Equipment creation data with base64 images',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Equipment created successfully',
    type: EquipmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or missing required images',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async create(
    @Body() createEquipmentDto: CreateEquipmentDto,
    @GetUser() currentUser: User,
  ): Promise<EquipmentResponseDto> {
    return await this.equipmentService.create(createEquipmentDto, currentUser);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all equipment',
    description: 'Retrieves a list of all equipment',
  })
  @ApiResponse({
    status: 200,
    description: 'List of equipment retrieved successfully',
    type: [EquipmentResponseDto],
  })
  async findAll(): Promise<EquipmentResponseDto[]> {
    return await this.equipmentService.findAll();
  }

  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Get equipment by category',
    description: 'Retrieves all equipment belonging to a specific category',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'The unique identifier of the category',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of equipment in category retrieved successfully',
    type: [EquipmentResponseDto],
  })
  async findByCategory(
    @Param('categoryId') categoryId: string,
  ): Promise<EquipmentResponseDto[]> {
    return await this.equipmentService.findByCategory(categoryId);
  }

  @Get('owner/:ownerId')
  @ApiOperation({
    summary: 'Get equipment by owner',
    description: 'Retrieves all equipment owned by a specific user',
  })
  @ApiParam({
    name: 'ownerId',
    description: 'The unique identifier of the owner',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'List of equipment owned by user retrieved successfully',
    type: [EquipmentResponseDto],
  })
  async findByOwner(
    @Param('ownerId') ownerId: string,
  ): Promise<EquipmentResponseDto[]> {
    return await this.equipmentService.findByOwner(ownerId);
  }

  @Get('my-equipment')
  @ApiOperation({
    summary: 'Get current user equipment',
    description:
      'Retrieves all equipment owned by the current authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of current user equipment retrieved successfully',
    type: [EquipmentResponseDto],
  })
  async findMyEquipment(
    @GetUser() currentUser: User,
  ): Promise<EquipmentResponseDto[]> {
    return await this.equipmentService.findByOwner(currentUser.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get equipment by ID',
    description: 'Retrieves a specific equipment by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the equipment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Equipment retrieved successfully',
    type: EquipmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Equipment not found',
  })
  async findOne(@Param('id') id: string): Promise<EquipmentResponseDto> {
    return await this.equipmentService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update equipment',
    description:
      'Updates an existing equipment with the provided data and optional base64 images. Equipment can be moved between categories. Only the equipment owner or admin users can update equipment.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the equipment to update',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateEquipmentDto,
    description: 'Equipment update data with optional base64 images',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Equipment updated successfully',
    type: EquipmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Equipment not found',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only equipment owner or admin can update equipment',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
    @GetUser() currentUser: User,
  ): Promise<EquipmentResponseDto> {
    return await this.equipmentService.update(
      id,
      updateEquipmentDto,
      currentUser,
    );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete equipment',
    description:
      'Deletes an existing equipment. Equipment will be removed from its category. Only the equipment owner or admin users can delete equipment.',
  })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the equipment to delete',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Equipment deleted successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Съоръжението е изтрито успешно',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Equipment not found',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden - Only equipment owner or admin can delete equipment',
  })
  async remove(
    @Param('id') id: string,
    @GetUser() currentUser: User,
  ): Promise<{ message: string }> {
    return await this.equipmentService.remove(id, currentUser);
  }
}
