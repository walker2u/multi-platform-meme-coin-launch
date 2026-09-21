import { IsString, IsNotEmpty, IsOptional, IsNumberString } from 'class-validator';

export class GetQuoteDto {
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @IsString()
  @IsNotEmpty()
  targetChain: 'BASE' | 'BNB' | 'SOLANA' | 'ROBINHOOD';

  @IsString()
  @IsNotEmpty()
  targetPlatform: 'FOUR_MEME' | 'PONS' | 'GENIUS' | 'PUMP_FUN' | 'STONK_FUN';

  @IsNumberString()
  @IsOptional()
  devBuyAmount?: string; // in native currency (ETH/BNB/SOL)
}
