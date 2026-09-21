'use client';

import React from 'react';
import { QuoteData } from '@/types/api';
import { formatCrypto } from '@/lib/utils';
import { Receipt, Fuel, ShieldCheck, Zap } from 'lucide-react';

interface QuoteBreakdownProps {
  quote: QuoteData | undefined;
  isLoading: boolean;
}

export function QuoteBreakdown({ quote, isLoading }: QuoteBreakdownProps) {
  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-surface-light/60 border border-white/10 animate-pulse flex flex-col gap-3">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-4/5" />
        <div className="h-8 bg-white/10 rounded w-full mt-2" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="p-5 rounded-2xl bg-surface-light/40 border border-white/5 text-center text-xs text-slate-500">
        Connect wallet and configure token details to calculate guaranteed launch quote.
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-b from-surface-light to-surface border border-white/15 shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
            Guaranteed Relayer Quote
          </span>
        </div>
        <span className="text-xs text-slate-400">
          Expires in 15 mins
        </span>
      </div>

      <div className="flex flex-col gap-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>Factory Creation Fee</span>
          <span className="font-medium text-white">
            {formatCrypto(quote.baseFee)} {quote.currency}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-slate-500" />
            Estimated Relayer Gas
          </span>
          <span className="font-medium text-white">
            {formatCrypto(quote.estimatedGasFee)} {quote.currency}
          </span>
        </div>

        {parseFloat(quote.devBuyAmount) > 0 && (
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Dev Buy Allocation
            </span>
            <span className="font-medium text-white">
              {formatCrypto(quote.devBuyAmount)} {quote.currency}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Cross-chain Relayer Markup
          </span>
          <span className="font-medium text-white">
            {formatCrypto(quote.markupAmount)} {quote.currency}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
            Total Required (USDC Equivalent on Base)
          </div>
          <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
            {formatCrypto(quote.totalRequired)} {quote.currency}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase tracking-wider">
            Zero Gas for User
          </span>
        </div>
      </div>
    </div>
  );
}
