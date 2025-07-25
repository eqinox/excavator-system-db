import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Excavators',
    description: 'The name of the category',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

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
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user creating this category (must be admin)',
  })
  @IsOptional()
  @IsUUID('4')
  created_by?: string;
}
