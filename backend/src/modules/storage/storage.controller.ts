import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('storage')
@UseGuards(ApiKeyGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMetadata(
    @UploadedFile() file?: Express.Multer.File,
    @Body() body?: any,
  ) {
    if (file) {
      // 1. Upload raw image file to IPFS
      const imageIpfsUri = await this.storageService.pinFileToIpfs(
        file.buffer,
        file.originalname,
        file.mimetype,
      );

      // 2. Pin JSON metadata referencing the pinned image
      return this.storageService.pinJsonMetadata({
        name: body.name || 'Unnamed Token',
        symbol: body.symbol || 'TOKEN',
        description: body.description || '',
        image: imageIpfsUri,
        twitter: body.twitter,
        telegram: body.telegram,
        website: body.website,
      });
    }

    // Direct JSON payload
    if (!body?.image) {
      throw new BadRequestException('Image file or image URI is required');
    }
    return this.storageService.pinJsonMetadata(body);
  }
}

