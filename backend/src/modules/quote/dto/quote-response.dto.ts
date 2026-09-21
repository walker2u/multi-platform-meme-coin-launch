export class QuoteResponseDto {
  quoteId: string;
  targetChain: string;
  targetPlatform: string;
  currency: string;
  baseFee: string;
  estimatedGasFee: string;
  devBuyAmount: string;
  markupAmount: string;
  totalRequired: string;
  expiresAt: string;
}
