import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Equipment } from '../equipment/equipment.entity';
import { OrderedEquipmentController } from './ordered-equipment.controller';
import { OrderedEquipment } from './ordered-equipment.entity';
import { OrderedEquipmentService } from './ordered-equipment.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderedEquipment, Equipment]),
    AuthModule,
  ],
  controllers: [OrderedEquipmentController],
  providers: [OrderedEquipmentService],
  exports: [TypeOrmModule],
})
export class OrderedEquipmentModule {}
