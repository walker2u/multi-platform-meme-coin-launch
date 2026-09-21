import { Injectable, Logger } from '@nestjs/common';
import { LaunchRepository } from '../../../database/repositories/launch.repository';
import { WebsocketGateway } from '../../../websocket/websocket.gateway';
import { LaunchStatus } from '@prisma/client';

export interface HeliusWebhookPayload {
  type: string;
  signature: string;
  timestamp: number;
  tokenTransfers?: any[];
  nativeTransfers?: any[];
  accountData?: any[];
  events?: {
    nft?: any;
    swap?: any;
  };
}

@Injectable()
export class SolanaTxListener {
  private readonly logger = new Logger(SolanaTxListener.name);

  constructor(
    private readonly launchRepo: LaunchRepository,
    private readonly wsGateway: WebsocketGateway,
  ) {}

  async processHeliusTransaction(payload: HeliusWebhookPayload) {
    this.logger.log(`Processing Helius transaction webhook: ${payload.signature}`);

    const relayerTx = await this.launchRepo['prisma'].relayerTx.findFirst({
      where: { txHash: payload.signature },
      include: { launchRequest: true },
    });

    if (!relayerTx) {
      this.logger.debug(`No matching relayer transaction found for signature: ${payload.signature}`);
      return;
    }

    const launchId = relayerTx.launchRequestId;
    await this.launchRepo.updateStatus(launchId, LaunchStatus.CONFIRMED);

    this.wsGateway.broadcastLaunchUpdate(launchId, {
      launchId,
      status: LaunchStatus.CONFIRMED,
      step: 'HELIUS_CONFIRMED',
      txHash: payload.signature,
      message: `Transaction verified and confirmed by Helius indexer`,
    });
  }
}
