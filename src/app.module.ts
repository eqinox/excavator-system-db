import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/category.entity';
import { configValidationSchema } from './config.schema';
import { Equipment } from './equipment/equipment.entity';
import { EquipmentModule } from './equipment/equipment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
      validationSchema: configValidationSchema,
      isGlobal: true, // Make ConfigModule global
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          type: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_DATABASE'),
          entities: [User, Category, Equipment],
        };
      },
    }),
    AuthModule,
    CategoriesModule,
    EquipmentModule,
  ],
})
export class AppModule {}
