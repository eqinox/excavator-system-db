import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../auth/user.entity';
import { SubCategory } from '../categories/sub-category.entity';

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
    description: 'The ID of the subCategory this equipment belongs to',
  })
  @Column()
  subCategoryId: string;

  @ManyToOne(() => SubCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subCategoryId' })
  subCategory: SubCategory;

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
  pricePerDay: number;

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
  locationId: string;

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
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
