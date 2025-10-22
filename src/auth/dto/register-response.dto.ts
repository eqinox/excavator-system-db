import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../roles.enum';

export class RegisterResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
    nullable: true,
  })
  username: string | null;

  @ApiProperty({
    example: Role.USER,
    description: 'The role of the user',
    enum: Role,
  })
  role: Role;

  @ApiProperty({
    example: '2024-03-20T12:00:00Z',
    description: 'The date when the user was created',
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-03-20T12:00:00Z',
    description: 'The date when the user was last updated',
  })
  updated_at: Date;
}
