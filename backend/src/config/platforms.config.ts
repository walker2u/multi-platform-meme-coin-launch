export interface PlatformDefinition {
  id: string;
  name: string;
  chain: 'BASE' | 'BNB' | 'SOLANA' | 'ROBINHOOD';
  type: 'FACTORY_EVM' | 'PROGRAM_SOLANA';
  address: string;
  treasuryAddress?: string;
  defaultDevBuyMin: string;
  defaultDevBuyMax: string;
  creationFeeNative: string; // Native token amount in standard string format (e.g. "0.01")
  feeRecipient?: string;
  apiEndpoint?: string;
}

export const PLATFORMS_CONFIG: Record<string, PlatformDefinition> = {
  FOUR_MEME: {
    id: 'FOUR_MEME',
    name: 'Four.meme',
    chain: 'BNB',
    type: 'FACTORY_EVM',
    address: '0x5c952063c7fc8610ffdb798152d69f0b9550762b',
    creationFeeNative: '0.005',
    defaultDevBuyMin: '0.001',
    defaultDevBuyMax: '10.0',
    feeRecipient: '0x2222222222222222222222222222222222222222',
  },
  PONS: {
    id: 'PONS',
    name: 'Pons V2',
    chain: 'BASE',
    type: 'FACTORY_EVM',
    address: '0x1234567890123456789012345678901234567890',
    creationFeeNative: '0.002',
    defaultDevBuyMin: '0.001',
    defaultDevBuyMax: '5.0',
  },
  GENIUS: {
    id: 'GENIUS',
    name: 'Genius.fun',
    chain: 'BASE',
    type: 'FACTORY_EVM',
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    creationFeeNative: '0.002',
    defaultDevBuyMin: '0.001',
    defaultDevBuyMax: '5.0',
  },
  PUMP_FUN: {
    id: 'PUMP_FUN',
    name: 'Pump.fun',
    chain: 'SOLANA',
    type: 'PROGRAM_SOLANA',
    address: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
    creationFeeNative: '0.02', // SOL
    defaultDevBuyMin: '0.01',
    defaultDevBuyMax: '20.0',
    apiEndpoint: 'https://pumpportal.fun/api/trade-local',
  },
  STONK_FUN: {
    id: 'STONK_FUN',
    name: 'Stonk.fun',
    chain: 'SOLANA',
    type: 'PROGRAM_SOLANA',
    address: 'STONK8V4QdD3Yq6QZ2uXn4T4eM7mP9wK2yR1sF3dE5a',
    creationFeeNative: '0.015',
    defaultDevBuyMin: '0.01',
    defaultDevBuyMax: '20.0',
  },
};

export const getPlatformConfig = (platformKey: string): PlatformDefinition => {
  const normalized = platformKey.toUpperCase();
  const config = PLATFORMS_CONFIG[normalized];
  if (!config) {
    throw new Error(`Platform ${platformKey} is not supported`);
  }
  return config;
};
