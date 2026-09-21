import React from 'react';
import Link from 'next/link';
import { Rocket, ShieldCheck, Zap, ArrowRight, Layers, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-primary/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <section className="max-w-6xl mx-auto px-4 pt-20 pb-28 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-primary mb-8 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5" />
          <span>Cross-Chain Intent Settlement Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1]">
          Launch Meme Coins Everywhere.{' '}
          <span className="text-transparent bg-clip-text bg-crypto-gradient">
            Pay Only Once on Base.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Deploy on <strong>Pump.fun (Solana)</strong>, <strong>Four.meme (BNB)</strong>, and <strong>Base</strong> without holding native gas tokens. Pay from any EVM chain via LI.FI bridge and swap into Base USDC Escrow to trigger automated cross-chain relayer deployments.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/launch">
            <Button variant="gradient" size="lg" className="shadow-2xl shadow-indigo-500/30 gap-2">
              <Rocket className="w-5 h-5" />
              Open Launch Terminal
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="lg">
              Documentation & Specs
            </Button>
          </a>
        </div>

        {/* Feature Highlights */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl text-left">
          <div className="p-6 rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Zero Gas Complexity</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No need to bridge funds or buy BNB/SOL. Everything settles seamlessly in USDC on Base via automated relayer queues.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-accent-solana/20 flex items-center justify-center text-accent-solana mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Multi-Chain Routing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct integration with Pump.fun trade-local APIs, Four.meme factory, Pons V2, and Genius.fun contracts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-surface/60 border border-white/10 backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">EIP-712 Protected</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict cryptographic intents with guaranteed fee quotes, automated nonces, and real-time WebSocket state broadcasting.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
