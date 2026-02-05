import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddOrderedEquipmentDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the equipment to add to the ordered list',
  })
  @IsNotEmpty()
  @IsUUID('4')
  equipmentId: string;
}
