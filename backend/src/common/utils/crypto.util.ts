import {
  recoverTypedDataAddress,
  type TypedDataDomain,
  type Address,
  keccak256,
  toBytes,
} from 'viem';

export const LAUNCH_INTENT_TYPED_DATA_DOMAIN: TypedDataDomain = {
  name: 'MultiplatformLaunch',
  version: '1',
  chainId: 8453, // Base
  verifyingContract: '0x1111111111111111111111111111111111111111',
};

export const LAUNCH_INTENT_TYPES = {
  LaunchIntent: [
    { name: 'user', type: 'address' },
    { name: 'quoteId', type: 'string' },
    { name: 'targetChain', type: 'string' },
    { name: 'targetPlatform', type: 'string' },
    { name: 'tokenName', type: 'string' },
    { name: 'tokenSymbol', type: 'string' },
    { name: 'metadataUri', type: 'string' },
    { name: 'maxSpendAmount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
} as const;

export interface LaunchIntentMessage {
  user: Address;
  quoteId: string;
  targetChain: string;
  targetPlatform: string;
  tokenName: string;
  tokenSymbol: string;
  metadataUri: string;
  maxSpendAmount: bigint;
  nonce: bigint;
  deadline: bigint;
}

export async function verifyLaunchIntentSignature(
  message: LaunchIntentMessage,
  signature: `0x${string}`,
  expectedSigner: Address,
  domain: TypedDataDomain = LAUNCH_INTENT_TYPED_DATA_DOMAIN,
): Promise<boolean> {
  try {
    const recovered = await recoverTypedDataAddress({
      domain,
      types: LAUNCH_INTENT_TYPES,
      primaryType: 'LaunchIntent',
      message,
      signature,
    });
    return recovered.toLowerCase() === expectedSigner.toLowerCase();
  } catch (error) {
    console.error('Error recovering EIP-712 signature:', error);
    return false;
  }
}

export function hashLaunchIntent(message: LaunchIntentMessage): `0x${string}` {
  return keccak256(toBytes(JSON.stringify(message, (_, v) => typeof v === 'bigint' ? v.toString() : v)));
}
