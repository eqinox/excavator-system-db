import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class UpdateEquipmentDto {
  @ApiProperty({
    example: 'CAT 320 Excavator',
    description: 'The name of the equipment',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'Heavy-duty excavator suitable for construction projects',
    description: 'The description of the equipment',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category this equipment belongs to',
    required: false,
  })
  @IsOptional()
  @IsUUID('4')
  category_id?: string;

  @ApiProperty({
    example: ['equipment/excavator-1.jpg', 'equipment/excavator-2.jpg'],
    description: 'Array of image paths for the equipment',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    example: 150.0,
    description: 'The price per day for renting this equipment',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  price_per_day?: number;

  @ApiProperty({
    example: true,
    description: 'Whether the equipment is available for rent',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @ApiProperty({
    example: 'New York, NY',
    description: 'The location where the equipment is available',
    required: false,
  })
  @IsOptional()
  @IsString()
  location_id?: string;
}
