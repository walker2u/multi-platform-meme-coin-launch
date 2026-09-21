'use client';

import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { isValidSolanaAddress } from '@/lib/solana';
import { formatAddress } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Wallet, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

interface ConnectWalletProps {
  requiresSolana: boolean;
  solanaAddress: string;
  onSolanaAddressChange: (address: string) => void;
}

export function ConnectWallet({
  requiresSolana,
  solanaAddress,
  onSolanaAddressChange,
}: ConnectWalletProps) {
  const { open } = useAppKit();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  const isSolanaValid = isValidSolanaAddress(solanaAddress);

  return (
    <div className="flex flex-col gap-4">
      {/* Wallet Connection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface-light border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400">
              EVM Payer Wallet (Base)
            </div>
            <div className="text-sm font-medium text-white">
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {formatAddress(address)}
                  <span className="text-xs text-slate-400">({chain?.name || 'Base'})</span>
                </span>
              ) : (
                <span className="text-slate-500">Not connected</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => open()}
                className="border-white/15 hover:border-white/30"
              >
                Change Wallet
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => disconnect()}
                className="text-slate-400 hover:text-red-400 p-2"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="gradient"
              size="md"
              onClick={() => open()}
              className="gap-2 shadow-indigo-500/20"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Solana Recipient Address Input (When Launching on Solana / Pump.fun) */}
      {requiresSolana && (
        <div className="p-4 rounded-xl bg-accent-solana/5 border border-accent-solana/20 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-accent-solana tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Solana Developer Wallet (Pump.fun Ownership)
            </span>
            {solanaAddress.length > 0 && (
              <span
                className={`text-xs font-medium flex items-center gap-1 ${
                  isSolanaValid ? 'text-accent-solana' : 'text-red-400'
                }`}
              >
                {isSolanaValid ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Valid Curve Address
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3" /> Invalid Solana Address
                  </>
                )}
              </span>
            )}
          </div>
          <Input
            placeholder="Enter your Phantom / Solflare public address (e.g. 7xKX...)"
            value={solanaAddress}
            onChange={(e) => onSolanaAddressChange(e.target.value)}
            error={
              solanaAddress.length > 0 && !isSolanaValid
                ? 'Invalid Solana public key. Must be valid ed25519 on-curve address.'
                : undefined
            }
            helperText="The newly minted Solana tokens & dev allocation will be minted directly to this address."
          />
        </div>
      )}
    </div>
  );
}
