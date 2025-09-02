import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ImagesService } from './images.service';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('categories/:filename')
  @ApiOperation({
    summary: 'Get category image',
    description: 'Serves category images without authentication',
  })
  @ApiParam({
    name: 'filename',
    description: 'The image filename',
    example: '86daa180-c18a-4b60-b69d-5e736c99a02c.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Image served successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async serveCategoryImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const imagePath = await this.imagesService.serveCategoryImage(filename);
    return res.sendFile(imagePath);
  }

  @Get('equipment/:filename')
  @ApiOperation({
    summary: 'Get equipment image',
    description: 'Serves equipment images without authentication',
  })
  @ApiParam({
    name: 'filename',
    description: 'The image filename',
    example: '86daa180-c18a-4b60-b69d-5e736c99a02c.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Image served successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
  })
  async serveEquipmentImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const imagePath = await this.imagesService.serveEquipmentImage(filename);
    return res.sendFile(imagePath);
  }
}
