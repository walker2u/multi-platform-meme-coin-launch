import { Injectable, Logger } from '@nestjs/common';
import {
  createWalletClient,
  createPublicClient,
  http,
  parseGwei,
  formatEther,
  type Hash,
  type Address,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc, base } from 'viem/chains';
import { getChainConfig } from '../../../config/chains.config';

@Injectable()
export class EvmSignerService {
  private readonly logger = new Logger(EvmSignerService.name);
  private readonly privateKey: `0x${string}`;
  private readonly account;

  constructor() {
    const pk = (process.env.EVM_RELAYER_PRIVATE_KEY ||
      '0x0000000000000000000000000000000000000000000000000000000000000001') as `0x${string}`;
    this.privateKey = pk;
    this.account = privateKeyToAccount(pk);
  }

  getAddress(): Address {
    return this.account.address;
  }

  private getChainDefinition(chainKey: string) {
    if (chainKey.toUpperCase() === 'BASE') return base;
    return bsc;
  }

  /**
   * Broadcasts transaction with dynamic gas price escalation.
   */
  async sendTransactionWithEscalation(params: {
    chainKey: string;
    to: `0x${string}`;
    data: `0x${string}`;
    value?: bigint;
    customNonce?: number;
    bumpFactor?: number;
  }): Promise<{ hash: Hash; nonce: number; gasPriceGwei: string }> {
    const chainConfig = getChainConfig(params.chainKey);
    const viemChain = this.getChainDefinition(params.chainKey);

    const publicClient = createPublicClient({
      chain: viemChain,
      transport: http(chainConfig.rpcUrl),
    });

    const walletClient = createWalletClient({
      account: this.account,
      chain: viemChain,
      transport: http(chainConfig.rpcUrl),
    });

    const nonce =
      params.customNonce !== undefined
        ? params.customNonce
        : await publicClient.getTransactionCount({ address: this.account.address });

    const baseGasPrice = await publicClient.getGasPrice();
    const bump = params.bumpFactor || 1.15; // 15% escalation
    const bumpedGasPrice = BigInt(Math.floor(Number(baseGasPrice) * bump));

    this.logger.log(
      `Dispatching EVM tx on ${params.chainKey} to ${params.to} (Nonce: ${nonce}, Gas: ${bumpedGasPrice})`,
    );

    const hash = await walletClient.sendTransaction({
      account: this.account,
      to: params.to,
      data: params.data,
      value: params.value ?? 0n,
      nonce,
      gasPrice: bumpedGasPrice,
    });

    return {
      hash,
      nonce,
      gasPriceGwei: (Number(bumpedGasPrice) / 1e9).toFixed(2),
    };
  }

  async getBalance(chainKey: string): Promise<string> {
    const chainConfig = getChainConfig(chainKey);
    const publicClient = createPublicClient({
      chain: this.getChainDefinition(chainKey),
      transport: http(chainConfig.rpcUrl),
    });

    const balance = await publicClient.getBalance({ address: this.account.address });
    return formatEther(balance);
  }
}
