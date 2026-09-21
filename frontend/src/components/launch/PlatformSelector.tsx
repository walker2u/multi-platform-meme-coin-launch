'use client';

import React from 'react';
import { PLATFORMS } from '@/config/platforms';
import { TargetPlatform } from '@/types/launch';
import { Check, Rocket, Flame } from 'lucide-react';

interface PlatformSelectorProps {
  selectedPlatform: TargetPlatform;
  onSelect: (platform: TargetPlatform) => void;
}

export function PlatformSelector({
  selectedPlatform,
  onSelect,
}: PlatformSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Target Launch Platform
        </label>
        <span className="text-xs text-primary font-medium flex items-center gap-1">
          <Flame className="w-3.5 h-3.5" /> Multi-chain relayer routing
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {PLATFORMS.map((platform) => {
          const isSelected = selectedPlatform === platform.id;
          return (
            <div
              key={platform.id}
              onClick={() => onSelect(platform.id)}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20 ring-1 ring-primary'
                  : 'bg-surface hover:bg-surface-light border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-white flex items-center gap-1.5">
                    {platform.name}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                      platform.chain === 'SOLANA'
                        ? 'bg-accent-solana/10 text-accent-solana border border-accent-solana/20'
                        : platform.chain === 'BNB'
                        ? 'bg-accent-bnb/10 text-accent-bnb border border-accent-bnb/20'
                        : 'bg-accent-base/10 text-accent-base border border-accent-base/20'
                    }`}
                  >
                    {platform.chain}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {platform.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs font-semibold text-slate-300">
                  Est: {platform.feeEstimateDisplay}
                </span>
                {isSelected && (
                  <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
