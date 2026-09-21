import { IsString, IsNotEmpty, IsOptional, IsNumberString } from 'class-validator';

export class CreateLaunchDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  quoteId: string;

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
  @IsOptional()
  devBuyAmount?: string;

  @IsString()
  @IsNotEmpty()
  intentSignature: `0x${string}`;

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
