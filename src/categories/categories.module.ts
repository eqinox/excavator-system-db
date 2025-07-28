import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './category.entity';
import { User } from '../auth/user.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { AuthModule } from 'src/auth/auth.module';
import { FileUploadService } from '../common/services/file-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Category, User]), AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, FileUploadService],
  exports: [TypeOrmModule],
})
export class CategoriesModule {}
