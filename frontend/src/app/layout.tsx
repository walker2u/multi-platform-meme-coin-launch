import type { Metadata } from 'next';
import './globals.css';
import { AppKitProvider } from '@/components/providers/AppKitProvider';
import { SocketProvider } from '@/components/providers/SocketProvider';

export const metadata: Metadata = {
  title: 'Multiplatform Meme Coin Launchpad | Cross-Chain Instant Relayer',
  description:
    'Deploy and snipe meme coins across Solana (Pump.fun), Base (Pons, Genius), and BNB (Four.meme) paying only USDC on Base.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#090A0F] text-slate-100 antialiased selection:bg-primary/30 selection:text-white">
        <AppKitProvider>
          <SocketProvider>
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-crypto-gradient flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/25">
                    M
                  </div>
                  <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                    MultiLaunch <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary font-semibold">Relayer</span>
                  </span>
                </a>

                <div className="flex items-center gap-4">
                  <a
                    href="/launch"
                    className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-surface-light border border-white/10 hover:border-primary/50 text-white transition-all shadow-sm"
                  >
                    Launch Terminal
                  </a>
                </div>
              </div>
            </header>

            <main>{children}</main>
          </SocketProvider>
        </AppKitProvider>
      </body>
    </html>
  );
}
