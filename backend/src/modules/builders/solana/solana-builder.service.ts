import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { PumpPortalClient } from './pump-portal.client';
import { StonkFunBuilder } from './stonk-fun.builder';
import { SolanaUtil } from '../../../common/utils/solana.util';

export interface SolanaBuildRequest {
  platform: string;
  name: string;
  symbol: string;
  metadataUri: string;
  devBuySol?: number;
  relayerPublicKey: string;
}

export interface SolanaBuildResult {
  mintKeypair: Keypair;
  serializedTransaction?: Buffer;
  instructions?: Transaction;
}

@Injectable()
export class SolanaBuilderService {
  private readonly logger = new Logger(SolanaBuilderService.name);

  constructor(private readonly pumpPortalClient: PumpPortalClient) {}

  async buildLaunchTransaction(request: SolanaBuildRequest): Promise<SolanaBuildResult> {
    const mintKeypair = SolanaUtil.generateKeypair();
    const devBuy = request.devBuySol || 0;

    switch (request.platform.toUpperCase()) {
      case 'PUMP_FUN': {
        const txBuffer = await this.pumpPortalClient.createTokenTransaction({
          publicKey: request.relayerPublicKey,
          action: 'create',
          tokenMetadata: {
            name: request.name,
            symbol: request.symbol,
            uri: request.metadataUri,
          },
          mint: mintKeypair.publicKey.toBase58(),
          denominatedInSol: 'true',
          amount: devBuy,
          slippage: 10,
          priorityFee: 0.005,
          pool: 'pump',
        });

        return {
          mintKeypair,
          serializedTransaction: txBuffer,
        };
      }

      case 'STONK_FUN': {
        const ix = StonkFunBuilder.buildInitializeInstruction({
          creator: new PublicKey(request.relayerPublicKey),
          mint: mintKeypair.publicKey,
          name: request.name,
          symbol: request.symbol,
          uri: request.metadataUri,
          initialBuySol: devBuy,
        });

        const tx = new Transaction().add(ix);

        return {
          mintKeypair,
          instructions: tx,
        };
      }

      default:
        throw new BadRequestException(`Unsupported Solana platform: ${request.platform}`);
    }
  }
}
