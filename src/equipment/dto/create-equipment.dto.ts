import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateEquipmentDto {
  @ApiProperty({
    example: 'CAT 320 Excavator',
    description: 'The name of the equipment',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Heavy-duty excavator suitable for construction projects',
    description: 'The description of the equipment',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category this equipment belongs to',
  })
  @IsUUID('4')
  category_id: string;

  @ApiProperty({
    example: 150.0,
    description: 'The price per day for renting this equipment',
  })
  @IsNumber()
  price_per_day: number;

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
  })
  @IsString()
  @IsNotEmpty()
  location_id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who owns this equipment',
  })
  @IsOptional()
  @IsUUID('4')
  owner?: string;
}
