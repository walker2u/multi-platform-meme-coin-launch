import { Injectable, BadRequestException } from '@nestjs/common';
import { getPlatformConfig } from '../../../config/platforms.config';
import { FourMemeBuilder } from './four-meme.builder';
import { PonsBuilder } from './pons.builder';
import { GeniusBuilder } from './genius.builder';

export interface EvmBuildRequest {
  platform: string;
  name: string;
  symbol: string;
  metadataUri: string;
  description?: string;
  devBuyAmount?: string;
}

export interface EvmBuildResult {
  to: `0x${string}`;
  calldata: `0x${string}`;
  valueWei: string;
}

@Injectable()
export class EvmBuilderService {
  buildTransaction(request: EvmBuildRequest): EvmBuildResult {
    const platform = getPlatformConfig(request.platform);

    switch (request.platform.toUpperCase()) {
      case 'FOUR_MEME': {
        const { calldata, valueWei } = FourMemeBuilder.buildCreateTokenTx({
          name: request.name,
          symbol: request.symbol,
          description: request.description || request.name,
          metadataUri: request.metadataUri,
          devBuyBnbAmount: request.devBuyAmount,
        });
        return {
          to: platform.address as `0x${string}`,
          calldata,
          valueWei: valueWei.toString(),
        };
      }

      case 'PONS': {
        const { calldata, valueWei } = PonsBuilder.buildCreateTokenTx({
          name: request.name,
          symbol: request.symbol,
          metadataUri: request.metadataUri,
        });
        return {
          to: platform.address as `0x${string}`,
          calldata,
          valueWei: valueWei.toString(),
        };
      }

      case 'GENIUS': {
        const { calldata, valueWei } = GeniusBuilder.buildCreateTokenTx({
          tokenName: request.name,
          tokenTicker: request.symbol,
          ipfsMetadata: request.metadataUri,
        });
        return {
          to: platform.address as `0x${string}`,
          calldata,
          valueWei: valueWei.toString(),
        };
      }

      default:
        throw new BadRequestException(`Unsupported EVM platform: ${request.platform}`);
    }
  }
}
