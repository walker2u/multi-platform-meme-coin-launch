import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { LaunchService } from './launch.service';
import { CreateLaunchDto } from './dto/create-launch.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@Controller('launch')
@UseGuards(ApiKeyGuard)
export class LaunchController {
  constructor(private readonly launchService: LaunchService) {}

  @Post()
  async createLaunch(@Body() dto: CreateLaunchDto) {
    return this.launchService.createLaunch(dto);
  }

  @Get(':id')
  async getLaunchStatus(@Param('id') id: string) {
    return this.launchService.getLaunchStatus(id);
  }
}
