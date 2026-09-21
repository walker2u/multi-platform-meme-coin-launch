import { LaunchStatus } from '@prisma/client';

export class LaunchStatusDto {
  launchId: string;
  status: LaunchStatus;
  targetChain: string;
  targetPlatform: string;
  tokenName: string;
  tokenSymbol: string;
  metadataUri: string;
  contractAddress?: string;
  txHash?: string;
  dexPoolAddress?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
