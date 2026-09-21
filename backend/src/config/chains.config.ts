export interface ChainDefinition {
  id: string;
  name: string;
  type: 'EVM' | 'SOLANA';
  chainId: number;
  rpcUrl: string;
  wsUrl?: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contracts?: {
    multicall?: string;
    permit2?: string;
  };
}

export const CHAINS_CONFIG: Record<string, ChainDefinition> = {
  BASE: {
    id: 'BASE',
    name: 'Base Mainnet',
    type: 'EVM',
    chainId: 8453,
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    contracts: {
      multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
      permit2: '0x000000000022D473030F116dDEE9F6B43aC78BA3',
    },
  },
  BNB: {
    id: 'BNB',
    name: 'BNB Smart Chain',
    type: 'EVM',
    chainId: 56,
    rpcUrl: process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    contracts: {
      multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    },
  },
  SOLANA: {
    id: 'SOLANA',
    name: 'Solana Mainnet-Beta',
    type: 'SOLANA',
    chainId: 101,
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    wsUrl: process.env.SOLANA_WS_URL || 'wss://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    nativeCurrency: {
      name: 'Solana',
      symbol: 'SOL',
      decimals: 9,
    },
  },
  ROBINHOOD: {
    id: 'ROBINHOOD',
    name: 'Robinhood Chain',
    type: 'EVM',
    chainId: 9999,
    rpcUrl: process.env.ROBINHOOD_RPC_URL || 'https://rpc.robinhood-chain.internal',
    explorerUrl: 'https://explorer.robinhood-chain.internal',
    nativeCurrency: {
      name: 'Robinhood Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
};

export const getChainConfig = (chainKey: string): ChainDefinition => {
  const normalized = chainKey.toUpperCase();
  const config = CHAINS_CONFIG[normalized];
  if (!config) {
    throw new Error(`Chain ${chainKey} is not supported`);
  }
  return config;
};
