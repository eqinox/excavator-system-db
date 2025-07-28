import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/user.entity';

@Entity()
export class Category {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the category',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Excavators',
    description: 'The name of the category',
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: ['excavator-001', 'excavator-002'],
    description: 'Array of equipment IDs belonging to this category',
  })
  @Column('text', { array: true, default: [] })
  equipment: string[];

  @ApiProperty({
    example: 'categories/excavator-category.jpg',
    description: 'The image path for the category',
    required: false,
  })
  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who created this category',
  })
  @Column()
  created_by: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
