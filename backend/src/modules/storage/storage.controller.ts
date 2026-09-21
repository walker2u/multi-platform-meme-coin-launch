import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { TokenMetadataDto } from './dto/metadata.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('storage')
@UseGuards(ApiKeyGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  async uploadMetadata(@Body() metadata: TokenMetadataDto) {
    return this.storageService.pinJsonMetadata(metadata);
  }
}
