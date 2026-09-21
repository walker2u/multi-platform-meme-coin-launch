import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { bsc, base } from 'viem/chains';
import { LaunchRepository } from '../../../database/repositories/launch.repository';
import { WebsocketGateway } from '../../../websocket/websocket.gateway';
import { LaunchStatus } from '@prisma/client';
import { getChainConfig } from '../../../config/chains.config';
import { PLATFORMS_CONFIG } from '../../../config/platforms.config';

const TOKEN_CREATED_EVENT = parseAbiItem(
  'event TokenCreated(address indexed token, address indexed creator, string name, string symbol, string metadataUri, uint256 initialBuy)',
);

@Injectable()
export class EvmEventListener implements OnModuleInit {
  private readonly logger = new Logger(EvmEventListener.name);

  constructor(
    private readonly launchRepo: LaunchRepository,
    private readonly wsGateway: WebsocketGateway,
  ) {}

  onModuleInit() {
    this.startListening();
  }

  private startListening() {
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
