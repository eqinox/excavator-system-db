import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './login-response.dto';

export class RefreshTokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'The access token',
  })
  access_token: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'User information',
  })
  user: UserResponseDto;
}
