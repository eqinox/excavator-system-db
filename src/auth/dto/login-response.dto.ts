import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../roles.enum';

class UserResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the user'
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user'
  })
  email: string;

  @ApiProperty({
    example: Role.USER,
    description: 'The role of the user',
    enum: Role
  })
  role: Role;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token'
  })
  access_token: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'User information'
  })
  user: UserResponseDto;
} 