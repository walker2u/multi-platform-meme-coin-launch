import { Injectable, BadRequestException } from '@nestjs/common';
import { QuoteRepository } from '../../database/repositories/quote.repository';
import { PrismaService } from '../../database/prisma.service';
import { getPlatformConfig } from '../../config/platforms.config';
import { getChainConfig } from '../../config/chains.config';
import { GetQuoteDto } from './dto/get-quote.dto';
import { QuoteResponseDto } from './dto/quote-response.dto';

@Injectable()
export class QuoteService {
  constructor(
    private readonly quoteRepo: QuoteRepository,
    private readonly prisma: PrismaService,
  ) {}

  async generateQuote(dto: GetQuoteDto): Promise<QuoteResponseDto> {
    const chainConfig = getChainConfig(dto.targetChain);
    const platformConfig = getPlatformConfig(dto.targetPlatform);

    if (platformConfig.chain !== dto.targetChain) {
      throw new BadRequestException(
        `Platform ${dto.targetPlatform} is not available on chain ${dto.targetChain}`,
      );
    }

    // Upsert or find user
    const user = await this.prisma.user.upsert({
      where: { walletAddress: dto.walletAddress.toLowerCase() },
      update: {},
      create: {
        walletAddress: dto.walletAddress.toLowerCase(),
        chainType: chainConfig.type,
      },
    });

    const baseFee = parseFloat(platformConfig.creationFeeNative);
    const devBuy = dto.devBuyAmount ? parseFloat(dto.devBuyAmount) : 0;
    
    // Gas estimations based on chain type
    let estimatedGas = 0.001; // default ETH/BNB
    if (chainConfig.type === 'SOLANA') {
      estimatedGas = 0.005; // SOL priority + rent
    } else if (dto.targetChain === 'BASE') {
      estimatedGas = 0.0005; // Base L2 gas is cheaper
    }

    const markupPercent = Number(process.env.FEE_MARKUP_PERCENT || 5.0) / 100;
    const subtotal = baseFee + devBuy;
    const markup = subtotal * markupPercent;
    const totalRequired = baseFee + devBuy + estimatedGas + markup;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const quoteRecord = await this.quoteRepo.create({
      user: { connect: { id: user.id } },
      targetChain: dto.targetChain,
      targetPlatform: dto.targetPlatform,
      baseFeeAmount: baseFee.toFixed(6),
      gasFeeEst: estimatedGas.toFixed(6),
      devBuyAmount: devBuy.toFixed(6),
      markupAmount: markup.toFixed(6),
      totalAmount: totalRequired.toFixed(6),
      currency: chainConfig.nativeCurrency.symbol,
      expiresAt,
    });

    return {
      quoteId: quoteRecord.id,
      targetChain: dto.targetChain,
      targetPlatform: dto.targetPlatform,
      currency: chainConfig.nativeCurrency.symbol,
      baseFee: baseFee.toFixed(6),
      estimatedGasFee: estimatedGas.toFixed(6),
      devBuyAmount: devBuy.toFixed(6),
      markupAmount: markup.toFixed(6),
      totalRequired: totalRequired.toFixed(6),
      expiresAt: expiresAt.toISOString(),
    };
  }
}
