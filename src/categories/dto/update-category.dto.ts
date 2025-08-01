import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @ApiProperty({
    example: 'Heavy Excavators',
    description: 'The name of the category',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43d1-b456-789012345678',
    ],
    description: 'Array of equipment IDs belonging to this category',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  equipment?: string[];

  @ApiProperty({
    example: {
      original: 'categories/excavator-category.jpg',
      small: 'categories/excavator-category_small.jpg',
    },
    description: 'Image object with original and small versions',
    required: false,
  })
  @IsOptional()
  image?: { original: string; small: string };
}
