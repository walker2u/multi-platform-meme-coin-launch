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
  @IsOptional()
  userSolanaAddress?: string;

  @IsString()
  @IsOptional()
  intentSignature?: `0x${string}`;

  @IsNumberString()
  @IsOptional()
  maxSpendAmount?: string;

  @IsNumberString()
  @IsOptional()
  nonce?: string;

  @IsNumberString()
  @IsOptional()
  deadline?: string;
}
