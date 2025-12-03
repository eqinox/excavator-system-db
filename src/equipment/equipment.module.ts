import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../auth/user.entity';
import { SubCategory } from '../categories/sub-category.entity';
import { FileUploadService } from '../common/services/file-upload.service';
import { EquipmentController } from './equipment.controller';
import { Equipment } from './equipment.entity';
import { EquipmentService } from './equipment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Equipment, SubCategory, User]),
    AuthModule,
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService, FileUploadService],
  exports: [TypeOrmModule],
})
export class EquipmentModule {}
