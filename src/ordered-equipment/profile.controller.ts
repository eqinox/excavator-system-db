import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { AddOrderedEquipmentDto } from './dto/add-ordered-equipment.dto';
import { OrderedEquipmentResponseDto } from './dto/ordered-equipment-response.dto';
import { ProfileService } from './profile.service';

@ApiTags('profile')
@Controller('profile')
@UseGuards(AuthGuard())
@ApiResponse({
  status: 401,
  description: 'Unauthorized',
})
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('ordered-equipments')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add equipment to user ordered list',
    description: 'Adds an equipment to the ordered list for the current user',
  })
  @ApiBody({
    type: AddOrderedEquipmentDto,
    description: 'Equipment to add to the ordered list',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Equipment added to ordered list successfully',
    type: OrderedEquipmentResponseDto,
  })
  async addOrderedEquipment(
    @Body() addOrderedEquipmentDto: AddOrderedEquipmentDto,
    @GetUser() currentUser: User,
  ): Promise<OrderedEquipmentResponseDto> {
    return await this.profileService.addOrderedEquipment(
      addOrderedEquipmentDto.equipmentId,
      currentUser,
    );
  }

  @Get('ordered-equipments')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user ordered equipment list',
    description: 'Retrieves the ordered equipment list for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Ordered equipment list retrieved successfully',
    type: [OrderedEquipmentResponseDto],
  })
  async listOrderedEquipment(
    @GetUser() currentUser: User,
  ): Promise<OrderedEquipmentResponseDto[]> {
    return await this.profileService.listOrderedEquipment(currentUser);
  }

  @Delete('ordered-equipments/:equipmentId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Remove equipment from user ordered list',
    description:
      'Removes an equipment from the ordered list for the current user',
  })
  @ApiParam({
    name: 'equipmentId',
    description: 'The unique identifier of the equipment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Ordered equipment removed successfully',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'Ordered equipment removed successfully',
        },
      },
    },
  })
  async removeOrderedEquipment(
    @Param('equipmentId') equipmentId: string,
    @GetUser() currentUser: User,
  ): Promise<{ message: string }> {
    return await this.profileService.removeOrderedEquipment(
      equipmentId,
      currentUser,
    );
  }
}
