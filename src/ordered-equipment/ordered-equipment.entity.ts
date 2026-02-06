import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Equipment } from '../equipment/equipment.entity';

@Entity()
export class OrderedEquipment {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the ordered equipment record',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who ordered the equipment',
  })
  @Column()
  userId!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the ordered equipment',
  })
  @Column({ unique: true })
  equipmentId!: string;

  @ManyToOne(() => User, (user) => user.orderedEquipments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToOne(() => Equipment, (equipment) => equipment.orderedEquipment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'equipmentId' })
  equipment!: Equipment;
}
