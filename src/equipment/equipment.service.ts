import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../auth/roles.enum';
import { User } from '../auth/user.entity';
import { Category } from '../categories/category.entity';
import { FileUploadService } from '../common/services/file-upload.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { Equipment } from './equipment.entity';

@Injectable()
export class EquipmentService {
  private logger = new Logger('EquipmentService', { timestamp: true });
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private fileUploadService: FileUploadService,
  ) {}

  async create(
    createEquipmentDto: CreateEquipmentDto,
    currentUser: User,
  ): Promise<Equipment> {
    // Check if category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createEquipmentDto.category_id },
    });

    if (!category) {
      this.logger.error(
        `Category with ID ${createEquipmentDto.category_id} not found`,
      );
      throw new NotFoundException(
        `Category with ID ${createEquipmentDto.category_id} not found`,
      );
    }

    // Handle base64 images if provided
    const imagePaths: Array<{ original: string; small: string }> = [];
    if (!createEquipmentDto.images || createEquipmentDto.images.length === 0) {
      throw new BadRequestException(
        'At least one image is required for equipment creation',
      );
    }

    for (const base64Image of createEquipmentDto.images) {
      const imageResult = await this.handleBase64Image(
        base64Image,
        currentUser.email.split('@')[0], // Use email prefix as subfolder
      );
      imagePaths.push(imageResult);
    }

    // Set the owner field to the current user's ID
    const equipmentData = {
      ...createEquipmentDto,
      owner: currentUser.id,
      images: imagePaths,
      available: createEquipmentDto.available ?? true,
    };

    // Remove the base64 images from the data to be saved
    delete (equipmentData as any).images;

    const equipment = this.equipmentRepository.create(equipmentData);
    equipment.images = imagePaths; // Set the processed image paths
    const savedEquipment = await this.equipmentRepository.save(equipment);

    // Update the category's equipment array
    if (!category.equipment.includes(savedEquipment.id)) {
      category.equipment.push(savedEquipment.id);
      await this.categoryRepository.save(category);
    }

    this.logger.log(
      `Equipment ${savedEquipment.name} with ID ${savedEquipment.id} created by user: ${currentUser.email}`,
    );
    return savedEquipment;
  }

  async findAll(): Promise<Equipment[]> {
    return await this.equipmentRepository.find({
      relations: ['category', 'ownerUser'],
    });
  }

  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
      relations: ['category', 'ownerUser'],
    });

    if (!equipment) {
      this.logger.error(`Equipment ${id} not found`);
      throw new NotFoundException('Equipment not found');
    }

    return equipment;
  }

  async findByCategory(categoryId: string): Promise<Equipment[]> {
    return await this.equipmentRepository.find({
      where: { category_id: categoryId },
      relations: ['category', 'ownerUser'],
    });
  }

  async findByOwner(ownerId: string): Promise<Equipment[]> {
    return await this.equipmentRepository.find({
      where: { owner: ownerId },
      relations: ['category', 'ownerUser'],
    });
  }

  async update(
    id: string,
    updateEquipmentDto: UpdateEquipmentDto,
    currentUser: User,
  ): Promise<Equipment> {
    const equipment = await this.findOne(id);

    // Check if user is authorized to update this equipment
    const isOwner = equipment.owner === currentUser.id;
    const isAdmin = currentUser.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      this.logger.error(
        `User ${currentUser.email} (${currentUser.id}) attempted to update equipment ${id} owned by ${equipment.owner}`,
      );
      throw new ForbiddenException(
        'You can only update equipment that you own, unless you are an admin',
      );
    }

    // Handle base64 images if provided (PATCH behavior: only update if new images are provided)
    const imagePaths: Array<{ original: string; small: string }> = [];
    if (updateEquipmentDto.images && updateEquipmentDto.images.length > 0) {
      // Delete old images if they exist
      if (equipment.images && equipment.images.length > 0) {
        for (const oldImageObj of equipment.images) {
          try {
            await this.fileUploadService.deleteImagePair(oldImageObj.original);
            this.logger.log(
              `Old image pair deleted for equipment ${equipment.name} (${id}): ${oldImageObj.original}`,
            );
          } catch (error) {
            this.logger.warn(
              `Failed to delete old image pair for equipment ${id}: ${error.message}`,
            );
          }
        }
      }

      // Upload new images
      for (const base64Image of updateEquipmentDto.images) {
        const imageResult = await this.handleBase64Image(
          base64Image,
          currentUser.email.split('@')[0], // Use email prefix as subfolder
        );
        imagePaths.push(imageResult);
      }
    }

    // If category is being changed, update the old and new category equipment arrays
    if (
      updateEquipmentDto.category_id &&
      updateEquipmentDto.category_id !== equipment.category_id
    ) {
      // Remove from old category
      const oldCategory = await this.categoryRepository.findOne({
        where: { id: equipment.category_id },
      });
      if (oldCategory) {
        oldCategory.equipment = oldCategory.equipment.filter(
          (eqId) => eqId !== id,
        );
        await this.categoryRepository.save(oldCategory);
      }

      // Add to new category
      const newCategory = await this.categoryRepository.findOne({
        where: { id: updateEquipmentDto.category_id },
      });
      if (newCategory && !newCategory.equipment.includes(id)) {
        newCategory.equipment.push(id);
        await this.categoryRepository.save(newCategory);
        this.logger.log(
          `Equipment ${equipment.name} moved from category ${equipment.category.name} to category ${newCategory.name} by user: ${currentUser.email}`,
        );
      }
    }

    // Remove the base64 images from the data to be saved
    delete (updateEquipmentDto as any).images;

    // Update equipment data
    Object.assign(equipment, updateEquipmentDto);

    // PATCH behavior: only update images if new ones were provided
    if (imagePaths.length > 0) {
      equipment.images = imagePaths;
    }
    // If no new images are provided, equipment.images remains unchanged (existing images preserved)

    const updatedEquipment = await this.equipmentRepository.save(equipment);
    this.logger.log(
      `Equipment ${updatedEquipment.name} with ID ${updatedEquipment.id} updated by user: ${currentUser.email}`,
    );
    return updatedEquipment;
  }

  async remove(id: string, currentUser: User): Promise<{ message: string }> {
    const equipment = await this.findOne(id);

    // Check if user is authorized to delete this equipment
    const isOwner = equipment.owner === currentUser.id;
    const isAdmin = currentUser.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      this.logger.error(
        `User ${currentUser.email} attempted to delete equipment ${equipment.name} with ID ${id} owned by ${equipment.owner}`,
      );
      throw new ForbiddenException(
        'You can only delete equipment that you own, unless you are an admin',
      );
    }

    // Delete associated images if they exist
    if (equipment.images && equipment.images.length > 0) {
      for (const imageObj of equipment.images) {
        try {
          await this.fileUploadService.deleteImagePair(imageObj.original);
        } catch (error) {
          this.logger.warn(
            `Failed to delete image pair for equipment ${id}: ${error.message}`,
          );
        }
      }
    }

    // Remove from category's equipment array
    const category = await this.categoryRepository.findOne({
      where: { id: equipment.category_id },
    });
    if (category) {
      category.equipment = category.equipment.filter((eqId) => eqId !== id);
      await this.categoryRepository.save(category);
    }

    await this.equipmentRepository.remove(equipment);
    this.logger.log(
      `Equipment ${equipment.name} with ID ${id} deleted by ${isAdmin ? 'admin' : 'owner'} user: ${currentUser.email}`,
    );
    return { message: 'Съоръжението е изтрито успешно' };
  }

  private async handleBase64Image(
    base64Data: string,
    subfolder?: string,
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
      return await this.fileUploadService.uploadImage(
        file,
        'equipment',
        subfolder,
      );
    } catch (error) {
      this.logger.error(`Failed to handle base64 image: ${error.message}`);
      throw new BadRequestException('Invalid base64 image data');
    }
  }
}
