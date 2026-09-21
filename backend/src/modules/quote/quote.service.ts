import { Injectable, BadRequestException } from '@nestjs/common';
import { parseUnits, formatUnits } from 'viem';
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

    const decimals = chainConfig.nativeCurrency.decimals;

    // Convert everything to BigInt (Wei / base units)
    const baseFeeWei = parseUnits(platformConfig.creationFeeNative, decimals);
    const devBuyWei = dto.devBuyAmount ? parseUnits(dto.devBuyAmount, decimals) : 0n;

    let estimatedGasWei = parseUnits('0.001', decimals);
    if (chainConfig.type === 'SOLANA') {
      estimatedGasWei = parseUnits('0.005', decimals);
    } else if (dto.targetChain === 'BASE') {
      estimatedGasWei = parseUnits('0.0005', decimals);
    }

    const subtotalWei = baseFeeWei + devBuyWei;
    // Markup calculation (e.g. 5%) using BigInt math (multiply by 5, divide by 100)
    const markupPercent = BigInt(Math.floor(Number(process.env.FEE_MARKUP_PERCENT || 5.0)));
    const markupWei = (subtotalWei * markupPercent) / 100n;

    const totalRequiredWei = subtotalWei + estimatedGasWei + markupWei;

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const quoteRecord = await this.quoteRepo.create({
      user: { connect: { id: user.id } },
      targetChain: dto.targetChain,
      targetPlatform: dto.targetPlatform,
      baseFeeAmount: formatUnits(baseFeeWei, decimals),
      gasFeeEst: formatUnits(estimatedGasWei, decimals),
      devBuyAmount: formatUnits(devBuyWei, decimals),
      markupAmount: formatUnits(markupWei, decimals),
      totalAmount: formatUnits(totalRequiredWei, decimals),
      currency: chainConfig.nativeCurrency.symbol,
      expiresAt,
    });

    return {
      quoteId: quoteRecord.id,
      targetChain: dto.targetChain,
      targetPlatform: dto.targetPlatform,
      currency: chainConfig.nativeCurrency.symbol,
      baseFee: formatUnits(baseFeeWei, decimals),
      estimatedGasFee: formatUnits(estimatedGasWei, decimals),
      devBuyAmount: formatUnits(devBuyWei, decimals),
      markupAmount: formatUnits(markupWei, decimals),
      totalRequired: formatUnits(totalRequiredWei, decimals),
      expiresAt: expiresAt.toISOString(),
    };
  }
}

