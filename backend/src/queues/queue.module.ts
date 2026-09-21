import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { QUEUE_NAMES } from './queue.constants';

export const REDIS_CLIENT = 'REDIS_CLIENT';
export const EVM_QUEUE = 'EVM_QUEUE';
export const SOLANA_QUEUE = 'SOLANA_QUEUE';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: Number(process.env.REDIS_PORT) || 6379,
          password: process.env.REDIS_PASSWORD || undefined,
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
      },
    },
    {
      provide: EVM_QUEUE,
      useFactory: (redisClient: Redis) => {
        return new Queue(QUEUE_NAMES.EVM_EXECUTION, {
          connection: redisClient,
          defaultJobOptions: {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 3000,
            },
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        });
      },
      inject: [REDIS_CLIENT],
    },
    {
      provide: SOLANA_QUEUE,
      useFactory: (redisClient: Redis) => {
        return new Queue(QUEUE_NAMES.SOLANA_EXECUTION, {
          connection: redisClient,
          defaultJobOptions: {
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
            removeOnComplete: 100,
            removeOnFail: 500,
          },
        });
      },
      inject: [REDIS_CLIENT],
    },
  ],
  exports: [REDIS_CLIENT, EVM_QUEUE, SOLANA_QUEUE],
})
export class QueueModule implements OnModuleDestroy {
  constructor() {}

  async onModuleDestroy() {
    // Queues and connection lifecycle are handled gracefully on app shutdown
  }
}
