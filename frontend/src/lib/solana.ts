import { PublicKey } from '@solana/web3.js';

/**
 * Validates whether an address string is a valid Solana public key on the ed25519 curve.
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address || address.trim().length === 0) return false;
  try {
    const pubkey = new PublicKey(address.trim());
    return PublicKey.isOnCurve(pubkey.toBuffer());
  } catch {
    return false;
  }
}
