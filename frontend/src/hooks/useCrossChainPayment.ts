'use client';

import { useState } from 'react';
import { useAccount, useSendTransaction, useWriteContract } from 'wagmi';
import { encodeFunctionData, parseUnits } from 'viem';
import axios from 'axios';
import {
  BASE_ESCROW_CONTRACT_ADDRESS,
  multiLaunchEscrowAbi,
  USDC_BASE_ADDRESS,
  erc20Abi,
} from '@/config/constants';
import { apiClient } from '@/lib/apiClient';
import { useUsdcAllowance } from './useUsdcAllowance';
import { QuoteData, LaunchResponseData } from '@/types/api';
import { TokenFormData } from '@/types/launch';

export interface PayOptions {
  fromTokenAddress?: string; // Optional user token on current chain (defaults to native/USDT/USDC)
}

export function useCrossChainPayment() {
  const { address, chain } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { checkAndApproveUsdc } = useUsdcAllowance();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<string>('idle');

  const executeLaunchPayment = async (
    quoteData: QuoteData,
    tokenDetails: TokenFormData,
    solanaAddress?: string,
    options?: PayOptions,
  ): Promise<{ launchId: string; txHash?: string }> => {
    if (!address) {
      throw new Error('Please connect your wallet first');
    }

    try {
      setIsProcessing(true);

      // 1. Upload Metadata and Token Icon to IPFS via FormData
      setPaymentStep('PREPARING_METADATA');
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

        const uploadRes: any = await apiClient.post('/storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes?.data?.metadataUri) {
          metadataUri = uploadRes.data.metadataUri;
        }
      } else {
        throw new Error('Token image is required.');
      }

      // 2. Pre-register Launch in backend database (Status: PENDING)
      setPaymentStep('REGISTERING_LAUNCH');
      const launchRes: any = await apiClient.post('/launch', {
        walletAddress: address,
        userSolanaAddress: solanaAddress,
        quoteId: quoteData.quoteId,
        targetChain: quoteData.targetChain,
        targetPlatform: quoteData.targetPlatform,
        tokenName: tokenDetails.name,
        tokenSymbol: tokenDetails.symbol,
        metadataUri,
        devBuyAmount: tokenDetails.devBuyAmount || undefined,
      });

      const launchId = launchRes.data.launchId;

      // 3. Prepare Escrow call data for payForLaunch(quoteId, user, amount)
      // USDC on Base has 6 decimals
      const requiredUsdcAmountWei = parseUnits(quoteData.totalRequired, 6);

      const escrowCalldata = encodeFunctionData({
        abi: multiLaunchEscrowAbi,
        functionName: 'payForLaunch',
        args: [quoteData.quoteId, address, requiredUsdcAmountWei],
      });

      let txHash: string | undefined;

      // 4. Case A: User is already connected to Base (Chain ID 8453)
      if (chain?.id === 8453) {
        setPaymentStep('APPROVING_USDC');
        // Ensure Escrow is approved to take USDC
        await writeContractAsync({
          address: USDC_BASE_ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [BASE_ESCROW_CONTRACT_ADDRESS, requiredUsdcAmountWei],
        });

        setPaymentStep('PAYING_ESCROW');
        const payTx = await writeContractAsync({
          address: BASE_ESCROW_CONTRACT_ADDRESS,
          abi: multiLaunchEscrowAbi,
          functionName: 'payForLaunch',
          args: [quoteData.quoteId, address, requiredUsdcAmountWei],
        });

        txHash = payTx;
      } else {
        // 5. Case B: Cross-Chain Swap & Bridge via LI.FI
        setPaymentStep('FETCHING_BRIDGE_ROUTE');
        const currentChainId = chain?.id || 1; // e.g. Arbitrum (42161), Polygon (137), Mainnet (1)

        // Native gas or provided token
        const fromToken =
          options?.fromTokenAddress || '0x0000000000000000000000000000000000000000';

        const lifiParams: Record<string, any> = {
          fromChain: currentChainId,
          fromToken,
          fromAddress: address,
          toChain: 8453, // Base Network
          toToken: USDC_BASE_ADDRESS,
          toAmount: requiredUsdcAmountWei.toString(),
          contractCalls: JSON.stringify([
            {
              toAddress: BASE_ESCROW_CONTRACT_ADDRESS,
              callData: escrowCalldata,
              gasLimit: '150000',
            },
          ]),
        };

        const lifiResponse = await axios.get('https://li.quest/v1/quote', {
          params: lifiParams,
        });

        const txRequest = lifiResponse.data.transactionRequest;

        setPaymentStep('SIGNING_BRIDGE_TX');
        txHash = await sendTransactionAsync({
          to: txRequest.to as `0x${string}`,
          data: txRequest.data as `0x${string}`,
          value: txRequest.value ? BigInt(txRequest.value) : 0n,
        });
      }

      setPaymentStep('SETTLED');
      return { launchId, txHash };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    executeLaunchPayment,
    isProcessing,
    paymentStep,
  };
}
