import { ApiProperty } from '@nestjs/swagger';

export class SubCategoryResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the subCategory',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category this subCategory belongs to',
  })
  categoryId: string;

  @ApiProperty({
    example: 'Mini Excavator',
    description: 'The type of the subCategory',
  })
  type: string;

  @ApiProperty({
    example: 0,
    description: 'The minimum range value',
  })
  minRange: number;

  @ApiProperty({
    example: 10,
    description: 'The maximum range value',
  })
  maxRange: number;

  @ApiProperty({
    example: {
      original: 'sub-categories/mini-excavator.jpg',
      small: 'sub-categories/mini-excavator_small.jpg',
    },
    description: 'Image object with original and small versions',
    required: false,
  })
  image?: { original: string; small: string };

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who created this subCategory',
  })
  creatorId: string;

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



