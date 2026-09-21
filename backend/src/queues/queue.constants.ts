export const QUEUE_NAMES = {
  EVM_EXECUTION: 'evm-execution',
  SOLANA_EXECUTION: 'solana-execution',
  INDEXER_PROCESSING: 'indexer-processing',
  WEBHOOK_DISPATCH: 'webhook-dispatch',
} as const;

export type QueueNameType = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface EvmExecutionJobData {
  launchRequestId: string;
  chain: string;
  platform: string;
  to: `0x${string}`;
  calldata: `0x${string}`;
  valueNativeWei: string;
  userAddress: `0x${string}`;
}

export interface SolanaExecutionJobData {
  launchRequestId: string;
  platform: string;
  serializedTxBase64?: string;
  mintSecretKey?: string;
  devBuySolAmount: number;
  userWallet: string;
}
