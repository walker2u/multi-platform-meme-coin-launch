import { PlatformItem } from '@/types/launch';

export const PLATFORMS: PlatformItem[] = [
  {
    id: 'PUMP_FUN',
    name: 'Pump.fun',
    chain: 'SOLANA',
    description: 'Solana bonding curve launcher with instant Raydium migration.',
    feeEstimateDisplay: '~0.02 SOL',
    requiresSolanaAddress: true,
  },
  {
    id: 'FOUR_MEME',
    name: 'Four.meme',
    chain: 'BNB',
    description: 'Leading BNB Chain meme token launchpad with PancakeSwap route.',
    feeEstimateDisplay: '~0.005 BNB',
    requiresSolanaAddress: false,
  },
  {
    id: 'PONS',
    name: 'Pons V2',
    chain: 'BASE',
    description: 'Base L2 virtual liquidity pool with ultra-low gas deployment.',
    feeEstimateDisplay: '~0.002 ETH',
    requiresSolanaAddress: false,
  },
  {
    id: 'GENIUS',
    name: 'Genius.fun',
    chain: 'BASE',
    description: 'Next-generation Base meme launcher with automated referral incentives.',
    feeEstimateDisplay: '~0.002 ETH',
    requiresSolanaAddress: false,
  },
  {
    id: 'STONK_FUN',
    name: 'Stonk.fun',
    chain: 'SOLANA',
    description: 'Decentralized Solana meme bonding curve program.',
    feeEstimateDisplay: '~0.015 SOL',
    requiresSolanaAddress: true,
  },
];

export const getPlatformById = (id: string): PlatformItem | undefined => {
  return PLATFORMS.find((p) => p.id === id);
};
