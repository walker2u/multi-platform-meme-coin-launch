'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { QuoteData, QuoteRequestParams, ApiResponse } from '@/types/api';

export function useQuote(params: Partial<QuoteRequestParams>) {
  return useQuery<QuoteData, Error>({
    queryKey: ['quote', params.walletAddress, params.targetChain, params.targetPlatform, params.devBuyAmount],
    queryFn: async () => {
      if (!params.walletAddress || !params.targetChain || !params.targetPlatform) {
        throw new Error('Incomplete quote parameters');
      }

      const query = new URLSearchParams({
        walletAddress: params.walletAddress,
        targetChain: params.targetChain,
        targetPlatform: params.targetPlatform,
        ...(params.devBuyAmount ? { devBuyAmount: params.devBuyAmount } : {}),
      }).toString();

      const res = await apiClient.get<ApiResponse<QuoteData>>(`/quote?${query}`);
      return (res as any).data;
    },
    enabled: Boolean(params.walletAddress && params.targetChain && params.targetPlatform),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
