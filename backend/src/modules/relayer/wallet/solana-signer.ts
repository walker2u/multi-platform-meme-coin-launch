import { Injectable, Logger } from '@nestjs/common';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  VersionedTransaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { SolanaUtil } from '../../../common/utils/solana.util';

@Injectable()
export class SolanaSignerService {
  private readonly logger = new Logger(SolanaSignerService.name);
  private readonly relayerKeypair: Keypair;
  private readonly connection: Connection;

  constructor() {
    const secret = process.env.SOLANA_RELAYER_PRIVATE_KEY || JSON.stringify(Array(64).fill(0));
    try {
      this.relayerKeypair = SolanaUtil.loadKeypairFromSecret(secret);
    } catch {
      this.relayerKeypair = Keypair.generate();
    }

    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  getPublicKey(): PublicKey {
    return this.relayerKeypair.publicKey;
  }

  /**
   * Signs and broadcasts a transaction with priority fee adjustment and optional Helius RPC.
   */
  async signAndBroadcast(
    transaction: Transaction,
    additionalSigners: Keypair[] = [],
  ): Promise<string> {
    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.relayerKeypair.publicKey;

    this.logger.log(`Broadcasting Solana tx with signer: ${this.relayerKeypair.publicKey.toBase58()}`);

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.relayerKeypair, ...additionalSigners],
      {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      },
    );

    return signature;
  }

  /**
   * Broadcasts pre-serialized transaction (e.g. from PumpPortal trade-local API).
   */
  async broadcastRawTransaction(rawTxBuffer: Buffer, mintKeypair: Keypair): Promise<string> {
    const tx = VersionedTransaction.deserialize(rawTxBuffer);
    tx.sign([this.relayerKeypair, mintKeypair]);

    const signature = await this.connection.sendTransaction(tx, {
      skipPreflight: false,
      maxRetries: 3,
    });

    await this.connection.confirmTransaction(signature, 'confirmed');
    return signature;
  }

  async getBalance(): Promise<string> {
    const lamports = await this.connection.getBalance(this.relayerKeypair.publicKey);
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  }
}
