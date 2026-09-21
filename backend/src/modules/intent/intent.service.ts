import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import { verifyLaunchIntentSignature, LaunchIntentMessage } from '../../common/utils/crypto.util';
import { VerifyIntentDto, IntentVerificationResult } from './dto/verify-intent.dto';
import { QuoteRepository } from '../../database/repositories/quote.repository';

const ERC20_ABI = parseAbi([
  'function allowance(address owner, address spender) view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
]);

@Injectable()
export class IntentService {
  private readonly logger = new Logger(IntentService.name);
  private readonly baseClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL || 'https://mainnet.base.org'),
  });

  constructor(private readonly quoteRepo: QuoteRepository) {}

  /**
   * Verifies the user's cryptographic intent to execute a cross-chain launch.
   */
  async verifyIntent(dto: VerifyIntentDto): Promise<IntentVerificationResult> {
    const quote = await this.quoteRepo.findById(dto.quoteId);
    if (!quote) {
      throw new BadRequestException('Referenced quote not found');
    }

    if (new Date() > quote.expiresAt) {
      throw new BadRequestException('Quote has expired');
    }

    // Check expiration timestamp in signature
    const deadlineNum = BigInt(dto.deadline);
    const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
    if (nowSeconds > deadlineNum) {
      throw new BadRequestException('Intent deadline has passed');
    }

    const message: LaunchIntentMessage = {
      user: dto.walletAddress,
      quoteId: dto.quoteId,
      targetChain: dto.targetChain,
      targetPlatform: dto.targetPlatform,
      tokenName: dto.tokenName,
      tokenSymbol: dto.tokenSymbol,
      metadataUri: dto.metadataUri,
      maxSpendAmount: BigInt(dto.maxSpendAmount),
      nonce: BigInt(dto.nonce),
      deadline: deadlineNum,
    };

    const isValidSignature = await verifyLaunchIntentSignature(
      message,
      dto.signature,
      dto.walletAddress,
    );

    if (!isValidSignature) {
      return {
        valid: false,
        signerAddress: dto.walletAddress,
        error: 'Invalid EIP-712 signature for intent',
      };
    }

    return {
      valid: true,
      signerAddress: dto.walletAddress,
      hasAllowance: true,
    };
  }

  /**
   * Checks if user has granted sufficient allowance for a payment token on Base.
   */
  async checkTokenAllowance(
    tokenAddress: `0x${string}`,
    owner: `0x${string}`,
    spender: `0x${string}`,
    requiredAmount: bigint,
  ): Promise<boolean> {
    try {
      const currentAllowance = await this.baseClient.readContract({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [owner, spender],
      });

      return (currentAllowance as bigint) >= requiredAmount;
    } catch (err) {
      this.logger.error('Failed to query allowance on Base', err);
      return false;
    }
  }
}
