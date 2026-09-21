import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { EVM_QUEUE, SOLANA_QUEUE } from '../../queues/queue.module';
import { LaunchRepository } from '../../database/repositories/launch.repository';
import { IntentService } from '../intent/intent.service';
import { BuildersService } from '../builders/builders.service';
import { CreateLaunchDto } from './dto/create-launch.dto';
import { LaunchStatusDto } from './dto/launch-status.dto';
import { LaunchStatus } from '@prisma/client';
import { getChainConfig } from '../../config/chains.config';
import { EvmExecutionJobData, SolanaExecutionJobData } from '../../queues/queue.constants';
import { WebsocketGateway } from '../../websocket/websocket.gateway';
import { EvmSignerService } from '../relayer/wallet/evm-signer';
import { SolanaSignerService } from '../relayer/wallet/solana-signer';

@Injectable()
export class LaunchService {
  private readonly logger = new Logger(LaunchService.name);

  constructor(
    private readonly launchRepo: LaunchRepository,
    private readonly intentService: IntentService,
    private readonly buildersService: BuildersService,
    private readonly wsGateway: WebsocketGateway,
    private readonly evmSigner: EvmSignerService,
    private readonly solanaSigner: SolanaSignerService,
    @Inject(EVM_QUEUE) private readonly evmQueue: Queue<EvmExecutionJobData>,
    @Inject(SOLANA_QUEUE) private readonly solanaQueue: Queue<SolanaExecutionJobData>,
  ) {}

  async createLaunch(dto: CreateLaunchDto): Promise<LaunchStatusDto> {
    this.logger.log(`Initiating launch process for ${dto.tokenName} (${dto.tokenSymbol})`);

    const chainConfig = getChainConfig(dto.targetChain);

    // 1. Verify EIP-712 Intent if signature was provided (direct intent mode)
    let isDirectIntent = false;
    if (dto.intentSignature && dto.maxSpendAmount && dto.nonce && dto.deadline) {
      const verification = await this.intentService.verifyIntent({
        walletAddress: dto.walletAddress as `0x${string}`,
        quoteId: dto.quoteId,
        signature: dto.intentSignature,
        targetChain: dto.targetChain,
        targetPlatform: dto.targetPlatform,
        tokenName: dto.tokenName,
        tokenSymbol: dto.tokenSymbol,
        metadataUri: dto.metadataUri,
        maxSpendAmount: dto.maxSpendAmount,
        nonce: dto.nonce,
        deadline: dto.deadline,
      });

      if (!verification.valid) {
        throw new BadRequestException(`Intent verification failed: ${verification.error}`);
      }
      isDirectIntent = true;
    }

    // 2. Persist or update LaunchRequest record
    let launch = await this.launchRepo.findByQuoteId(dto.quoteId);
    if (!launch) {
      launch = await this.launchRepo.create({
        user: {
          connectOrCreate: {
            where: { walletAddress: dto.walletAddress.toLowerCase() },
            create: {
              walletAddress: dto.walletAddress.toLowerCase(),
              chainType: chainConfig.type,
            },
          },
        },
        quote: {
          connect: { id: dto.quoteId },
        },
        targetChain: dto.targetChain,
        targetPlatform: dto.targetPlatform,
        tokenName: dto.tokenName,
        tokenSymbol: dto.tokenSymbol,
        metadataUri: dto.metadataUri,
        devBuyAmount: dto.devBuyAmount,
        intentSignature: dto.intentSignature || null,
        status: isDirectIntent ? LaunchStatus.QUEUED : LaunchStatus.PENDING,
      });
    }

    if (isDirectIntent) {
      this.wsGateway.broadcastLaunchUpdate(launch.id, {
        launchId: launch.id,
        status: LaunchStatus.QUEUED,
        step: 'INTENT_VERIFIED',
        message: 'Launch intent validated successfully. Enqueueing relayer job.',
      });

      await this.dispatchToRelayers(launch);
    } else {
      this.wsGateway.broadcastLaunchUpdate(launch.id, {
        launchId: launch.id,
        status: LaunchStatus.PENDING,
        step: 'AWAITING_PAYMENT',
        message: 'Launch registered. Awaiting USDC payment on Base Escrow.',
      });
    }

    return this.mapToStatusDto(launch);
  }

  /**
   * Dispatches queued launch jobs to BullMQ relayer workers once payment is confirmed.
   */
  async dispatchToRelayers(launch: any): Promise<void> {
    const chainConfig = getChainConfig(launch.targetChain);
    await this.launchRepo.updateStatus(launch.id, LaunchStatus.QUEUED);

    this.logger.log(`Dispatching launch ${launch.id} to ${chainConfig.type} relayer queue`);

    if (chainConfig.type === 'EVM') {
      const buildResult = await this.buildersService.buildLaunch({
        chain: launch.targetChain,
        platform: launch.targetPlatform,
        tokenName: launch.tokenName,
        tokenSymbol: launch.tokenSymbol,
        metadataUri: launch.metadataUri,
        devBuyAmount: launch.devBuyAmount || undefined,
      });

      if (!buildResult.evmResult) {
        throw new BadRequestException('Failed to generate EVM transaction data');
      }

      await this.evmQueue.add('execute-evm-launch', {
        launchRequestId: launch.id,
        chain: launch.targetChain,
        platform: launch.targetPlatform,
        to: buildResult.evmResult.to,
        calldata: buildResult.evmResult.calldata,
        valueNativeWei: buildResult.evmResult.valueWei,
        userAddress: launch.user?.walletAddress || launch.userAddress,
      });

      this.logger.log(`EVM launch job enqueued for ${launch.id}`);
    } else if (chainConfig.type === 'SOLANA') {
      const relayerPublicKey = this.solanaSigner.getPublicKey().toBase58();
      const buildResult = await this.buildersService.buildLaunch({
        chain: launch.targetChain,
        platform: launch.targetPlatform,
        tokenName: launch.tokenName,
        tokenSymbol: launch.tokenSymbol,
        metadataUri: launch.metadataUri,
        devBuyAmount: launch.devBuyAmount || undefined,
        relayerPublicKey,
      });

      if (!buildResult.solanaResult) {
        throw new BadRequestException('Failed to generate Solana transaction data');
      }

      await this.solanaQueue.add('execute-solana-launch', {
        launchRequestId: launch.id,
        platform: launch.targetPlatform,
        serializedTxBase64: buildResult.solanaResult.serializedTransaction
          ? buildResult.solanaResult.serializedTransaction.toString('base64')
          : undefined,
        mintSecretKey: JSON.stringify(Array.from(buildResult.solanaResult.mintKeypair.secretKey)),
        devBuySolAmount: launch.devBuyAmount ? parseFloat(launch.devBuyAmount) : 0,
        userWallet: launch.user?.walletAddress || launch.userAddress,
      });

      this.logger.log(`Solana launch job enqueued for ${launch.id}`);
    }
  }

  async getLaunchStatus(id: string): Promise<LaunchStatusDto> {
    const launch = await this.launchRepo.findById(id);
    if (!launch) {
      throw new NotFoundException(`Launch request ${id} not found`);
    }
    return this.mapToStatusDto(launch);
  }

  private mapToStatusDto(launch: any): LaunchStatusDto {
    return {
      launchId: launch.id,
      status: launch.status,
      targetChain: launch.targetChain,
      targetPlatform: launch.targetPlatform,
      tokenName: launch.tokenName,
      tokenSymbol: launch.tokenSymbol,
      metadataUri: launch.metadataUri,
      contractAddress: launch.deployedToken?.contractAddress,
      txHash: launch.deployedToken?.transactionHash || launch.relayerTxs?.[0]?.txHash,
      dexPoolAddress: launch.deployedToken?.dexPoolAddress,
      errorMessage: launch.errorMessage,
      createdAt: launch.createdAt.toISOString(),
      updatedAt: launch.updatedAt.toISOString(),
    };
  }
}
