'use client';

import React from 'react';
import { useSocketStatus } from '@/hooks/useSocketStatus';
import Confetti from '@/components/ui/Confetti';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  Loader2,
  ExternalLink,
  AlertTriangle,
  X,
  Sparkles,
} from 'lucide-react';
import { TargetPlatform } from '@/types/launch';

interface ProgressModalProps {
  launchId: string | null;
  platform: TargetPlatform;
  tokenSymbol: string;
  onClose: () => void;
}

export function ProgressModal({
  launchId,
  platform,
  tokenSymbol,
  onClose,
}: ProgressModalProps) {
  const { status, step, txHash, contractAddress, message, logs } =
    useSocketStatus(launchId);

  if (!launchId) return null;

  const steps = [
    {
      id: 'PAYMENT',
      label: 'Base Escrow Settlement',
      desc: 'USDC received by Cash Register contract on Base',
    },
    {
      id: 'SUBMITTED',
      label: 'Relayer Executing On-Chain',
      desc: 'Worker broadcasting transaction with dynamic fee escalation',
    },
    {
      id: 'CONFIRMED',
      label: 'Token Minted & Pool Deployed',
      desc: 'Indexed on-chain and liquidity curve initialized',
    },
  ];

  const getStepStatus = (stepId: string) => {
    if (status === 'FAILED') return 'failed';
    if (status === 'CONFIRMED') return 'completed';
    if (stepId === 'PAYMENT') {
      if (status === 'PENDING') return 'active';
      return 'completed';
    }
    if (stepId === 'SUBMITTED') {
      if (status === 'PENDING') return 'pending';
      return status === 'SUBMITTED' || status === 'QUEUED' ? 'active' : 'completed';
    }
    if (stepId === 'CONFIRMED') {
      return status === 'CONFIRMED' ? 'completed' : 'pending';
    }
    return 'pending';
  };

  const getExplorerLink = () => {
    if (!contractAddress) return null;
    if (platform === 'PUMP_FUN') {
      return `https://pump.fun/${contractAddress}`;
    }
    if (platform === 'FOUR_MEME') {
      return `https://four.meme/token/${contractAddress}`;
    }
    return `https://basescan.org/token/${contractAddress}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {status === 'CONFIRMED' && <Confetti />}

      <div className="relative w-full max-w-lg bg-surface border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Launching ${tokenSymbol}
              </h3>
              <p className="text-xs text-slate-400">
                Live Relayer & Indexer Feed
              </p>
            </div>
          </div>

          {(status === 'CONFIRMED' || status === 'FAILED') && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Step Progress Tracker */}
        <div className="flex flex-col gap-4">
          {steps.map((s, index) => {
            const stepState = getStepStatus(s.id);
            return (
              <div
                key={s.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  stepState === 'active'
                    ? 'bg-primary/10 border-primary/40 ring-1 ring-primary/30 shadow-lg'
                    : stepState === 'completed'
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : 'bg-surface-light/40 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                        stepState === 'completed'
                          ? 'bg-emerald-500 text-white'
                          : stepState === 'active'
                          ? 'bg-primary text-white animate-pulse'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {stepState === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : stepState === 'active' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {s.label}
                      </div>
                      <div className="text-xs text-slate-400">{s.desc}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Status Message & Logs */}
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex flex-col gap-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-white/5">
            <span>RELAYER DISPATCHER</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
          </div>
          <div className="text-primary-light font-medium py-1">{message}</div>
          {txHash && (
            <div className="text-slate-400 truncate text-[11px]">
              Tx: <span className="text-indigo-300">{txHash}</span>
            </div>
          )}
        </div>

        {/* Success Action CTA */}
        {status === 'CONFIRMED' && (
          <div className="flex flex-col gap-3 pt-2">
            {getExplorerLink() && (
              <a
                href={getExplorerLink()!}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button variant="gradient" size="lg" className="w-full gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View & Trade on {platform}
                </Button>
              </a>
            )}
            <Button variant="outline" size="md" onClick={onClose} className="w-full">
              Close Terminal
            </Button>
          </div>
        )}

        {/* Failure State */}
        {status === 'FAILED' && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Launch failed. Relayer treasury will refund unused escrow.</span>
          </div>
        )}
      </div>
    </div>
  );
}
