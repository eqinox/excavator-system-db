import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  @ApiBody({
    type: RegisterDto,
    description: 'User registration data',
    required: true,
  })
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.createUser(registerDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @ApiBody({
    type: LoginDto,
    description: 'User login credentials',
    required: true,
  })
  async login(@Body() loginCredentials: LoginDto): Promise<LoginResponseDto> {
    return this.authService.signIn(loginCredentials);
  }

  // Add this endpoint to the AuthController class
  @Get('validate')
  @UseGuards(AuthGuard())
  @ApiOperation({
    summary: 'Validate JWT token',
    description:
      'Validates the provided JWT token and returns user information if valid',
  })
  @ApiResponse({
    status: 200,
    description: 'Token is valid',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token is invalid or expired',
    schema: {
      type: 'object',
      properties: {
        valid: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async validateToken(@GetUser() user: User): Promise<{ valid: boolean }> {
    // Remove password from the returned user object
    const { password: _ } = user;

    return {
      valid: true,
    };
  }
}
