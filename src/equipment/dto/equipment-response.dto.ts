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
    description: 'The ID of the category this equipment belongs to',
  })
  category_id: string;

  @ApiProperty({
    example: ['equipment/excavator-1.jpg', 'equipment/excavator-2.jpg'],
    description: 'Array of image paths for the equipment',
  })
  images: string[];

  @ApiProperty({
    example: 150.0,
    description: 'The price per day for renting this equipment',
  })
  price_per_day: number;

  @ApiProperty({
    example: true,
    description: 'Whether the equipment is available for rent',
  })
  available: boolean;

  @ApiProperty({
    example: 'New York, NY',
    description: 'The location where the equipment is available',
  })
  location_id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who owns this equipment',
  })
  owner: string;

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
}
