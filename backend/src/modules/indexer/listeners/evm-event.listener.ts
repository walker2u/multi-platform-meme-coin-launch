import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { bsc, base } from 'viem/chains';
import { LaunchRepository } from '../../../database/repositories/launch.repository';
import { WebsocketGateway } from '../../../websocket/websocket.gateway';
import { LaunchService } from '../../launch/launch.service';
import { LaunchStatus } from '@prisma/client';
import { getChainConfig } from '../../../config/chains.config';
import { PLATFORMS_CONFIG } from '../../../config/platforms.config';

const TOKEN_CREATED_EVENT = parseAbiItem(
  'event TokenCreated(address indexed token, address indexed creator, string name, string symbol, string metadataUri, uint256 initialBuy)',
);

const PAYMENT_RECEIVED_EVENT = parseAbiItem(
  'event LaunchPaymentReceived(string quoteId, address indexed user, uint256 amount)',
);

@Injectable()
export class EvmEventListener implements OnModuleInit {
  private readonly logger = new Logger(EvmEventListener.name);

  constructor(
    private readonly launchRepo: LaunchRepository,
    private readonly wsGateway: WebsocketGateway,
    @Inject(forwardRef(() => LaunchService))
    private readonly launchService: LaunchService,
  ) {}

  onModuleInit() {
    this.startListening();
  }

  private startListening() {
    // 1. Listen for Base Escrow Cash Register payments
    try {
      const baseConfig = getChainConfig('BASE');
      const baseClient = createPublicClient({
        chain: base,
        transport: http(baseConfig.rpcUrl),
      });

      const escrowAddress = (process.env.BASE_ESCROW_CONTRACT_ADDRESS ||
        '0x2222222222222222222222222222222222222222') as `0x${string}`;

      this.logger.log(`Starting Base Escrow event watcher on ${escrowAddress}`);

      baseClient.watchEvent({
        address: escrowAddress,
        event: PAYMENT_RECEIVED_EVENT,
        onLogs: async (logs) => {
          for (const log of logs) {
            const { quoteId, user, amount } = (log as any).args || {};
            this.logger.log(`Payment confirmed for Quote ${quoteId}. Amount: ${amount}`);

            const pendingLaunch = await this.launchRepo.findByQuoteId(quoteId);
            if (pendingLaunch) {
              await this.launchService.dispatchToRelayers(pendingLaunch);

              this.wsGateway.broadcastLaunchUpdate(pendingLaunch.id, {
                launchId: pendingLaunch.id,
                status: LaunchStatus.QUEUED,
                step: 'PAYMENT_RECEIVED',
                message: 'Payment received on Base Escrow. Relayer network is deploying your tokens.',
              });
            } else {
              this.logger.warn(`No pending launch request found for paid quoteId: ${quoteId}`);
            }
          }
        },
      });
    } catch (err) {
      this.logger.warn(`Could not start Base Escrow event watcher: ${(err as Error).message}`);
    }

    // 2. Listen for BNB Four.meme TokenCreated events
    try {
      const bnbConfig = getChainConfig('BNB');
      const bnbClient = createPublicClient({
        chain: bsc,
        transport: http(bnbConfig.rpcUrl),
      });

      const fourMemeAddress = PLATFORMS_CONFIG.FOUR_MEME.address as `0x${string}`;

      this.logger.log(`Starting EVM event watcher for Four.meme on ${fourMemeAddress}`);

      bnbClient.watchEvent({
        address: fourMemeAddress,
        event: TOKEN_CREATED_EVENT,
        onLogs: async (logs) => {
          for (const log of logs) {
            await this.handleTokenCreatedLog(log, 'BNB', 'FOUR_MEME');
          }
        },
      });
    } catch (err) {
      this.logger.warn(`Could not start live EVM watcher (check RPC): ${(err as Error).message}`);
    }
  }

  private async handleTokenCreatedLog(log: any, chain: string, platform: string) {
    const { token, creator } = log.args;
    const txHash = log.transactionHash;

    this.logger.log(`Detected TokenCreated event on ${chain}: ${token} by ${creator}`);

    // Update matching launch record if available
    const relayerTx = await this.launchRepo['prisma'].relayerTx.findFirst({
      where: { txHash },
      include: { launchRequest: true },
    });

    if (relayerTx?.launchRequestId) {
      await this.launchRepo.createDeployedToken({
        launchRequestId: relayerTx.launchRequestId,
        chain,
        platform,
        contractAddress: token,
        creatorAddress: creator,
        transactionHash: txHash,
        blockNumber: log.blockNumber ? BigInt(log.blockNumber) : undefined,
      });

      await this.launchRepo.updateStatus(relayerTx.launchRequestId, LaunchStatus.CONFIRMED);

      this.wsGateway.broadcastLaunchUpdate(relayerTx.launchRequestId, {
        launchId: relayerTx.launchRequestId,
        status: LaunchStatus.CONFIRMED,
        step: 'TOKEN_CONFIRMED',
        contractAddress: token,
        txHash,
        message: `Token created successfully on ${chain}: ${token}`,
      });
    }
  }
}
