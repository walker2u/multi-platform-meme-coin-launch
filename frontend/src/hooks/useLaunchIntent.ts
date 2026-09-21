'use client';

import { useState } from 'react';
import { useSignTypedData, useAccount } from 'wagmi';
import { parseUnits } from 'viem';
import { LAUNCH_DOMAIN, INTENT_TYPES } from '@/config/constants';
import { apiClient } from '@/lib/apiClient';
import { usePermit2 } from './usePermit2';
import { QuoteData, UploadMetadataResponse, LaunchResponseData } from '@/types/api';
import { TokenFormData } from '@/types/launch';

export function useLaunchIntent() {
  const { signTypedDataAsync } = useSignTypedData();
  const { address } = useAccount();
  const { checkAndApproveUsdc } = usePermit2();
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('idle');

  const executeLaunch = async (
    quoteData: QuoteData,
    tokenDetails: TokenFormData,
    solanaAddress?: string,
  ): Promise<LaunchResponseData> => {
    if (!address) {
      throw new Error('Please connect your EVM wallet first');
    }

    try {
      setIsExecuting(true);
      setCurrentStep('PREPARING_METADATA');

      // 1. Upload Metadata to IPFS
      let metadataUri = 'ipfs://bafkreia5...';
      const metadataPayload = {
        name: tokenDetails.name,
        symbol: tokenDetails.symbol,
        description: tokenDetails.description,
        image: tokenDetails.imagePreviewUrl || 'https://placehold.co/400x400/png',
        twitter: tokenDetails.twitter,
        telegram: tokenDetails.telegram,
        website: tokenDetails.website,
      };

      try {
        const uploadRes: any = await apiClient.post('/storage/upload', metadataPayload);
        if (uploadRes?.data?.metadataUri) {
          metadataUri = uploadRes.data.metadataUri;
        }
      } catch (err) {
        console.warn('Metadata upload error, continuing with fallback:', err);
      }

      // 2. Check & Approve USDC Allowance on Base
      setCurrentStep('CHECKING_ALLOWANCE');
      const maxSpendWei = parseUnits(quoteData.totalRequired, 6);
      await checkAndApproveUsdc(maxSpendWei);

      // 3. Prepare and Sign EIP-712 Intent
      setCurrentStep('SIGNING_INTENT');
      const nonce = BigInt(Date.now());
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 900); // 15 mins

      const signature = await signTypedDataAsync({
        domain: LAUNCH_DOMAIN,
        types: INTENT_TYPES,
        primaryType: 'LaunchIntent',
        message: {
          user: address as `0x${string}`,
          quoteId: quoteData.quoteId,
          targetChain: quoteData.targetChain,
          targetPlatform: quoteData.targetPlatform,
          tokenName: tokenDetails.name,
          tokenSymbol: tokenDetails.symbol,
          metadataUri,
          maxSpendAmount: maxSpendWei,
          nonce,
          deadline,
        },
      });

      // 4. Submit Launch Intent to Backend
      setCurrentStep('SUBMITTING_LAUNCH');
      const launchResponse: any = await apiClient.post('/launch', {
        walletAddress: address,
        userSolanaAddress: solanaAddress,
        quoteId: quoteData.quoteId,
        targetChain: quoteData.targetChain,
        targetPlatform: quoteData.targetPlatform,
        tokenName: tokenDetails.name,
        tokenSymbol: tokenDetails.symbol,
        metadataUri,
        devBuyAmount: tokenDetails.devBuyAmount || undefined,
        intentSignature: signature,
        maxSpendAmount: maxSpendWei.toString(),
        nonce: nonce.toString(),
        deadline: deadline.toString(),
      });

      setCurrentStep('ENQUEUED');
      return launchResponse.data;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeLaunch,
    isExecuting,
    currentStep,
  };
}
