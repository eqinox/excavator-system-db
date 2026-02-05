import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { Equipment } from '../equipment/equipment.entity';
import { OrderedEquipment } from './ordered-equipment.entity';

@Injectable()
export class OrderedEquipmentService {
  private logger = new Logger('OrderedEquipmentService', { timestamp: true });

  constructor(
    @InjectRepository(OrderedEquipment)
    private orderedEquipmentRepository: Repository<OrderedEquipment>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {}

  private async ensureEquipmentExists(equipmentId: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id: equipmentId },
    });
    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }
    return equipment;
  }

  async addOrderedEquipment(
    equipmentId: string,
    currentUser: User,
  ): Promise<OrderedEquipment> {
    await this.ensureEquipmentExists(equipmentId);

    const existing = await this.orderedEquipmentRepository.findOne({
      where: { equipmentId },
    });

    if (existing) {
      if (existing.userId === currentUser.id) {
        throw new BadRequestException(
          'Equipment is already in the ordered list for this user',
        );
      }
      throw new BadRequestException(
        'Equipment is already ordered by another user',
      );
    }

    const orderedEquipment = this.orderedEquipmentRepository.create({
      userId: currentUser.id,
      equipmentId,
    });

    const saved = await this.orderedEquipmentRepository.save(orderedEquipment);
    this.logger.log(
      `Equipment ${equipmentId} ordered by user ${currentUser.id} (record ${saved.id})`,
    );

    return (
      (await this.orderedEquipmentRepository.findOne({
        where: { id: saved.id },
        relations: ['equipment'],
      })) ?? saved
    );
  }

  async listOrderedEquipment(
    currentUser: User,
  ): Promise<OrderedEquipment[]> {
    return this.orderedEquipmentRepository.find({
      where: { userId: currentUser.id },
      relations: ['equipment'],
    });
  }

  async removeOrderedEquipment(
    equipmentId: string,
    currentUser: User,
  ): Promise<{ message: string }> {
    const orderedEquipment = await this.orderedEquipmentRepository.findOne({
      where: { userId: currentUser.id, equipmentId },
    });

    if (!orderedEquipment) {
      throw new NotFoundException('Ordered equipment not found');
    }

    await this.orderedEquipmentRepository.remove(orderedEquipment);
    this.logger.log(
      `Equipment ${equipmentId} removed from user ${currentUser.id} ordered list`,
    );

    return { message: 'Ordered equipment removed successfully' };
  }
}
