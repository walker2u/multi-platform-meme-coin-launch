import { Injectable, BadRequestException } from '@nestjs/common';
import { EvmBuilderService, EvmBuildResult } from './evm/evm-builder.service';
import { SolanaBuilderService, SolanaBuildResult } from './solana/solana-builder.service';
import { getChainConfig } from '../../config/chains.config';

export interface BuildUniversalLaunchParams {
  chain: string;
  platform: string;
  tokenName: string;
  tokenSymbol: string;
  metadataUri: string;
  devBuyAmount?: string;
  relayerPublicKey?: string;
}

@Injectable()
export class BuildersService {
  constructor(
    private readonly evmBuilder: EvmBuilderService,
    private readonly solanaBuilder: SolanaBuilderService,
  ) {}

  async buildLaunch(params: BuildUniversalLaunchParams): Promise<{
    chainType: 'EVM' | 'SOLANA';
    evmResult?: EvmBuildResult;
    solanaResult?: SolanaBuildResult;
  }> {
    const chainConfig = getChainConfig(params.chain);

    if (chainConfig.type === 'EVM') {
      const evmResult = this.evmBuilder.buildTransaction({
        platform: params.platform,
        name: params.tokenName,
        symbol: params.tokenSymbol,
        metadataUri: params.metadataUri,
        devBuyAmount: params.devBuyAmount,
      });

      return {
        chainType: 'EVM',
        evmResult,
      };
    } else if (chainConfig.type === 'SOLANA') {
      if (!params.relayerPublicKey) {
        throw new BadRequestException('relayerPublicKey required for Solana tx construction');
      }

      const solanaResult = await this.solanaBuilder.buildLaunchTransaction({
        platform: params.platform,
        name: params.tokenName,
        symbol: params.tokenSymbol,
        metadataUri: params.metadataUri,
        devBuySol: params.devBuyAmount ? parseFloat(params.devBuyAmount) : 0,
        relayerPublicKey: params.relayerPublicKey,
      });

      return {
        chainType: 'SOLANA',
        solanaResult,
      };
    }

    throw new BadRequestException(`Unknown chain type for chain: ${params.chain}`);
  }
}
