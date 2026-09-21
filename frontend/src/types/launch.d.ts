export type TargetChain = 'BASE' | 'SOLANA' | 'BNB' | 'ROBINHOOD';

export type TargetPlatform =
  | 'PUMP_FUN'
  | 'FOUR_MEME'
  | 'PONS'
  | 'GENIUS'
  | 'STONK_FUN';

export interface PlatformItem {
  id: TargetPlatform;
  name: string;
  chain: TargetChain;
  iconUrl?: string;
  description: string;
  feeEstimateDisplay: string;
  requiresSolanaAddress?: boolean;
}

export interface TokenFormData {
  name: string;
  symbol: string;
  description: string;
  imageFile: File | null;
  imagePreviewUrl: string | null;
  twitter?: string;
  telegram?: string;
  website?: string;
  devBuyAmount: string;
}

export interface LaunchStepProgress {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  txHash?: string;
}
