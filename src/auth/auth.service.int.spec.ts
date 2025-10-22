import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Product } from '../products/product.entity';

describe('AuthService Integration', () => {
  let service: AuthService;
  let createdUser: any;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env.stage.test'],
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST,
          port: +process.env.DB_PORT!,
          username: process.env.DB_USERNAME,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          entities: [User, Product],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([User]),
        JwtModule.register({
          secret: process.env.JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  }, 30000); // Increase timeout to 30 seconds

  afterAll(async () => {
    // Add cleanup if needed
  });

  it('should create a new user', async () => {
    createdUser = await service.createUser({
      email: 'test@test.com',
      password: 'Test123!',
      username: 'testuser',
    });

    expect(createdUser).toBeDefined();
    expect(createdUser.email).toBe('test@test.com');
    expect(createdUser).not.toHaveProperty('password');
  });

  it('should sign in with the created user', async () => {
    const signInResult = await service.signIn({
      email: 'test@test.com',
      password: 'Test123!',
    });

    expect(signInResult).toBeDefined();
    expect(signInResult.access_token).toBeDefined();
    expect(signInResult.user).toBeDefined();
    expect(signInResult.user.email).toBe('test@test.com');
    expect(signInResult.user.id).toBe(createdUser.id);
  });
});
