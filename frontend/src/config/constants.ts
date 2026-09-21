import { type TypedDataDomain } from 'viem';

export const LAUNCH_DOMAIN: TypedDataDomain = {
  name: 'MultiplatformLaunch',
  version: '1',
  chainId: 8453, // Base Network
  verifyingContract: '0x1111111111111111111111111111111111111111' as const,
};

export const INTENT_TYPES = {
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

// Official USDC on Base
export const USDC_BASE_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;

export const erc20Abi = [
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'approve',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const;
