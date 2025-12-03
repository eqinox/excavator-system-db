import { ApiProperty } from '@nestjs/swagger';
import { SubCategoryResponseDto } from './sub-category-response.dto';

export class CategoryResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the category',
  })
  id: string;

  @ApiProperty({
    example: 'Excavators',
    description: 'The name of the category',
  })
  name: string;

  @ApiProperty({
    example: {
      original: 'categories/excavator-category.jpg',
      small: 'categories/excavator-category_small.jpg',
    },
    description: 'Image object with original and small versions',
    required: false,
  })
  image?: { original: string; small: string };

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who created this category',
  })
  creatorId: string;

  @ApiProperty({
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'Mini Excavator',
        minRange: 0,
        maxRange: 10,
        image: {
          original: 'sub-categories/mini-excavator.jpg',
          small: 'sub-categories/mini-excavator_small.jpg',
        },
        creatorId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    ],
    description: 'Array of subCategories belonging to this category',
    type: [SubCategoryResponseDto],
  })
  subCategories: SubCategoryResponseDto[];

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'The creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'The last update timestamp',
  })
  updatedAt: Date;
}
