import { LaunchStatus } from '@prisma/client';

export interface LaunchStatusEvent {
  launchId: string;
  status: LaunchStatus;
  step: string;
  txHash?: string;
  contractAddress?: string;
  message: string;
  timestamp?: string;
}
