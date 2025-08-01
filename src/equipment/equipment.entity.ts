import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../auth/user.entity';
import { Category } from '../categories/category.entity';

@Entity()
export class Equipment {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the equipment',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'CAT 320 Excavator',
    description: 'The name of the equipment',
  })
  @Column()
  name: string;

  @ApiProperty({
    example: 'Heavy-duty excavator suitable for construction projects',
    description: 'The description of the equipment',
  })
  @Column('text')
  description: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category this equipment belongs to',
  })
  @Column()
  category_id: string;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({
    example: [
      {
        original: 'equipment/vasko2/uuid-1.jpg',
        small: 'equipment/vasko2/uuid-1_small.jpg',
      },
      {
        original: 'equipment/vasko2/uuid-2.jpg',
        small: 'equipment/vasko2/uuid-2_small.jpg',
      },
    ],
    description: 'Array of image objects with original and small versions',
  })
  @Column('json', { default: [] })
  images: Array<{ original: string; small: string }>;

  @ApiProperty({
    example: 150.0,
    description: 'The price per day for renting this equipment',
  })
  @Column('decimal', { precision: 10, scale: 2 })
  price_per_day: number;

  @ApiProperty({
    example: true,
    description: 'Whether the equipment is available for rent',
  })
  @Column({ default: true })
  available: boolean;

  @ApiProperty({
    example: 'New York, NY',
    description: 'The location where the equipment is available',
  })
  @Column()
  location_id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who owns this equipment',
  })
  @Column()
  owner: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner' })
  ownerUser: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
