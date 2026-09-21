import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

export class SolanaUtil {
  /**
   * Generates a fresh Solana Keypair for mint/token creation.
   */
  static generateKeypair(): Keypair {
    return Keypair.generate();
  }

  /**
   * Loads a Keypair from a private key string (Base58 or JSON array string).
   */
  static loadKeypairFromSecret(secret: string): Keypair {
    try {
      const trimmed = secret.trim();
      if (trimmed.startsWith('[')) {
        const secretKey = Uint8Array.from(JSON.parse(trimmed));
        return Keypair.fromSecretKey(secretKey);
      }
      return Keypair.fromSecretKey(bs58.decode(trimmed));
    } catch (e) {
      throw new Error(`Failed to parse Solana secret key: ${(e as Error).message}`);
    }
  }

  /**
   * Derives Pump.fun bonding curve PDA and associated bonding curve token account.
   */
  static findPumpFunBondingCurvePda(
    mint: PublicKey,
    programId: PublicKey = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'),
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('bonding-curve'), mint.toBuffer()],
      programId,
    );
  }

  /**
   * Derives Metadata Account PDA for Metaplex token metadata standard.
   */
  static findMetaplexMetadataPda(
    mint: PublicKey,
    tokenMetadataProgramId: PublicKey = new PublicKey(
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
    ),
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        tokenMetadataProgramId.toBuffer(),
        mint.toBuffer(),
      ],
      tokenMetadataProgramId,
    );
  }

  /**
   * Derives Stonk.fun pool/bonding PDA.
   */
  static findStonkPoolPda(
    mint: PublicKey,
    programId: PublicKey = new PublicKey('STONK8V4QdD3Yq6QZ2uXn4T4eM7mP9wK2yR1sF3dE5a'),
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('stonk_pool'), mint.toBuffer()],
      programId,
    );
  }
}
