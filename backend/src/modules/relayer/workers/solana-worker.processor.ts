import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { Keypair } from '@solana/web3.js';
import { QUEUE_NAMES, SolanaExecutionJobData } from '../../../queues/queue.constants';
import { SolanaSignerService } from '../wallet/solana-signer';
import { LaunchRepository } from '../../../database/repositories/launch.repository';
import { WebsocketGateway } from '../../../websocket/websocket.gateway';
import { LaunchStatus, RelayerStatus } from '@prisma/client';

@Injectable()
export class SolanaWorkerProcessor implements OnModuleInit {
  private readonly logger = new Logger(SolanaWorkerProcessor.name);
  private worker: Worker;

  constructor(
    private readonly solanaSigner: SolanaSignerService,
    private readonly launchRepo: LaunchRepository,
    private readonly wsGateway: WebsocketGateway,
  ) {}

  onModuleInit() {
    this.worker = new Worker<SolanaExecutionJobData>(
      QUEUE_NAMES.SOLANA_EXECUTION,
      async (job: Job<SolanaExecutionJobData>) => {
        return this.processJob(job);
      },
      {
        concurrency: 5,
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Solana Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Solana Job ${job?.id} failed with error:`, err);
    });
  }

  private async processJob(job: Job<SolanaExecutionJobData>) {
    const { launchRequestId, platform, serializedTxBase64, mintSecretKey } = job.data;
    this.logger.log(`Processing Solana launch execution for request ${launchRequestId}`);

    await this.launchRepo.updateStatus(launchRequestId, LaunchStatus.SUBMITTED);
    this.wsGateway.broadcastLaunchUpdate(launchRequestId, {
      launchId: launchRequestId,
      status: LaunchStatus.SUBMITTED,
      step: 'BROADCASTING_SOLANA_TX',
      message: `Broadcasting Solana ${platform} transaction`,
    });

    const relayerTx = await this.launchRepo.createRelayerTx({
      launchRequestId,
      chain: 'SOLANA',
      status: RelayerStatus.BROADCASTING,
    });

    try {
      let txSignature: string;

      if (serializedTxBase64 && mintSecretKey) {
        const rawBuffer = Buffer.from(serializedTxBase64, 'base64');
        const mintKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(mintSecretKey)));

        txSignature = await this.solanaSigner.broadcastRawTransaction(rawBuffer, mintKeypair);

        // Record deployed token
        await this.launchRepo.createDeployedToken({
          launchRequestId,
          chain: 'SOLANA',
          platform,
          contractAddress: mintKeypair.publicKey.toBase58(),
          creatorAddress: this.solanaSigner.getPublicKey().toBase58(),
          transactionHash: txSignature,
        });
      } else {
        throw new Error('Missing Solana transaction payload');
      }

      await this.launchRepo.updateRelayerTx(relayerTx.id, RelayerStatus.MINED, txSignature);
      await this.launchRepo.updateStatus(launchRequestId, LaunchStatus.CONFIRMED);

      this.wsGateway.broadcastLaunchUpdate(launchRequestId, {
        launchId: launchRequestId,
        status: LaunchStatus.CONFIRMED,
        step: 'CONFIRMED',
        txHash: txSignature,
        message: `Token launched and confirmed on Solana: ${txSignature}`,
      });

      return { txSignature };
    } catch (error) {
      this.logger.error(`Solana submission error for launch ${launchRequestId}`, error);
      await this.launchRepo.updateRelayerTx(
        relayerTx.id,
        RelayerStatus.FAILED,
        undefined,
        (error as Error).message,
      );
      await this.launchRepo.updateStatus(
        launchRequestId,
        LaunchStatus.FAILED,
        (error as Error).message,
      );

      this.wsGateway.broadcastLaunchUpdate(launchRequestId, {
        launchId: launchRequestId,
        status: LaunchStatus.FAILED,
        step: 'FAILED',
        message: `Solana launch failed: ${(error as Error).message}`,
      });

      throw error;
    }
  }
}
