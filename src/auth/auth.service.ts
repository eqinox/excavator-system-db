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
import { Response } from 'express';
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

  async signIn(
    authCredentialsDto: LoginDto,
    res: Response,
  ): Promise<LoginResponseDto> {
    const { password, email } = authCredentialsDto;
    this.logger.verbose(`User: "${email}" trying to sign in`);
    const user = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const tokens = await this.generateTokens(user);
      await this.updateRefreshToken(user.id, tokens.refresh_token);

      // Set HTTP-only cookie for refresh token
      res.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      this.logger.log(`User: "${user.email}" is signed in`);

      return {
        access_token: tokens.access_token,
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

  async generateTokens(
    user: User,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      email: user.email,
      sub: user.id,
      type: 'refresh',
    };

    const access_token = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refresh_token = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    return { access_token, refresh_token };
  }

  async updateRefreshToken(
    userId: string,
    refresh_token: string | null,
  ): Promise<void> {
    await this.usersRepository.update(userId, { refresh_token });
  }

  async refreshTokens(
    user: User,
    res: Response,
  ): Promise<{ access_token: string }> {
    const tokens = await this.generateTokens(user);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    // Update HTTP-only cookie for refresh token
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { access_token: tokens.access_token };
  }

  async logout(userId: string, res: Response): Promise<void> {
    await this.updateRefreshToken(userId, null);
    res.clearCookie('refreshToken');
  }

  // Add this method to the AuthService class
  async validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      // Verify the JWT token
      const payload = this.jwtService.verify(token);

      // Find the user in the database
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        this.logger.warn(
          `Token validation failed: User not found for id: ${payload.sub}`,
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
