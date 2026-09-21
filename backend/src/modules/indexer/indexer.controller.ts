import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { IndexerService } from './indexer.service';
import { HeliusWebhookPayload } from './listeners/solana-tx.listener';
import { Public } from '../../common/decorators';

@Controller('webhooks')
export class IndexerController {
  constructor(private readonly indexerService: IndexerService) {}

  @Public()
  @Post('helius')
  async handleHeliusWebhook(
    @Headers('authorization') authHeader: string,
    @Body() payload: HeliusWebhookPayload[],
  ) {
    const secret = process.env.HELIUS_WEBHOOK_SECRET;
    if (secret && authHeader !== secret) {
      throw new UnauthorizedException('Invalid Helius webhook secret');
    }

    await this.indexerService.handleHeliusWebhook(payload);
    return { success: true };
  }
}
