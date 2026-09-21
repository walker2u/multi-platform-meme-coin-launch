'use client';

import { useState } from 'react';
import { useSignTypedData, useAccount, useSwitchChain } from 'wagmi';
import { parseUnits } from 'viem';
import { LAUNCH_DOMAIN, INTENT_TYPES } from '@/config/constants';
import { apiClient } from '@/lib/apiClient';
import { useUsdcAllowance } from './useUsdcAllowance';
import { QuoteData, LaunchResponseData } from '@/types/api';
import { TokenFormData } from '@/types/launch';

export function useLaunchIntent() {
  const { signTypedDataAsync } = useSignTypedData();
  const { address, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { checkAndApproveUsdc } = useUsdcAllowance();
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

      // 1. Enforce Base Network Connection for EIP-712 Intent and USDC Settlement
      if (chain?.id !== 8453) {
        setCurrentStep('SWITCHING_NETWORK');
        if (switchChainAsync) {
          await switchChainAsync({ chainId: 8453 });
        }
      }

      // 2. Upload Image File and Metadata to IPFS via multipart/form-data
      setCurrentStep('PREPARING_METADATA');
      let metadataUri = 'ipfs://fallback';

      if (tokenDetails.imageFile) {
        const formData = new FormData();
        formData.append('file', tokenDetails.imageFile);
        formData.append('name', tokenDetails.name);
        formData.append('symbol', tokenDetails.symbol);
        formData.append('description', tokenDetails.description);
        if (tokenDetails.twitter) formData.append('twitter', tokenDetails.twitter);
        if (tokenDetails.telegram) formData.append('telegram', tokenDetails.telegram);
        if (tokenDetails.website) formData.append('website', tokenDetails.website);

        try {
          const uploadRes: any = await apiClient.post('/storage/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (uploadRes?.data?.metadataUri) {
            metadataUri = uploadRes.data.metadataUri;
          }
        } catch (err) {
          console.error('Metadata upload failed:', err);
          throw new Error('Failed to upload token assets to IPFS. Please try again.');
        }
      } else {
        throw new Error('Token image is required.');
      }

      // 3. Check & Approve USDC Allowance on Base
      setCurrentStep('CHECKING_ALLOWANCE');
      const maxSpendWei = parseUnits(quoteData.totalRequired, 6);
      await checkAndApproveUsdc(maxSpendWei);

      // 4. Prepare and Sign EIP-712 Intent on Base
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

      // 5. Submit Launch Intent to Backend
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
