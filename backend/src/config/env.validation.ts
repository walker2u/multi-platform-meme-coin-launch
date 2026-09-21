import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  API_PREFIX: z.string().default('api/v1'),
  API_KEY: z.string().default('test_api_key_multiplatform_launch'),

  DATABASE_URL: z.string().url(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  PINATA_API_KEY: z.string().optional(),
  PINATA_API_SECRET: z.string().optional(),
  PINATA_JWT: z.string().optional(),
  PINATA_GATEWAY_URL: z.string().default('https://gateway.pinata.cloud/ipfs'),

  BASE_RPC_URL: z.string().url().default('https://mainnet.base.org'),
  BNB_RPC_URL: z.string().url().default('https://bsc-dataseed.binance.org'),
  ROBINHOOD_RPC_URL: z.string().default('https://rpc.robinhood-chain.internal'),
  EVM_RELAYER_PRIVATE_KEY: z.string().min(64),

  SOLANA_RPC_URL: z.string().url().default('https://api.mainnet-beta.solana.com'),
  SOLANA_WS_URL: z.string().default('wss://api.mainnet-beta.solana.com'),
  SOLANA_RELAYER_PRIVATE_KEY: z.string().min(32),
  HELIUS_API_KEY: z.string().optional(),
  HELIUS_WEBHOOK_SECRET: z.string().optional(),

  PUMPPORTAL_API_URL: z.string().url().default('https://pumpportal.fun/api'),

  FEE_MARKUP_PERCENT: z.coerce.number().default(5.0),
  DEV_BUY_MAX_USD: z.coerce.number().default(1000.0),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const parsed = EnvSchema.safeParse(config);
  if (!parsed.success) {
    console.error('Invalid environment variables configuration:', parsed.error.format());
    throw new Error('Environment variable validation failed');
  }
  return parsed.data;
}
