import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SolanaUtil } from '../../../common/utils/solana.util';

export interface StonkFunCreateTokenParams {
  creator: PublicKey;
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  initialBuySol?: number;
}

export class StonkFunBuilder {
  static readonly PROGRAM_ID = new PublicKey(
    'STONK8V4QdD3Yq6QZ2uXn4T4eM7mP9wK2yR1sF3dE5a',
  );

  /**
   * Constructs custom instruction to initialize token curve and state on Stonk.fun.
   */
  static buildInitializeInstruction(params: StonkFunCreateTokenParams): TransactionInstruction {
    const [poolPda] = SolanaUtil.findStonkPoolPda(params.mint, this.PROGRAM_ID);
    const [metadataPda] = SolanaUtil.findMetaplexMetadataPda(params.mint);

    // Stonk instruction discriminator: 0x18 (Initialize)
    const nameBuf = Buffer.from(params.name);
    const symbolBuf = Buffer.from(params.symbol);
    const uriBuf = Buffer.from(params.uri);

    const data = Buffer.concat([
      Buffer.from([0x18]), // instruction index
      Buffer.from(new Uint32Array([nameBuf.length]).buffer),
      nameBuf,
      Buffer.from(new Uint32Array([symbolBuf.length]).buffer),
      symbolBuf,
      Buffer.from(new Uint32Array([uriBuf.length]).buffer),
      uriBuf,
    ]);

    const keys = [
      { pubkey: params.creator, isSigner: true, isWritable: true },
      { pubkey: params.mint, isSigner: true, isWritable: true },
      { pubkey: poolPda, isSigner: false, isWritable: true },
      { pubkey: metadataPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    ];

    return new TransactionInstruction({
      keys,
      programId: this.PROGRAM_ID,
      data,
    });
  }
}
