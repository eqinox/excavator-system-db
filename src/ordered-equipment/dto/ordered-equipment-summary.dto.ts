import { ApiProperty } from '@nestjs/swagger';

export class OrderedEquipmentSummaryDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the ordered equipment record',
  })
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who ordered the equipment',
  })
  userId: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the ordered equipment',
  })
  equipmentId: string;
}
