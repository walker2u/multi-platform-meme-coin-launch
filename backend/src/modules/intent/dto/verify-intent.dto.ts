import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class VerifyIntentDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: `0x${string}`;

  @IsString()
  @IsNotEmpty()
  quoteId: string;

  @IsString()
  @IsNotEmpty()
  signature: `0x${string}`;

  @IsString()
  @IsNotEmpty()
  targetChain: string;

  @IsString()
  @IsNotEmpty()
  targetPlatform: string;

  @IsString()
  @IsNotEmpty()
  tokenName: string;

  @IsString()
  @IsNotEmpty()
  tokenSymbol: string;

  @IsString()
  @IsNotEmpty()
  metadataUri: string;

  @IsNumberString()
  @IsNotEmpty()
  maxSpendAmount: string;

  @IsNumberString()
  @IsNotEmpty()
  nonce: string;

  @IsNumberString()
  @IsNotEmpty()
  deadline: string;
}

export class IntentVerificationResult {
  valid: boolean;
  signerAddress: string;
  hasAllowance?: boolean;
  error?: string;
}
