import { Injectable, Logger } from '@nestjs/common';
import { EvmEventListener } from './listeners/evm-event.listener';
import { SolanaTxListener, HeliusWebhookPayload } from './listeners/solana-tx.listener';

@Injectable()
export class IndexerService {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private readonly evmListener: EvmEventListener,
    private readonly solanaListener: SolanaTxListener,
  ) {}

  async handleHeliusWebhook(payload: HeliusWebhookPayload[]) {
    this.logger.log(`Received batch of ${payload.length} Helius webhook events`);
    for (const item of payload) {
      await this.solanaListener.processHeliusTransaction(item);
    }
  }
}
