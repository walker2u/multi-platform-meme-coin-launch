import { Injectable, Logger } from '@nestjs/common';
import { EvmSignerService } from './wallet/evm-signer';
import { SolanaSignerService } from './wallet/solana-signer';

export interface TreasuryBalances {
  baseEth: string;
  bnb: string;
  solana: string;
  relayerEvmAddress: string;
  relayerSolanaAddress: string;
  updatedAt: string;
}

@Injectable()
export class RelayerService {
  private readonly logger = new Logger(RelayerService.name);

  constructor(
    private readonly evmSigner: EvmSignerService,
    private readonly solanaSigner: SolanaSignerService,
  ) {}

  /**
   * Retrieves live balances of all relayer treasuries across chains.
   */
  async getTreasuryBalances(): Promise<TreasuryBalances> {
    const [baseEth, bnb, solana] = await Promise.all([
      this.evmSigner.getBalance('BASE').catch((e) => {
        this.logger.error('Failed to get Base ETH balance', e);
        return '0.0';
      }),
      this.evmSigner.getBalance('BNB').catch((e) => {
        this.logger.error('Failed to get BNB balance', e);
        return '0.0';
      }),
      this.solanaSigner.getBalance().catch((e) => {
        this.logger.error('Failed to get Solana balance', e);
        return '0.0';
      }),
    ]);

    return {
      baseEth,
      bnb,
      solana,
      relayerEvmAddress: this.evmSigner.getAddress(),
      relayerSolanaAddress: this.solanaSigner.getPublicKey().toBase58(),
      updatedAt: new Date().toISOString(),
    };
  }
}
