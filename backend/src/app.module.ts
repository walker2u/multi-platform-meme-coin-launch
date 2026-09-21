import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

// Database & Queues
import { PrismaService } from './database/prisma.service';
import { LaunchRepository } from './database/repositories/launch.repository';
import { QuoteRepository } from './database/repositories/quote.repository';
import { QueueModule } from './queues/queue.module';

// Common
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Feature Modules
import { QuoteController } from './modules/quote/quote.controller';
import { QuoteService } from './modules/quote/quote.service';

import { StorageController } from './modules/storage/storage.controller';
import { StorageService } from './modules/storage/storage.service';

import { IntentService } from './modules/intent/intent.service';

import { BuildersService } from './modules/builders/builders.service';
import { EvmBuilderService } from './modules/builders/evm/evm-builder.service';
import { SolanaBuilderService } from './modules/builders/solana/solana-builder.service';
import { PumpPortalClient } from './modules/builders/solana/pump-portal.client';

import { LaunchController } from './modules/launch/launch.controller';
import { LaunchService } from './modules/launch/launch.service';

import { RelayerService } from './modules/relayer/relayer.service';
import { EvmSignerService } from './modules/relayer/wallet/evm-signer';
import { SolanaSignerService } from './modules/relayer/wallet/solana-signer';
import { EvmWorkerProcessor } from './modules/relayer/workers/evm-worker.processor';
import { SolanaWorkerProcessor } from './modules/relayer/workers/solana-worker.processor';

import { IndexerController } from './modules/indexer/indexer.controller';
import { IndexerService } from './modules/indexer/indexer.service';
import { EvmEventListener } from './modules/indexer/listeners/evm-event.listener';
import { SolanaTxListener } from './modules/indexer/listeners/solana-tx.listener';

// WebSocket
import { WebsocketGateway } from './websocket/websocket.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    QueueModule,
  ],
  controllers: [
    QuoteController,
    StorageController,
    LaunchController,
    IndexerController,
  ],
  providers: [
    // Database & repositories
    PrismaService,
    LaunchRepository,
    QuoteRepository,

    // Common Interceptors, Guards & Filters
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    // Services
    QuoteService,
    StorageService,
    IntentService,
    BuildersService,
    EvmBuilderService,
    SolanaBuilderService,
    PumpPortalClient,
    LaunchService,

    // Relayer & Workers
    RelayerService,
    EvmSignerService,
    SolanaSignerService,
    EvmWorkerProcessor,
    SolanaWorkerProcessor,

    // Indexer
    IndexerService,
    EvmEventListener,
    SolanaTxListener,

    // WebSocket Gateway
    WebsocketGateway,
  ],
  exports: [
    PrismaService,
    LaunchRepository,
    QuoteRepository,
    WebsocketGateway,
  ],
})
export class AppModule {}
