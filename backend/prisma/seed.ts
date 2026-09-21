import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const INITIAL_CHAINS = [
  {
    name: 'Base Mainnet',
    chainKey: 'BASE',
    type: 'EVM',
    chainId: 8453,
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: 'ETH',
  },
  {
    name: 'BNB Smart Chain',
    chainKey: 'BNB',
    type: 'EVM',
    chainId: 56,
    rpcUrl: process.env.BNB_RPC_URL || 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: 'BNB',
  },
  {
    name: 'Solana Mainnet',
    chainKey: 'SOLANA',
    type: 'SOLANA',
    chainId: 101,
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    explorerUrl: 'https://solscan.io',
    nativeCurrency: 'SOL',
  },
  {
    name: 'Robinhood Chain',
    chainKey: 'ROBINHOOD',
    type: 'EVM',
    chainId: 9999,
    rpcUrl: process.env.ROBINHOOD_RPC_URL || 'https://rpc.robinhood-chain.internal',
    explorerUrl: 'https://explorer.robinhood-chain.internal',
    nativeCurrency: 'ETH',
  },
];

export const INITIAL_PLATFORMS = [
  {
    name: 'Four.meme',
    platformKey: 'FOUR_MEME',
    chainKey: 'BNB',
    factoryAddress: '0x5c952063c7fc8610ffdb798152d69f0b9550762b',
    feeBps: 100, // 1%
  },
  {
    name: 'Pons V2',
    platformKey: 'PONS',
    chainKey: 'BASE',
    factoryAddress: '0x1234567890123456789012345678901234567890',
    feeBps: 100,
  },
  {
    name: 'Genius.fun',
    platformKey: 'GENIUS',
    chainKey: 'BASE',
    factoryAddress: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    feeBps: 100,
  },
  {
    name: 'Pump.fun',
    platformKey: 'PUMP_FUN',
    chainKey: 'SOLANA',
    factoryAddress: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
    feeBps: 100,
  },
  {
    name: 'Stonk.fun',
    platformKey: 'STONK_FUN',
    chainKey: 'SOLANA',
    factoryAddress: 'STONK8V4QdD3Yq6QZ2uXn4T4eM7mP9wK2yR1sF3dE5a',
    feeBps: 100,
  },
];

async function main() {
  console.log('Seeding initial system state...');

  // Create demo system admin/relayer user record if not exists
  const systemRelayer = await prisma.user.upsert({
    where: { walletAddress: '0x000000000000000000000000000000000000dEaD' },
    update: {},
    create: {
      walletAddress: '0x000000000000000000000000000000000000dEaD',
      chainType: 'EVM',
    },
  });

  console.log(`Initialized relayer record: ${systemRelayer.id}`);
  console.log('Chains registered:', INITIAL_CHAINS.map((c) => c.name).join(', '));
  console.log('Platforms registered:', INITIAL_PLATFORMS.map((p) => p.name).join(', '));
  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
