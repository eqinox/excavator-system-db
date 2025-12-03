import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from '../auth/user.entity';
import { FileUploadService } from '../common/services/file-upload.service';
import {
  CategoriesController,
  SubCategoriesController,
} from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';
import { SubCategoriesService } from './sub-categories.service';
import { SubCategory } from './sub-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, SubCategory, User]),
    AuthModule,
  ],
  controllers: [CategoriesController, SubCategoriesController],
  providers: [CategoriesService, SubCategoriesService, FileUploadService],
  exports: [TypeOrmModule],
})
export class CategoriesModule {}
