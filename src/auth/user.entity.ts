import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from './roles.enum';
import { Equipment } from '../equipment/equipment.entity';

@Entity()
export class User {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the user',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the user',
    nullable: true,
  })
  @Column({ nullable: true })
  username: string;

  @ApiProperty({
    example: 'hashedPassword123',
    description: 'The hashed password of the user',
  })
  @Column()
  password: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @OneToMany(() => Equipment, (equipment) => equipment.ownerUser)
  ownedEquipment: Equipment[];
}
