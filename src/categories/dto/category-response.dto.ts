import { ApiProperty } from '@nestjs/swagger';

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
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '987fcdeb-51a2-43d1-b456-789012345678',
    ],
    description: 'Array of equipment IDs belonging to this category',
  })
  equipment: string[];

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
    example: '2024-01-15T10:30:00.000Z',
    description: 'The creation timestamp',
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'The last update timestamp',
  })
  updated_at: Date;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who created this category',
  })
  created_by: string;
}
