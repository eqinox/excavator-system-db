import { ApiProperty } from '@nestjs/swagger';

export class EquipmentResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the equipment',
  })
  id: string;

  @ApiProperty({
    example: 'CAT 320 Excavator',
    description: 'The name of the equipment',
  })
  name: string;

  @ApiProperty({
    example: 'Heavy-duty excavator suitable for construction projects',
    description: 'The description of the equipment',
  })
  description: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the subCategory this equipment belongs to',
  })
  subCategoryId: string;

  @ApiProperty({
    example: [
      {
        original: 'equipment/vasko2/uuid-1.jpg',
        small: 'equipment/vasko2/uuid-1_small.jpg',
      },
      {
        original: 'equipment/vasko2/uuid-2.jpg',
        small: 'equipment/vasko2/uuid-2_small.jpg',
      },
    ],
    description: 'Array of image objects with original and small versions',
  })
  images: Array<{ original: string; small: string }>;

  @ApiProperty({
    example: 150.0,
    description: 'The price per day for renting this equipment',
  })
  pricePerDay: number;

  @ApiProperty({
    example: true,
    description: 'Whether the equipment is available for rent',
  })
  available: boolean;

  @ApiProperty({
    example: 'New York, NY',
    description: 'The location where the equipment is available',
  })
  locationId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who owns this equipment',
  })
  owner: string;

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
