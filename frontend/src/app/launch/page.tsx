'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { TargetPlatform, TokenFormData } from '@/types/launch';
import { getPlatformById } from '@/config/platforms';
import { useQuote } from '@/hooks/useQuote';
import { useLaunchIntent } from '@/hooks/useLaunchIntent';
import { ConnectWallet } from '@/components/launch/ConnectWallet';
import { PlatformSelector } from '@/components/launch/PlatformSelector';
import { TokenDetailsForm } from '@/components/launch/TokenDetailsForm';
import { QuoteBreakdown } from '@/components/launch/QuoteBreakdown';
import { ProgressModal } from '@/components/launch/ProgressModal';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { isValidSolanaAddress } from '@/lib/solana';
import { Rocket, ShieldAlert } from 'lucide-react';

export default function LaunchTerminalPage() {
  const { address, isConnected } = useAccount();

  // Form State
  const [selectedPlatform, setSelectedPlatform] =
    useState<TargetPlatform>('PUMP_FUN');
  const [solanaAddress, setSolanaAddress] = useState<string>('');
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    description: '',
    imageFile: null,
    imagePreviewUrl: null,
    twitter: '',
    telegram: '',
    website: '',
    devBuyAmount: '',
  });

  // Modal / Execution State
  const [activeLaunchId, setActiveLaunchId] = useState<string | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const platformInfo = getPlatformById(selectedPlatform);
  const requiresSolana = platformInfo?.requiresSolanaAddress ?? false;

  // Real-time Quote Calculation via backend
  const { data: quote, isLoading: isQuoteLoading } = useQuote({
    walletAddress: address,
    targetChain: platformInfo?.chain,
    targetPlatform: selectedPlatform,
    devBuyAmount: formData.devBuyAmount || undefined,
  });

  const { executeLaunch, isExecuting, currentStep } = useLaunchIntent();

  const handleFormDataChange = (fields: Partial<TokenFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    setFormError(null);
  };

  const handleLaunch = async () => {
    setFormError(null);

    if (!isConnected || !address) {
      setFormError('Please connect your EVM wallet first.');
      return;
    }

    if (!formData.name.trim() || !formData.symbol.trim()) {
      setFormError('Please enter a valid token name and ticker symbol.');
      return;
    }

    if (requiresSolana && !isValidSolanaAddress(solanaAddress)) {
      setFormError('Please provide a valid Solana address for Pump.fun dev ownership.');
      return;
    }

    if (!quote) {
      setFormError('Waiting for guaranteed fee quote from backend.');
      return;
    }

    try {
      const launchResult = await executeLaunch(quote, formData, solanaAddress);
      setActiveLaunchId(launchResult.launchId);
      setShowProgressModal(true);
    } catch (err) {
      console.error('Launch submission error:', err);
      setFormError((err as Error).message || 'Failed to submit launch intent.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
          <Rocket className="w-7 h-7 text-primary" />
          Multiplatform Meme Token Terminal
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Configure metadata and deploy cross-chain in a single atomic transaction paying USDC on Base.
        </p>
      </div>

      {/* Main Form Container */}
      <Card className="flex flex-col gap-8">
        {/* 1. Wallet Setup */}
        <ConnectWallet
          requiresSolana={requiresSolana}
          solanaAddress={solanaAddress}
          onSolanaAddressChange={setSolanaAddress}
        />

        {/* 2. Platform Selector */}
        <PlatformSelector
          selectedPlatform={selectedPlatform}
          onSelect={setSelectedPlatform}
        />

        {/* 3. Token Details Form */}
        <TokenDetailsForm
          formData={formData}
          onChange={handleFormDataChange}
        />

        {/* 4. Quote Breakdown */}
        <QuoteBreakdown quote={quote} isLoading={isQuoteLoading} />

        {/* Error Alert */}
        {formError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 5. Launch CTA Button */}
        <Button
          variant="gradient"
          size="lg"
          onClick={handleLaunch}
          isLoading={isExecuting}
          disabled={!isConnected || isQuoteLoading}
          className="w-full text-base py-4 font-bold shadow-2xl shadow-indigo-500/30"
        >
          {isExecuting
            ? `Processing (${currentStep})...`
            : isConnected
            ? `Sign & Launch on ${selectedPlatform}`
            : 'Connect EVM Wallet to Launch'}
        </Button>
      </Card>

      {/* Real-time WebSocket Status Modal */}
      {showProgressModal && activeLaunchId && (
        <ProgressModal
          launchId={activeLaunchId}
          platform={selectedPlatform}
          tokenSymbol={formData.symbol || 'TOKEN'}
          onClose={() => setShowProgressModal(false)}
        />
      )}
    </div>
  );
}
