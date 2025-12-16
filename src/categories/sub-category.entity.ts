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
import { Category } from './category.entity';

@Entity()
export class SubCategory {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the subCategory',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the category this subCategory belongs to',
  })
  @Column()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.subCategories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ApiProperty({
    example: 'Mini Excavator',
    description: 'The type of the subCategory',
  })
  @Column()
  type: string;

  @ApiProperty({
    example: 0,
    description: 'The minimum range value',
  })
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => {
        if (value === null || value === undefined) return value;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        // If it's a whole number, return as integer, otherwise return as float
        return Number.isInteger(num) ? Math.round(num) : num;
      },
    },
  })
  minRange: number;

  @ApiProperty({
    example: 10,
    description: 'The maximum range value',
  })
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) => {
        if (value === null || value === undefined) return value;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        // If it's a whole number, return as integer, otherwise return as float
        return Number.isInteger(num) ? Math.round(num) : num;
      },
    },
  })
  maxRange: number;

  @ApiProperty({
    example: {
      original: 'sub-categories/mini-excavator.jpg',
      small: 'sub-categories/mini-excavator_small.jpg',
    },
    description: 'Image object with original and small versions',
    required: false,
  })
  @Column('json', { nullable: true })
  image?: { original: string; small: string };

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The ID of the user who created this subCategory',
  })
  @Column()
  creatorId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
