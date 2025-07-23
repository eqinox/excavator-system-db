import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Matches, MaxLength, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
    required: true
  })
  @IsEmail({}, { message: 'Invalid email' })
  email: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
    required: false,
    nullable: true
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user (must be at least 6 characters long and contain both letters and numbers)',
    required: true,
    minLength: 6,
    maxLength: 32
  })
  @IsString()
  @MinLength(6)
  @MaxLength(32)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).+$/, { message: 'password is too weak' })
  password: string;
}
