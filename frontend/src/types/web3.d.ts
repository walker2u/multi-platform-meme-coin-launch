import { type Address, type TypedDataDomain } from 'viem';

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

export interface IntentSignatureResult {
  signature: `0x${string}`;
  nonce: bigint;
  deadline: bigint;
  maxSpendWei: bigint;
}
