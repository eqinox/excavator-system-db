import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { JwtPayload } from './dto/jwt-payload.interface';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService', { timestamp: true });
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async createUser(
    authCredentialsDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    const { email, password, username } = authCredentialsDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      username,
    });

    try {
      const savedUser = await this.usersRepository.save(user);
      this.logger.log(`Created user with email: ${user.email}`);

      // Remove password from the returned user object
      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async signIn(authCredentialsDto: LoginDto): Promise<LoginResponseDto> {
    const { password, email } = authCredentialsDto;
    this.logger.verbose(`User: "${email}" trying to sign in`);
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { email };
      const accessToken = this.jwtService.sign(payload);

      this.logger.log(`User: "${user.email}" is signed in`);

      return {
        access_token: accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  // Add this method to the AuthService class
  async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      // Verify the JWT token
      const payload = this.jwtService.verify(token);

      // Find the user in the database
      const user = await this.usersRepository.findOne({
        where: { email: payload.email },
      });

      if (!user) {
        this.logger.warn(
          `Token validation failed: User not found for email: ${payload.email}`,
        );
        return { valid: false };
      }

      this.logger.log(`Token validated successfully for user: ${user.email}`);

      // Return user info without password
      const { password: _, ...userWithoutPassword } = user;
      return {
        valid: true,
        user: userWithoutPassword,
      };
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      return { valid: false };
    }
  }
}
