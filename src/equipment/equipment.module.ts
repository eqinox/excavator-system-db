import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './equipment.entity';
import { Category } from '../categories/category.entity';
import { User } from '../auth/user.entity';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { AuthModule } from '../auth/auth.module';
import { FileUploadService } from '../common/services/file-upload.service';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment, Category, User]), AuthModule],
  controllers: [EquipmentController],
  providers: [EquipmentService, FileUploadService],
  exports: [TypeOrmModule],
})
export class EquipmentModule {}
