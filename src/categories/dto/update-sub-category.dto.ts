import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateSubCategoryDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category this subCategory belongs to',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiProperty({
    example: 'Mini Excavator',
    description: 'The type of the subCategory',
    required: false,
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    example: 0,
    description: 'The minimum range value',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  minRange?: number;

  @ApiProperty({
    example: 10,
    description: 'The maximum range value',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  maxRange?: number;

  @ApiProperty({
    example:
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
    description: 'Base64 encoded image data (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}










