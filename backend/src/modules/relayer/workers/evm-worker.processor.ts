import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { QUEUE_NAMES, EvmExecutionJobData } from '../../../queues/queue.constants';
import { EvmSignerService } from '../wallet/evm-signer';
import { LaunchRepository } from '../../../database/repositories/launch.repository';
import { WebsocketGateway } from '../../../websocket/websocket.gateway';
import { LaunchStatus, RelayerStatus } from '@prisma/client';

@Injectable()
export class EvmWorkerProcessor implements OnModuleInit {
  private readonly logger = new Logger(EvmWorkerProcessor.name);
  private worker: Worker;

  constructor(
    private readonly evmSigner: EvmSignerService,
    private readonly launchRepo: LaunchRepository,
    private readonly wsGateway: WebsocketGateway,
  ) {}

  onModuleInit() {
    this.worker = new Worker<EvmExecutionJobData>(
      QUEUE_NAMES.EVM_EXECUTION,
      async (job: Job<EvmExecutionJobData>) => {
        return this.processJob(job);
      },
      {
        concurrency: 1, // Strict sequential nonce execution
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
        },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`EVM Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`EVM Job ${job?.id} failed with error:`, err);
    });
  }

  private async processJob(job: Job<EvmExecutionJobData>) {
    const { launchRequestId, chain, to, calldata, valueNativeWei } = job.data;
    this.logger.log(`Processing EVM launch execution for request ${launchRequestId} on ${chain}`);

    await this.launchRepo.updateStatus(launchRequestId, LaunchStatus.SUBMITTED);
    this.wsGateway.broadcastLaunchUpdate(launchRequestId, {
      launchId: launchRequestId,
      status: LaunchStatus.SUBMITTED,
      step: 'BROADCASTING_EVM_TX',
      message: `Broadcasting factory creation transaction on ${chain}`,
    });

    const relayerTx = await this.launchRepo.createRelayerTx({
      launchRequestId,
      chain,
      status: RelayerStatus.BROADCASTING,
      rawPayload: calldata,
    });

    try {
      const { hash, nonce, gasPriceGwei } = await this.evmSigner.sendTransactionWithEscalation({
        chainKey: chain,
        to,
        data: calldata,
        value: BigInt(valueNativeWei || '0'),
      });

      await this.launchRepo.updateRelayerTx(relayerTx.id, RelayerStatus.SUBMITTED, hash);

      this.wsGateway.broadcastLaunchUpdate(launchRequestId, {
        launchId: launchRequestId,
        status: LaunchStatus.SUBMITTED,
        step: 'TX_BROADCASTED',
        txHash: hash,
        message: `Transaction broadcasted to network: ${hash}`,
      });

      return { txHash: hash, nonce, gasPriceGwei };
    } catch (error) {
      this.logger.error(`EVM submission error for launch ${launchRequestId}`, error);
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
        message: `Transaction submission failed: ${(error as Error).message}`,
      });

      throw error;
    }
  }
}
