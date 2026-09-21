'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { base, bsc } from 'wagmi/chains';
import { wagmiConfig, projectId, metadata } from '@/config/appkit.config';
import { WagmiProvider } from 'wagmi';

if (typeof window !== 'undefined' && projectId) {
  try {
    createAppKit({
      wagmiConfig,
      projectId,
      themeMode: 'dark',
      defaultChain: base,
      metadata,
      features: {
        analytics: false,
        email: false,
        socials: [],
      },
    });
  } catch (err) {
    console.warn('AppKit initialization notice:', err);
  }
}

export function AppKitProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 30 * 1000,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
